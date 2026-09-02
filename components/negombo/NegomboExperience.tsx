'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function NegomboExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.1]);
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.7]);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden bg-[#03150F] border-y border-[#D4AF37]/30 flex items-center justify-center"
    >
      {/* Scaling Parallax Image */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-cover bg-center transform-gpu will-change-transform"
        style={{
          scale,
          y,
          backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=85')`,
        }}
      />

      {/* Emerald Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#03150F] via-[#041c14]/60 to-[#03150F]" />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      {/* Minimalist Overlay Typography */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gap-4"
      >
        <span className="text-xs sm:text-sm font-mono tracking-[0.16em] sm:tracking-[0.4em] text-[#D4AF37] uppercase font-semibold">
          ✦ TROPICAL SANCTUARY • NEGOMBO ✦
        </span>

        <h2 className="font-serif text-3xl sm:text-7xl md:text-8xl font-light text-white tracking-tight uppercase leading-none">
          THE MOSPHERE <br />
          <span className="italic font-normal text-[#F3E5AB]">EXPERIENCE</span>
        </h2>

        <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md mx-auto font-light tracking-widest uppercase mt-2">
          Gold Rituals • Coastal Serenity • Restorative Luxury
        </p>
      </motion.div>
    </section>
  );
}
