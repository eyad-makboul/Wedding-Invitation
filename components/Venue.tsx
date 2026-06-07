'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { MapPin, Navigation } from 'lucide-react';

export function Venue() {
  const { t, isRTL } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={ref} id="venue" className={`standalone-section venue-standalone ${isRTL ? 'rtl' : ''}`}>
      {/* Parallax BG */}
      <motion.div className="venue-bg-layer" style={{ y }} />

      <div className="section-container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading">{t.venueTitle}</h2>
          <div className="gold-divider mx-auto" />
        </motion.div>

        <div className="venue-content">
          {/* Map */}
          <motion.div
            className="venue-map-container"
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              className="venue-map-wrapper"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
              }}
            >
              <div style={{ textAlign: 'center', padding: '24px', color: '#f3f4f6', maxWidth: '420px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Map Disabled</h3>
                <p style={{ marginBottom: '16px', color: '#9ca3af' }}>
                  Google Maps has been disabled to avoid external loading errors.
                </p>
                <a
                  href="https://maps.google.com/?q=Grand+Royal+Hall+Cairo+Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold-full"
                >
                  Open Map in Google Maps
                </a>
              </div>
            </div>
          </motion.div>

          {/* Venue Info */}
          <motion.div
            className="venue-info"
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="venue-info-glass">
              <MapPin size={24} className="text-gold mb-4" />
              <h3 className="venue-name-heading gold-shimmer">{t.venueName}</h3>
              <p className="venue-address-text">{t.venueAddress}</p>

              <div className="venue-divider" />

              <div className="venue-actions-stack">
                <a
                  href="https://maps.google.com/?q=Grand+Royal+Hall+Cairo+Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold-full"
                >
                  <MapPin size={18} />
                  {t.venueOpenMap}
                </a>
                <a
                  href="https://maps.google.com/maps/dir//Cairo+Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-full"
                >
                  <Navigation size={18} />
                  {t.venueGetDirections}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
