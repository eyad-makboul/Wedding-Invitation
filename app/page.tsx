'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Navbar } from '@/components/Navbar';
const HeroSequence = dynamic(
  () => import('@/components/HeroSequence').then((mod) => mod.HeroSequence),
  { ssr: false }
);
import { CoupleStory } from '@/components/CoupleStory';
import { Countdown } from '@/components/Countdown';
import { Gallery } from '@/components/Gallery';
import { RSVPForm } from '@/components/RSVPForm';
import { Venue } from '@/components/Venue';
import { Footer } from '@/components/Footer';
import { registerGSAPPlugins, ScrollTrigger, gsap } from '@/lib/gsap';

export default function Home() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    registerGSAPPlugins();

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main>
      {appReady && <Navbar />}
      <HeroSequence onReady={() => setAppReady(true)} />
      {appReady && (
        <>
          <CoupleStory />
          <Gallery />
          <Venue />
          <Countdown />
          <RSVPForm />
          <Footer />
        </>
      )}
    </main>
  );
};

