'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const { t, isRTL } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const handleScroll = () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const links = [
    { id: 'story', label: t.navDetails },
    { id: 'venue', label: t.navVenue },
    { id: 'gallery', label: t.navGallery },
    { id: 'rsvp', label: t.navRSVP },
  ];

  return (
    <>
      <motion.nav
        ref={navRef}
        className={`navbar ${isRTL ? 'rtl' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <button className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="nav-logo-text gold-shimmer"><img  src="/logo/alaayman.png" alt='A & A' style={{width:'50px'}}/></span>
        </button>

        <div className="nav-links">
          {links.map(link => (
            <button key={link.id} className="nav-link" onClick={() => scrollTo(link.id)}>
              {link.label}
            </button>
          ))}
        </div>

        <LanguageSwitcher />

        <button
          className={`nav-toggle ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        >
          <span />
          <span />
          <span />
        </button>
      </motion.nav>

      {mobileOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-close" onClick={() => setMobileOpen(false)}>
            ×
          </button>
          <div className="mobile-menu-links">
            {links.map((link) => (
              <button key={link.id} className="mobile-menu-link" onClick={() => scrollTo(link.id)}>
                {link.label}
              </button>
            ))}
          </div>
          <div className="mobile-menu-language">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}
