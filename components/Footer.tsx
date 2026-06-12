'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart } from 'lucide-react';

export function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className={`wedding-footer ${isRTL ? 'rtl' : ''}`}>
      {/* Decorative top border */}
      <div className="footer-border" />

      {/* Floral Decoration */}
      <div className="footer-floral left" aria-hidden="true">✿</div>
      <div className="footer-floral right" aria-hidden="true">✿</div>

      <div className="footer-container">
        <motion.div
          className="footer-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Monogram */}

          <p className="footer-message">{t.footerMessage}</p>

          <h3 className="footer-names gold-shimmer">{t.footerNames}</h3>

          <div className="gold-divider mx-auto" />

          <p className="footer-date">{t.footerDate}</p>
          {/* Decorative rings */}
          <div className="footer-rings" aria-hidden="true">
            <span className="ring ring-left" />
            <span className="ring ring-right" />
          </div>
        </motion.div>

        <motion.p
          className="footer-credit"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          Made with{' '}
          <Heart size={12} className="inline text-gold" />{' '}
          for Ayman & Alaa&apos;s Special Day
        </motion.p>
      </div>
    </footer>
  );
}
