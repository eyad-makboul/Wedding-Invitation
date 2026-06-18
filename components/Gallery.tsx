'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const GALLERY_ITEMS = [
  { id: 1, src: '/images/gallery-2.jpeg', alt: 'Couple photo 1', span: 'tall' },
  { id: 2, src: '/images/gallery-1.jpeg', alt: 'Couple photo 2', span: 'wide' },
  { id: 3, src: '/images/gallery-3.jpeg', alt: 'Couple photo 3', span: 'normal' },
  { id: 4, src: '/images/gallery-4.jpeg', alt: 'Couple photo 4', span: 'normal' },
  { id: 5, src: '/images/gallery-5.jpeg', alt: 'Couple photo 5', span: 'tall' },
  { id: 6, src: '/images/gallery-6.jpeg', alt: 'Couple photo 6', span: 'wide' },
];

export function Gallery() {
  const { t, isRTL } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevItem = useCallback(() =>
    setLightboxIndex(i => i !== null ? (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : null), []);
  const nextItem = useCallback(() =>
    setLightboxIndex(i => i !== null ? (i + 1) % GALLERY_ITEMS.length : null), []);

  return (
    <section id="gallery" className={`standalone-section gallery-standalone ${isRTL ? 'rtl' : ''}`}>
      <div className="section-container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading">{t.galleryTitle}</h2>
          <div className="gold-divider mx-auto" />
          <p className="section-subtitle">
            {t.gallerySubtitle.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </p>
        </motion.div>

        <div className="masonry-grid">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              className={`masonry-item masonry-${item.span}`}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => openLightbox(i)}
            >
              <div className="masonry-img-wrapper">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="masonry-placeholder"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  loading="lazy"
                />
                <motion.div
                  className="masonry-overlay"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ZoomIn size={32} color="#D4AF37" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={GALLERY_ITEMS[lightboxIndex].src}
                alt={GALLERY_ITEMS[lightboxIndex].alt}
                className="lightbox-img"
                style={{ objectFit: 'contain' }}
              />
              <button className="lightbox-close" onClick={closeLightbox}>
                <X size={24} />
              </button>
              <button className="lightbox-prev" onClick={prevItem}>
                <ChevronLeft size={28} />
              </button>
              <button className="lightbox-next" onClick={nextItem}>
                <ChevronRight size={28} />
              </button>
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {GALLERY_ITEMS.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}