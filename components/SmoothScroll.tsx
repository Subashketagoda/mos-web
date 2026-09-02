'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.1, // Smooth linear momentum on desktop wheel
      wheelMultiplier: 1.1, // Natural wheel response
      smoothWheel: true,
      syncTouch: false, // Keep touch scrolling 100% native on mobile so it NEVER clips or jumps
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      autoResize: true,
      infinite: false,
    });

    // Global Lenis ref for anchor link clicks
    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Intercept in-page hash links for silky smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;

      const targetEl = document.querySelector(href) as HTMLElement | null;
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, {
          offset: -40,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}
