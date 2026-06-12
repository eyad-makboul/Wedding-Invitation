'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { ImageSequenceLoader } from '@/lib/imageSequence';
import { registerGSAPPlugins, gsap, ScrollTrigger } from '@/lib/gsap';
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
  const [currentFrame, setCurrentFrame] = useState(0);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const { t, isRTL, setLang } = useLanguage();

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !loaderRef.current) return;
    loaderRef.current.drawFrame(canvas, index);
  }, []);

  useEffect(() => {
    registerGSAPPlugins();
    const getScrollProgress = () => {
      const scrollElement = document.scrollingElement || document.documentElement;
      const scrollTop = scrollElement.scrollTop || window.pageYOffset || 0;
      const docHeight = scrollElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    };
    const handleScroll = () => {
      const progress = getScrollProgress();
      const targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
      frameRef.current.current = targetFrame;
      setCurrentFrame(targetFrame);
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

  useEffect(() => {
    document.body.style.overflow = !isReady ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
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

  useEffect(() => {
    if (!isReady) return;
    const renderLoop = () => {
      drawFrame(frameRef.current.current);
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };
    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isReady, drawFrame]);

  // Guidelines data from translations
  const guidelines = t.guidelinesItems as readonly { icon: string; title: string; text: string }[];

  return (
    <>
      {overlayRoot && (!isReady || showLangScreen) && createPortal(
        <AnimatePresence mode="wait">
          {!showLangScreen && (
            <motion.div key="loading" className="loading-screen" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
              <div className="loading-content">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, filter: 'blur(16px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
                >
                  <img src="/logo/alaayman.png" alt="Ayman & Alaa" style={{ width: '200px', height: 'auto', filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.5))' }} />
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
                <motion.p className="loading-text" animate={{ opacity: allFramesLoaded ? 1 : [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: allFramesLoaded ? 0 : Infinity }}>
                  {allFramesLoaded ? '✦ جاهز ✦' : `${Math.round(loadProgress * 100)}%`}
                </motion.p>
                {allFramesLoaded && (
                  <motion.button className="ready-button" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} onClick={() => setShowLangScreen(true)}>
                    ابدأ · Begin
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {showLangScreen && (
            <motion.div key="language" className="loading-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', maxWidth: '400px', width: '100%', padding: '0 24px' }}
              >
                <motion.img src="/logo/alaayman.png" alt="Ayman & Alaa" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 0.85, scale: 1 }} transition={{ duration: 0.8 }} style={{ width: '110px', filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.35))' }} />
                <div style={{ width: '50px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '10px' }}>Welcome · مرحباً</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px', letterSpacing: '1px' }}>Choose your language · اختر لغتك</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  {([
                    { code: 'ar' as Language, label: 'العربية', sub: 'Arabic', font: 'Cairo, sans-serif' },
                    { code: 'en' as Language, label: 'English', sub: 'الإنجليزية', font: 'Playfair Display, serif' },
                  ]).map((lng, i) => (
                    <motion.button
                      key={lng.code}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setLang(lng.code); setShowLangScreen(false); setIsReady(true); onReady?.(); }}
                      style={{ flex: 1, padding: '22px 16px', background: 'rgba(12,12,14,0.8)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backdropFilter: 'blur(16px)', transition: 'border-color 0.3s ease', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                    >
                      <span style={{ fontSize: '1.35rem', color: '#fff', fontFamily: lng.font, fontWeight: 300 }}>{lng.label}</span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '1px' }}>{lng.sub}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        overlayRoot
      )}

      <div className="fixed-background-container">
        <canvas ref={canvasRef} className="sequence-canvas" />
        <div className="cinematic-overlay-top" />
        <div className="cinematic-overlay-bottom" />
        <div className="vignette-overlay" />
        <GoldParticles />
      </div>

      {isReady && (
        <div ref={containerRef} className="hero-scroll-content">

          {/* Section 1: Hero */}
          <section id="hero" className="standalone-section hero-card-section">
            <div className="section-container hero-glass-card" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.p className="hero-tagline" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1, delay: 0.3 }}>
                {t.heroTagline}
              </motion.p>
              <motion.h1
                className="hero-names gold-shimmer"
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.6 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 300, letterSpacing: isRTL ? '2px' : '4px' }}
              >
                {t.heroNames}
              </motion.h1>
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 1 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: 2 }}
              >
                {t.heroSubtitle.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </motion.p>
              <motion.div className="scroll-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}>
                <span className="scroll-text" style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined }}>{t.scrollToExplore}</span>
                <div className="scroll-mouse"><div className="scroll-wheel" /></div>
              </motion.div>
            </div>
          </section>

          {/* Section 2: Welcome */}
          <section id="welcome" className="standalone-section welcome-card-section">
            <div className="section-container welcome-glass-card" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div className="welcome-ornament" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
              >
                {t.welcomeTitle}
              </motion.h2>
              <motion.p
                className="section-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 2 }}
              >
                {t.welcomeText.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </motion.p>
              <motion.p
                className="section-subtext"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined, fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
              >
                {t.welcomeSubtext}
              </motion.p>
              <motion.div className="welcome-ornament" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} />
            </div>
          </section>

          {/* Section 3: Details */}
          <section id="details" className="standalone-section details-card-section">
            <div className="section-container details-glass-card" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
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
                    key={i}
                    className="glass-card"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
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

          {/* Section 4: Guidelines */}
          <section id="guidelines" className="standalone-section">
            <div className="section-container" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{ marginBottom: '48px' }}
              >
                <h2
                  style={{
                    fontFamily: isRTL ? 'Cairo, sans-serif' : 'Playfair Display, serif',
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    fontWeight: 300,
                    color: '#fff',
                    marginBottom: '8px',
                  }}
                >
                  {t.guidelinesTitle}
                </h2>
                <div className="gold-divider mx-auto" />
              </motion.div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                width: '100%',
              }}>
                {guidelines.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    style={{
                      background: 'rgba(12,12,14,0.6)',
                      border: '1px solid rgba(212,175,55,0.15)',
                      borderRadius: '16px',
                      padding: '28px 24px',
                      backdropFilter: 'blur(8px)',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                    whileHover={{
                      borderColor: 'rgba(212,175,55,0.4)',
                      boxShadow: '0 8px 24px rgba(212,175,55,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                      <div>
                        <h3 style={{
                          fontFamily: isRTL ? 'Cairo, sans-serif' : undefined,
                          fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
                          fontWeight: 500,
                          color: '#D4AF37',
                          marginBottom: '8px',
                          letterSpacing: isRTL ? '0' : '0.5px',
                        }}>
                          {item.title}
                        </h3>
                        <p style={{
                          fontFamily: isRTL ? 'Cairo, sans-serif' : undefined,
                          fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
                          color: '#9CA3AF',
                          lineHeight: 1.8,
                        }}>
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

// ---- Gold Particles ----
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

  useEffect(() => {
    setParticles(generateParticles());
  }, []);

  if (!particles.length) return null;

  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="gold-particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -120, 0], opacity: [0, 0.8, 0], x: [0, p.randomX, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}