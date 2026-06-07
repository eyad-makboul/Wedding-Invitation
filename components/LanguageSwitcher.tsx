'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';

export function LanguageSwitcher() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <motion.button
      onClick={toggleLang}
      className="lang-switcher"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      aria-label={`Switch to ${lang === 'en' ? 'Arabic' : 'English'}`}
    >
      <span className="lang-switcher-text">{t.switchLang}</span>
      <span className="lang-switcher-dot" />
    </motion.button>
  );
}
