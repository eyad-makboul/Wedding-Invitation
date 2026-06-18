'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

export function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className={`wedding-footer wedding-footer-dark ${isRTL ? 'rtl' : ''}`}>
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
          <p className="footer-message">{t.footerMessage}</p>

          <h3 className="footer-names gold-shimmer">{t.footerNames}</h3>

          <div className="gold-divider mx-auto" />

          <p className="footer-date">{t.footerDate}</p>

          {/* Instagram Link with Thank You Message to Asma'a */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ 
              color: 'rgba(212,175,55,0.8)', 
              fontSize: '20px', 
              fontStyle: 'italic',
              marginBottom: '4px',
              maxWidth: '320px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6',

            }}>
              {isRTL 
                ? "شكر خاص لأسماء، العقل المبدع وراء تصاميم الفرح الجميلة." 
                : "Special thanks to the official sponsor and the creative mind behind our celebration."
              }
            </p>
            
            {/* HTML Arrow pointing downward */}
            <div style={{ 
              color: '#D4AF37', 
              fontSize: '16px', 
              marginBottom: '12px'
            }}>
              ↓
            </div>

            <motion.a
              href="https://www.instagram.com/celiacraft24?igsh=djQybnZiYXJwNmNo"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08, borderColor: 'rgba(212,175,55,0.6)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '999px',
                background: 'rgba(212,175,55,0.06)',
                color: '#D4AF37',
                fontSize: '12px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Inline Instagram SVG */}
              <svg
                height={15}
                width={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : undefined }}>
                {isRTL ? 'صفحتها على إنستغرام' : 'Celia Craft'}
              </span>
            </motion.a>
          </div>

          {/* Decorative rings */}
          <div className="footer-rings" aria-hidden="true">
            <span className="ring ring-left" />
            <span className="ring ring-right" />
          </div>
        </motion.div>

        <motion.div
          className="footer-credit"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span>{isRTL ? 'صُنع بحب من' : 'Made with love by'}</span>
          
          <a
            href="https://github.com/eyad-makboul"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: 'rgba(212,175,55,0.7)',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
          >
            {/* Inline GitHub SVG */}
            <svg 
              height={13} 
              width={13} 
              viewBox="0 0 16 16" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>Eyad</span>
          </a>
        </motion.div>
      </div>
    </footer>
  );
}