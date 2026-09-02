'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function FeaturedVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax scale effect as user scrolls
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.1]);
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.7]);

  return (
    <section
      ref={containerRef}
      className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden bg-[#070709] border-y border-white/5 flex items-center justify-center"
    >
      {/* Scaling Parallax Image */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-cover bg-center transform-gpu will-change-transform"
        style={{
          scale,
          y,
          backgroundImage: `url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=75')`,
        }}
      />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/40 to-[#070709]" />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      {/* Minimalist Overlay Typography */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center gap-4"
      >
        <span className="text-xs sm:text-sm font-mono tracking-[0.4em] text-mosphere-gold uppercase font-medium">
          ✦ ATMOSPHERE & CRAFT ✦
        </span>

        <h2 className="font-serif text-4xl sm:text-7xl md:text-8xl font-light text-white tracking-tight uppercase leading-none">
          THE MOSPHERE <br />
          <span className="italic font-normal text-mosphere-goldLight">EXPERIENCE</span>
        </h2>

        <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto font-light tracking-widest uppercase mt-2">
          Precision Architecture • Private Suites • Restorative Care
        </p>
      </motion.div>
    </section>
  );
}
