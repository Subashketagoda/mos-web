'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

export default function ExperienceSection() {
  return (
    <section id="experience" className="relative py-32 sm:py-48 overflow-hidden flex items-center justify-center border-y border-white/5">
      {/* Background with Parallax and Vignette */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-fixed bg-center scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=75')`,
          }}
        />
        <div className="absolute inset-0 bg-[#070709]/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-mosphere-gold/30 backdrop-blur-md mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-mosphere-gold" />
          <span className="text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.25em] text-mosphere-gold font-medium">
            FEATURED SANCTUARY
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-3xl sm:text-6xl md:text-7xl font-light text-white tracking-tight mb-6"
        >
          THE MOSPHERE <br />
          <span className="italic font-normal text-mosphere-goldLight">EXPERIENCE</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-xl sm:text-2xl text-mosphere-cream/90 italic font-light mb-6 tracking-wide"
        >
          &ldquo;Relax. Refresh. Transform.&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs sm:text-sm text-white/60 font-light max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Step into our private suites in Nawala. From bespoke consultation and warm towel aromatherapy to master finishing, we craft every detail for your complete relaxation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#booking"
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full text-xs font-semibold tracking-[0.15em] text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:shadow-goldGlow hover:-translate-y-0.5 transition-all duration-300 uppercase"
          >
            <Calendar className="w-4 h-4" />
            <span>DISCOVER MORE & BOOK</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
