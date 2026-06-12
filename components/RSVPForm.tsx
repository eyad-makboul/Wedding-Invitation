'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { User, Phone, Users, CheckCircle, Heart, Send } from 'lucide-react';

type Status = 'attend' | 'not-attend' | '';

interface FormData {
  name: string;
  guests: string;
  status: Status;
}

interface FormErrors {
  name?: string;
  status?: string;
}

export function RSVPForm() {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState<FormData>({ name: '', guests: '1', status: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.status) errs.status = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, guests: Number(form.guests) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ ...errors, name: err.error || 'Submission failed' });
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setErrors({ ...errors, name: 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className={`standalone-section rsvp-standalone ${isRTL ? 'rtl' : ''}`}>
      {/* Ambient */}
      <div className="rsvp-glow" />
      <div className="rsvp-glow rsvp-glow-2" />

      <div className="section-container rsvp-container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Heart className="rsvp-heart" />
          <h2 className="section-heading">{t.rsvpTitle}</h2>
          <div className="gold-divider mx-auto" />
          <p className="section-subtitle">{t.rsvpSubtitle}</p>
        </motion.div>

        <motion.div
          className="rsvp-card"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="rsvp-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} className="text-gold" />
                    {t.rsvpName}
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t.rsvpName}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* Guests */}
                <div className="form-group">
                  <label className="form-label">
                    <Users size={16} className="text-gold" />
                    {t.rsvpGuests}
                  </label>
                  <div className="guests-counter">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setForm(f => ({ ...f, guests: String(Math.max(1, +f.guests - 1)) }))}
                    >−</button>
                    <span className="counter-value">{form.guests}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setForm(f => ({ ...f, guests: String(Math.min(20, +f.guests + 1)) }))}
                    >+</button>
                  </div>
                </div>

                {/* Attendance */}
                <div className="form-group">
                  <label className="form-label">
                    <CheckCircle size={16} className="text-gold" />
                    {t.rsvpStatus}
                  </label>
                  <div className="attendance-options">
                    {([['attend', t.rsvpAttend, '✓'], ['not-attend', t.rsvpNotAttend, '✗']] as const).map(([val, label, icon]) => (
                      <button
                        key={val}
                        type="button"
                        className={`attendance-btn ${form.status === val ? 'selected' : ''} ${val === 'attend' ? 'attend' : 'not-attend'}`}
                        onClick={() => setForm(f => ({ ...f, status: val }))}
                      >
                        <span className="attendance-icon">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.status && <span className="form-error">{errors.status}</span>}
                </div>

                {/* Deadline note */}
                <p className="rsvp-deadline">{t.rsvpDeadline}</p>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="loading-dots">
                      <span /><span /><span />
                    </span>
                  ) : (
                    <>
                      <Send size={18} />
                      {t.rsvpSubmit}
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="rsvp-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
                >
                  <Heart size={48} className="text-gold" />
                </motion.div>
                <motion.h3
                  className="success-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {t.rsvpSuccessTitle}
                </motion.h3>
                <motion.p
                  className="success-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {t.rsvpSuccessText}
                </motion.p>
                <motion.div
                  className="success-names gold-shimmer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {isRTL ? 'أيمن و آلاء' : 'Ayman & Alaa'}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
