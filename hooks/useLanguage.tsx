'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '@/lib/translations';
import { translations } from '@/lib/translations';

interface LanguageContextType {
  lang: Language;
  t: typeof translations.en;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
  setLang: () => {},
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('wedding-lang') as Language | null;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('wedding-lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      t: translations[lang] as typeof translations.en,
      toggleLang,
      setLang,
      isRTL: lang === 'ar',
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}