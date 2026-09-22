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
      duration: 1.15, // Luxury responsive gliding deceleration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential luxury ease-out
      wheelMultiplier: 1.0, // 1:1 natural wheel response without jumps
      touchMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false, // Keep touch scrolling 100% native on mobile so it NEVER clips or jumps
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      autoResize: true,
      autoRaf: true, // Native internal high-performance RAF loop in Lenis 1.3
    });

    // Global Lenis ref for anchor link clicks
    (window as any).__lenis = lenis;

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
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}
