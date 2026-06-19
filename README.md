<div align="center">

<img src="public/logo/alaayman.png" alt="Wedding Logo" width="160" />

# ✨ Wedding Invitation

**A cinematic, luxury digital wedding invitation built with Next.js 15**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Website-gold?style=for-the-badge&logo=vercel&logoColor=white&color=D4AF37)](https://wedding-invitation-9d7g-3c4nb46tu.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion)

---

*A scroll-driven cinematic experience with a luxury gold aesthetic, bilingual support (Arabic & English), and a fully responsive design.*

</div>

---

## ✨ Features

- 🎬 **Cinematic Scroll Experience** — 220-frame image sequence synced to scroll position, rendered on a high-DPI canvas
- 🌍 **Bilingual (AR / EN)** — Full RTL/LTR support with Cairo & Playfair Display fonts; language preference persisted in `localStorage`
- 🚀 **Smart Loading Flow** — Logo preloader → language selection (first visit only) → homepage; returning visitors skip straight in
- 💛 **Luxury Gold Aesthetic** — Deep black backgrounds, animated gold shimmer text, glass-morphism cards, gold particles
- 📖 **Couple's Journey Timeline** — Animated timeline of 6 milestone events from first meeting to wedding day
- 🖼️ **Masonry Photo Gallery** — Lightbox viewer with keyboard navigation
- 📍 **Venue Section** — Embedded map with get-directions CTA
- ⏱️ **Live Countdown** — Real-time countdown to the wedding date
- 📋 **RSVP Form** — Guest name, phone, attendance status, guest count — saved via API to a database
- 📜 **Guest Guidelines** — Elegant 6-card grid covering dress code, photography, children policy, and more
- 📱 **Fully Responsive** — Optimised for mobile, tablet, and desktop
- 🎞️ **Smooth Scrolling** — Lenis smooth scroll integrated with GSAP ScrollTrigger

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Animation | Framer Motion 11 + GSAP 3 + ScrollTrigger |
| Smooth Scroll | [Lenis](https://github.com/darkroomengineering/lenis) |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Fonts | Google Fonts — Playfair Display · Montserrat · Cairo |
| Deployment | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
wedding-invitation/
├── app/
│   ├── api/
│   │   └── rsvp/           # RSVP API route (POST)
│   ├── globals.css          # Design tokens, animations, component styles
│   ├── layout.tsx           # Root layout with font variables + LanguageProvider
│   └── page.tsx             # Main page — orchestrates all sections
│
├── components/
│   ├── HeroSequence.tsx     # Canvas frame sequence + loading/lang overlays
│   ├── CoupleStory.tsx      # Animated timeline
│   ├── Gallery.tsx          # Masonry grid + lightbox
│   ├── Venue.tsx            # Map embed + directions
│   ├── Countdown.tsx        # Live countdown timer
│   ├── RSVPForm.tsx         # RSVP form with validation
│   ├── Navbar.tsx           # Fixed nav with scroll-aware styling
│   ├── Footer.tsx           # Monogram + rings + hashtag
│   └── LanguageSwitcher.tsx # In-app language toggle button
│
├── hooks/
│   └── useLanguage.ts       # Language context — lang, setLang, toggleLang, isRTL
│
├── lib/
│   ├── translations.ts      # All UI strings in EN + AR
│   ├── imageSequence.ts     # Frame loader with chunked preloading + canvas draw
│   └── gsap.ts              # GSAP + ScrollTrigger registration
│
├── prisma/
│   └── schema.prisma        # RSVP model
│
└── public/
    ├── frames/              # frame_011.jpg → frame_230.jpg (220 frames)
    ├── images/              # gallery-1.jpeg → gallery-6.jpeg
    └── logo/
        └── alaayman.png     # Wedding monogram logo
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/wedding-invitation.git
cd wedding-invitation

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Set up the database
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# For production (PostgreSQL)
# DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

---

## 🖼️ Adding Your Frame Sequence

The hero background is driven by a 220-frame image sequence.

1. Export your video as individual JPEG frames
2. Name them `frame_011.jpg` through `frame_230.jpg` (3-digit zero-padded)
3. Place them in `/public/frames/`
4. Adjust `TOTAL_FRAMES` in `HeroSequence.tsx` if your count differs

```typescript
// HeroSequence.tsx
const TOTAL_FRAMES = 220; // adjust to match your frame count
```

---

## 📷 Adding Gallery Photos

Replace the placeholder files in `/public/images/`:

```
public/images/
├── gallery-1.jpeg
├── gallery-2.jpeg
├── gallery-3.jpeg
├── gallery-4.jpeg
├── gallery-5.jpeg
└── gallery-6.jpeg
```

The masonry layout is automatic — no code changes needed.

---

## 🌍 Customising Content

All text content lives in a single file:

```
lib/translations.ts
```

Edit the `en` and `ar` objects to update:
- Couple names, tagline, subtitle
- Wedding date, time, venue, dress code
- Couple's journey timeline events
- Guest guidelines
- RSVP deadline
- Footer hashtag

---

## 🗃️ RSVP Data

RSVPs are stored via Prisma. To view submissions:

```bash
npx prisma studio
```

This opens a browser-based GUI at [http://localhost:5555](http://localhost:5555).

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set the `DATABASE_URL` environment variable in your Vercel project settings for production.

> **Note:** For production, switch from SQLite to PostgreSQL (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)).

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--gold-primary` | `#D4AF37` | Accents, labels, borders |
| `--gold-light` | `#F6E7A9` | Shimmer highlight |
| `--gold-dark` | `#AA7C11` | Gradient start |
| `--bg-dark` | `#050505` | Page background |
| `--bg-card` | `rgba(12,12,14,0.7)` | Glass cards |
| `--text-primary` | `#F3F4F6` | Body text |
| `--text-muted` | `#9CA3AF` | Secondary text |

---

## 📄 License

This project is private and intended for personal use.
Not licensed for redistribution or resale.

---

<div align="center">

*Made with ♥*

</div>
