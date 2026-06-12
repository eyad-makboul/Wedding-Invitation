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
            style={{ width: "100%", height: "100%", minHeight: "400px" }}
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="venue-map-wrapper" style={{ width: "100%", height: "100%", minHeight: "400px" }}>
              <a
                href="https://maps.app.goo.gl/H7iE2NgMku4EM2nq9?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  minHeight: "400px",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "24px",
                }}
              >
                <img
                  src="/images/venue.jpg"
                  alt="Viola Wedding Hall"
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "400px",
                    objectFit: "cover",
                    borderRadius: "24px",
                    transition: "0.5s",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.3), transparent)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "24px",
                    right: "24px",
                    color: "white",
                    zIndex: 2,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.8rem",
                      marginBottom: "8px",
                      color: "#D4AF37",
                      fontFamily: "serif"
                    }}
                  >
                    Viola Wedding Hall
                  </h3>

                  <p
                    style={{
                      color: "#e5e7eb",
                      fontSize: ".95rem",
                    }}
                  >
                    ✨ Tap to Open Location
                  </p>
                </div>
              </a>
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
                  href="https://maps.app.goo.gl/H7iE2NgMku4EM2nq9?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold-full"
                >
                  <MapPin size={18} />
                  {t.venueOpenMap}
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Lusinda+Resort+%26+Spa+Suez"
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