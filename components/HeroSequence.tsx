'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { ImageSequenceLoader } from '@/lib/imageSequence';
import { registerGSAPPlugins } from '@/lib/gsap';
import type { Language } from '@/lib/translations';

const TOTAL_FRAMES = 220;
const INITIAL_LOAD = 30;

export interface HeroSequenceProps {
  onReady?: () => void;
}

export function HeroSequence({ onReady }: HeroSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<ImageSequenceLoader | null>(null);
  const frameRef = useRef({ current: 0 });
  const animFrameRef = useRef<number>(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [allFramesLoaded, setAllFramesLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showLangScreen, setShowLangScreen] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const { t, isRTL, setLang } = useLanguage();

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !loaderRef.current) return;
    loaderRef.current.drawFrame(canvas, index);
  }, []);


  // ── Scroll / frame logic ─────────────────────────────────────────────────
  useEffect(() => {
    registerGSAPPlugins();

    const getScrollProgress = () => {
      const el = document.scrollingElement || document.documentElement;
      const scrollTop = el.scrollTop || window.pageYOffset || 0;
      const docHeight = el.scrollHeight - window.innerHeight;
      return docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    };

    const handleScroll = () => {
      const progress = getScrollProgress();
      const targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
      frameRef.current.current = targetFrame;
      if (loaderRef.current && !loaderRef.current.isFrameLoaded(targetFrame)) {
        loaderRef.current.loadFrame(targetFrame).catch(() => undefined);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });

    const loader = new ImageSequenceLoader({
      totalFrames: TOTAL_FRAMES,
      initialLoad: INITIAL_LOAD,
      basePath: '/frames',
      extension: 'jpg',
      onProgress: (loaded) => { setLoadProgress(loaded / TOTAL_FRAMES); },
      onReady: () => {
        loader.preloadAll().then(() => {
          setAllFramesLoaded(true);
          setLoadProgress(1);
        });
      },
    });

    loaderRef.current = loader;
    loader.preloadInitial(INITIAL_LOAD);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawFrame]);

  // ── Auto-advance when loading finishes ───────────────────────────────────
  useEffect(() => {
    if (!allFramesLoaded) return;

    // Always show language selection
    setShowLangScreen(true);
  }, [allFramesLoaded]);

  // ── Portal root ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let root = document.getElementById('global-loading-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'global-loading-root';
      document.body.appendChild(root);
    }
    setOverlayRoot(root as HTMLElement);
  }, []);

  // ── Lock scroll while overlay is visible ────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = !isReady ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isReady]);

  // ── Canvas resize ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      drawFrame(frameRef.current.current);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isReady, drawFrame]);

  // ── Render loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    const loop = () => {
      drawFrame(frameRef.current.current);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isReady, drawFrame]);

  const guidelines = t.guidelinesItems as readonly { icon: string; title: string; text: string }[];

  // ── Language select handler ──────────────────────────────────────────────
  const handleLangSelect = (code: Language) => {
    setLang(code);
    setShowLangScreen(false);
    setIsReady(true);
    onReady?.();
  };
  return (
    <>
      {/* ── Overlays ── */}
      {overlayRoot && createPortal(
        <AnimatePresence mode="wait">

          {/* Loading screen */}
          {!isReady && !showLangScreen && (
            <motion.div
              key="loading"
              className="loading-screen"
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
            >
              <div className="loading-content">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, filter: 'blur(16px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
                >
                  <img
                    src="/logo/alaayman.png"
                    alt="Ayman & Alaa"
                    style={{ width: '200px', height: 'auto', filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.5))' }}
                  />
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                  />
                </motion.div>

                <div className="loading-bar-container">
                  <motion.div className="loading-bar" style={{ scaleX: loadProgress }} />
                </div>

                <motion.p
                  className="loading-text"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {Math.round(loadProgress * 100)}%
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Language selection screen */}
          {showLangScreen && (
            <motion.div
              key="language"
              className="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '36px',
                  width: '100%',
                  maxWidth: '420px',
                  padding: '0 20px',
                }}
              >
                {/* Logo */}
                <motion.img
                  src="/logo/alaayman.png"
                  alt="Ayman & Alaa"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  transition={{ duration: 0.9 }}
                  style={{ width: '120px', filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.4))' }}
                />

                {/* Divider */}
                <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

                {/* Heading */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase', margin: 0 }}>
                    Welcome · مرحباً
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', letterSpacing: '0.5px', margin: 0 }}>
                    Choose your language · اختر لغتك
                  </p>
                </div>

                {/* Language buttons */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  width: '100%',
                  flexWrap: 'wrap',
                }}>
                  {([
                    { code: 'en' as Language, flag: '🇬🇧', label: 'English', font: 'Playfair Display, serif' },
                    { code: 'ar' as Language, flag: '🇪🇬', label: 'العربية', font: 'Cairo, sans-serif' },
                  ]).map((lng, i) => (
                    <motion.button
                      key={lng.code}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.35 + i * 0.12 }}
                      whileHover={{
                        scale: 1.04,
                        borderColor: 'rgba(212,175,55,0.7)',
                        boxShadow: '0 0 20px rgba(212,175,55,0.15)',
                      }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleLangSelect(lng.code)}
                      style={{
                        flex: '1 1 140px',
                        minHeight: '88px',
                        padding: '20px 16px',
                        background: 'rgba(12,12,14,0.85)',
                        border: '1px solid rgba(212,175,55,0.22)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{lng.flag}</span>
                      <span style={{
                        fontSize: '1.2rem',
                        color: '#fff',
                        fontFamily: lng.font,
                        fontWeight: 300,
                        letterSpacing: lng.code === 'en' ? '1px' : '0',
                      }}>
                        {lng.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6B7280', letterSpacing: '0.5px' }}>

                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>,
        overlayRoot
      )}

      {/* ── Fixed canvas background ── */}
      <div className="fixed-background-container">
        <canvas ref={canvasRef} className="sequence-canvas" />
        <div className="cinematic-overlay-top" />
        <div className="cinematic-overlay-bottom" />
        <div className="vignette-overlay" />
        <GoldParticles />
      </div>

      {/* ── Page content ── */}
      {isReady && (
        <div ref={containerRef} className="hero-scroll-content">

          {/* Section 1 — Hero */}
          <section id="hero" className="standalone-section hero-card-section">
            <div className="section-container hero-glass-card" dir={isRTL ? 'rtl' : 'ltr'}>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.4 }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}
              >
                <img
                  src="/logo/alaayman.png"
                  alt="Wedding Logo"
                  style={{
                    width: '260px',
                    maxWidth: '70vw',
                    filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))',
                  }}
                />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{
                  fontFamily: isRTL ? 'Cairo, sans-serif' : undefined,
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                  lineHeight: 2,
                  textAlign: 'center',
                }}
              >
                {t.heroSubtitle.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </motion.p>

              {/* Scroll Indicator — يظهر بعد 5 ثواني ويختفي بعد 5 ثواني */}
              <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: 10,
                  delay: 0,
                  times: [0, 0.5, 0.55, 0.95, 1],
                  ease: 'easeInOut',
                }}
              >
                <span
                  className="scroll-text"
                  style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined }}
                >
                  {t.scrollToExplore}
                </span>
                <div className="scroll-mouse">
                  <div className="scroll-wheel" />
                </div>
              </motion.div>

            </div>
          </section>

          {/* Section 2 — Welcome */}
          <section id="welcome" className="standalone-section welcome-card-section">
            <div className="section-container welcome-glass-card" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div className="welcome-ornament" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
              >
                {t.welcomeTitle}
              </motion.h2>
              <motion.p
                className="section-text"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 2 }}
              >
                {t.welcomeText.split('\n').map((line, i) => <span key={i} className="block">{line}</span>)}
              </motion.p>
              <motion.p
                className="section-subtext"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
              >
                {t.welcomeSubtext}
              </motion.p>
              <motion.div className="welcome-ornament" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} />
            </div>
          </section>

          {/* Section 3 — Details */}
          <section id="details" className="standalone-section details-card-section">
            <div className="section-container details-glass-card" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
              >
                {t.detailsTitle}
              </motion.h2>
              <div className="details-cards">
                {[
                  { label: t.detailsDateLabel, value: t.detailsDate, icon: '📅' },
                  { label: t.detailsTimeLabel, value: t.detailsTime, icon: '🕔' },
                  { label: t.detailsDressCode, value: t.detailsDressCodeValue, icon: '✨' },
                ].map((card, i) => (
                  <motion.div
                    key={i} className="glass-card"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                  >
                    <span className="card-icon">{card.icon}</span>
                    <span className="card-label" style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined }}>{card.label}</span>
                    <span className="card-value" style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>{card.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4 — Guidelines */}
          <section id="guidelines" className="standalone-section">
            <div className="section-container" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                style={{ marginBottom: '48px' }}
              >
                <h2 style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 300, color: '#fff', marginBottom: '8px' }}>
                  {t.guidelinesTitle}
                </h2>
                <div className="gold-divider mx-auto" />
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
                {guidelines.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    whileHover={{ borderColor: 'rgba(212,175,55,0.4)', boxShadow: '0 8px 24px rgba(212,175,55,0.08)' }}
                    style={{ background: 'rgba(12,12,14,0.6)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '16px', padding: '28px 24px', backdropFilter: 'blur(8px)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                      <div>
                        <h3 style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', fontWeight: 500, color: '#D4AF37', marginBottom: '8px', letterSpacing: isRTL ? '0' : '0.5px' }}>
                          {item.title}
                        </h3>
                        <p style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)', color: '#9CA3AF', lineHeight: 1.8 }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}
    </>
  );
}

// ── Gold Particles ────────────────────────────────────────────────────────────
const generateParticles = () => Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 4,
  randomX: (Math.random() - 0.5) * 60,
}));

function GoldParticles() {
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);
  useEffect(() => { setParticles(generateParticles()); }, []);
  if (!particles.length) return null;
  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id} className="gold-particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -120, 0], opacity: [0, 0.8, 0], x: [0, p.randomX, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}