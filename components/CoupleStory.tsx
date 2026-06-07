'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

export function CoupleStory() {
  const { t, isRTL } = useLanguage();
  const events = t.storyEvents as readonly { year: string; title: string; description: string }[];

  return (
    <section id="story" className={`standalone-section story-standalone ${isRTL ? 'rtl' : ''}`}>
      {/* Ambient Glow */}
      <div className="story-glow" />

      <div className="section-container">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-pretitle">{isRTL ? '♥' : '♥'}</p>
          <h2 className="section-heading">{t.storyTitle}</h2>
          <div className="gold-divider mx-auto" />
          <p className="section-subtitle">
            {t.storySubtitle.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="timeline-container">
          {/* Timeline line */}
          <motion.div
            className="timeline-line"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {events.map((event, i) => (
            <motion.div
              key={i}
              className={`timeline-item ${i % 2 === 0 ? 'timeline-left' : 'timeline-right'}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              {/* Dot */}
              <motion.div
                className="timeline-dot"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
              >
                <div className="timeline-dot-inner" />
              </motion.div>

              {/* Card */}
              <div className="timeline-card">
                <span className="timeline-year">{event.year}</span>
                <h3 className="timeline-title">{event.title}</h3>
                <p className="timeline-desc">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
