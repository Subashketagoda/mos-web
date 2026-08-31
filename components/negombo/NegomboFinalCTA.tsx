'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Instagram, ArrowRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function NegomboFinalCTA() {
  return (
    <section className="py-28 sm:py-36 relative bg-[#062A1D] border-t border-[#E5B842]/20 overflow-hidden text-center">
      
      {/* Ambient Emerald Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#E5B842]/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col items-center">
        
        {/* Official Negombo Logo Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[#E5B842]/50 bg-[#02180F] p-4 shadow-[0_0_25px_rgba(229,184,66,0.4)] mb-8"
        >
          <img
            src={salonConfig.locations.negombo.logo}
            alt="Mosphere Negombo Logo"
            className="max-h-24 sm:max-h-28 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(229,184,66,0.7)]"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs font-mono tracking-[0.35em] text-[#E5B842] uppercase font-semibold mb-3"
        >
          NEGOMBO • COASTAL SANCTUARY
        </motion.span>

        {/* Dramatic Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.08] mb-6"
        >
          BEGIN YOUR <br />
          <span className="italic font-normal text-[#F3CC68]">ELEVATION.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base text-emerald-100/80 font-light max-w-lg mb-10 leading-relaxed"
        >
          Reserve your bespoke appointment for master haircuts and certified hair botox rituals.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
        >
          <a
            href="#booking"
            className="px-9 py-4 rounded-full text-xs sm:text-sm font-bold tracking-wider text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] hover:shadow-[0_0_30px_rgba(229,184,66,0.8)] transition-all uppercase flex items-center justify-center gap-2.5"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>RESERVE NEGOMBO VISIT</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </a>

          <a
            href={salonConfig.locations.negombo.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full text-xs sm:text-sm font-medium tracking-wider text-emerald-100 bg-[#02180F]/90 hover:bg-[#062A1D] border border-[#E5B842]/40 hover:border-[#E5B842] transition-all uppercase flex items-center justify-center gap-2.5"
          >
            <Instagram className="w-4 h-4 text-[#E5B842]" />
            <span>EXPLORE INSTAGRAM</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
