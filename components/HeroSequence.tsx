'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { ImageSequenceLoader } from '@/lib/imageSequence';
import { registerGSAPPlugins, gsap, ScrollTrigger } from '@/lib/gsap';

const TOTAL_FRAMES = 230;
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
  const [currentFrame, setCurrentFrame] = useState(0);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const { t, isRTL } = useLanguage();

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !loaderRef.current) return;
    loaderRef.current.drawFrame(canvas, index);
  }, []);
  useEffect(() => {
    registerGSAPPlugins();

    let targetFrame = 0;

    const getScrollProgress = () => {
      const scrollElement = document.scrollingElement || document.documentElement;
      const scrollTop = scrollElement.scrollTop || window.pageYOffset || 0;
      const docHeight = scrollElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    };

    const handleScroll = () => {
      const progress = getScrollProgress();
      targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
      frameRef.current.current = targetFrame;
      setCurrentFrame(targetFrame);
      if (loaderRef.current && !loaderRef.current.isFrameLoaded(targetFrame)) {
        loaderRef.current.loadFrame(targetFrame).catch(() => undefined);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });

    const renderLoop = () => {
      drawFrame(frameRef.current.current);
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    const loader = new ImageSequenceLoader({
      totalFrames: TOTAL_FRAMES,
      initialLoad: INITIAL_LOAD,
      basePath: '/frames',
      extension: 'jpg',
      onProgress: (loaded) => {
        setLoadProgress(loaded / TOTAL_FRAMES);
      },
      onReady: () => {
        // Load remaining frames and wait for user to start
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

  // create a portal root for the global loading overlay so it sits above all stacking contexts
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let root = document.getElementById('global-loading-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'global-loading-root';
      document.body.appendChild(root);
    }
    setOverlayRoot(root as HTMLElement);
    return () => {
      // keep the root in DOM (multiple mounts may reuse it); do not remove
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = !isReady ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    // Resize canvas and set initial pixel dimensions
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

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
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

  return (
    <>
      {overlayRoot && !isReady && createPortal(
        <AnimatePresence>
          <motion.div
            className="loading-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="loading-content">
              <div className="loading-monogram">
                <span>A</span>
                <span className="loading-ampersand">&</span>
                <span>A</span>
              </div>
              <div className="loading-bar-container">
                <motion.div
                  className="loading-bar"
                  style={{ scaleX: loadProgress }}
                />
              </div>
              <p className="loading-text">
                {allFramesLoaded ? 'جاهز! اضغط للمتابعة' : `${Math.round(loadProgress * 100)}%`}
              </p>
              {allFramesLoaded && (
                <button
                  className="ready-button"
                  onClick={() => {
                    setIsReady(true);
                    onReady?.();
                  }}
                >
                  Are you ready?
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        overlayRoot
      )}
      {/* Fixed Background Layer */}
      <div className="fixed-background-container">
        

        {/* Canvas */}
        <canvas ref={canvasRef} className="sequence-canvas" />

        

        {/* Cinematic Overlays */}
        <div className="cinematic-overlay-top" />
        <div className="cinematic-overlay-bottom" />
        <div className="vignette-overlay" />
        <GoldParticles />
      </div>

      {/* Scrollable Content (Hero, Welcome & Details Cards) */}
      {isReady && (
        <div ref={containerRef} className="hero-scroll-content">
          {/* Section 1: Hero */}
          <section id="hero" className="standalone-section hero-card-section">
            <div className="section-container hero-glass-card">
              <motion.p
                className="hero-tagline"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {t.heroTagline}
              </motion.p>
              <motion.h1
                className="hero-names gold-shimmer"
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.6 }}
              >
                {t.heroNames}
              </motion.h1>
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 1 }}
              >
                {t.heroSubtitle.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </motion.p>

              {/* Scroll Indicator */}
              <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
              >
                <span className="scroll-text">{t.scrollToExplore}</span>
                <div className="scroll-mouse">
                  <div className="scroll-wheel" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 2: Welcome */}
          <section id="welcome" className="standalone-section welcome-card-section">
            <div className="section-container welcome-glass-card">
              <motion.div
                className="welcome-ornament"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {t.welcomeTitle}
              </motion.h2>
              <motion.p
                className="section-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
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
              >
                {t.welcomeSubtext}
              </motion.p>
              <motion.div
                className="welcome-ornament"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </section>

          {/* Section 3: Details */}
          <section id="details" className="standalone-section details-card-section">
            <div className="section-container details-glass-card">
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {t.detailsTitle}
              </motion.h2>
              <div className="details-cards">
                {[
                  { label: t.detailsDateLabel, value: t.detailsDate, icon: '📅' },
                  { label: t.detailsTimeLabel, value: t.detailsTime, icon: '🕖' },
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
                    <span className="card-label">{card.label}</span>
                    <span className="card-value">{card.value}</span>
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

  if (!particles.length) {
    return null;
  }

  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="gold-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [0, 0.8, 0],
            x: [0, p.randomX, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
