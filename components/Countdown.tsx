'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

export function Countdown() {
  const { t } = useLanguage();
  const targetDate = new Date('2026-08-02T17:00:00');
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prevTime, setPrevTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const newTime = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
      setPrevTime(time);
      setTime(newTime);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { value: time.days, prev: prevTime.days, label: t.countdownDays },
    { value: time.hours, prev: prevTime.hours, label: t.countdownHours },
    { value: time.minutes, prev: prevTime.minutes, label: t.countdownMinutes },
    { value: time.seconds, prev: prevTime.seconds, label: t.countdownSeconds },
  ];

  return (
    <section id="countdown" className="standalone-section countdown-standalone">
      <div className="section-container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading">{t.countdownTitle}</h2>
          <div className="gold-divider mx-auto" />
        </motion.div>

        <div className="standalone-countdown-grid">
          {units.map((unit, i) => (
            <motion.div
              key={i}
              className="standalone-countdown-unit"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <div className="flip-container">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={unit.value}
                    className="flip-number"
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="standalone-countdown-label">{unit.label}</span>
              {i < units.length - 1 && <span className="countdown-colon">:</span>}
            </motion.div>
          ))}
        </div>

        <motion.p
          className="countdown-tagline"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          {t.countdownSubtext}
        </motion.p>
      </div>
    </section>
  );
}
