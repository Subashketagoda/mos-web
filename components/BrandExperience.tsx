'use client';

import React from 'react';
import { motion } from 'framer-motion';

const pillars = [
  {
    number: '01',
    word: 'QUALITY',
    subtitle: 'Bio-Active Formulas',
    description: 'We exclusively utilize internationally certified hair botox, marine keratin, and nutrient-dense botanical essences that heal and protect.',
  },
  {
    number: '02',
    word: 'STYLE',
    subtitle: 'Couture Architecture',
    description: 'Each haircut, dimensional balayage, and beard contour is engineered around your cranial shape, facial bone structure, and lifestyle.',
  },
  {
    number: '03',
    word: 'EXPERIENCE',
    subtitle: 'Private Sanctuary',
    description: 'A tranquil environment in Rajagiriya equipped with private gents suites, ladies styling lounges, and chilled herbal refreshments.',
  },
  {
    number: '04',
    word: 'DETAIL',
    subtitle: 'Zero Compromise',
    description: 'From hot towel aromatherapy and high-frequency ozone scalp therapy to microscopic edge refinement, nothing is rushed.',
  },
];

export default function BrandExperience() {
  return (
    <section className="py-28 sm:py-36 relative bg-[#060608] border-t border-white/5 overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-mosphere-gold/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-white/10 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-mosphere-gold font-semibold">04</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              THE DISTINCTION
            </span>
          </div>
          <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline uppercase">
            FOUR PILLARS OF MOSPHERE
          </span>
        </motion.div>

        {/* Oversized Typographic Pillars List */}
        <div className="flex flex-col divide-y divide-white/10">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.word}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="group py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center hover:bg-white/[0.015] transition-colors duration-300 px-2 sm:px-4 rounded-xl"
            >
              {/* Pillar Number */}
              <div className="lg:col-span-1 text-xs sm:text-sm font-mono text-mosphere-gold/60 group-hover:text-mosphere-gold transition-colors">
                {pillar.number}
              </div>

              {/* Massive Oversized Typographic Word */}
              <div className="lg:col-span-6">
                <h3 className="font-serif text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white/85 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                  {pillar.word}
                </h3>
              </div>

              {/* Pillar Description & Subtitle */}
              <div className="lg:col-span-5 flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-mosphere-gold font-medium">
                  {pillar.subtitle}
                </span>
                <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
