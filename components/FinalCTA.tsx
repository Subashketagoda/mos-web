'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Instagram, ArrowRight, Sparkles } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function FinalCTA() {
  return (
    <section className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/10 overflow-hidden text-center">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-mosphere-gold/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col items-center">
        
        {/* Emblem Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-mosphere-gold/40 flex items-center justify-center bg-black/60 p-3 shadow-goldGlow mb-8"
        >
          <img
            src={salonConfig.emblem}
            alt="Mosphere Emblem"
            className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs font-mono tracking-[0.16em] sm:tracking-[0.35em] text-mosphere-gold uppercase font-medium mb-3"
        >
          NAWALA • RAJAGIRIYA
        </motion.span>

        {/* Dramatic Closing Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-3xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.08] mb-6"
        >
          LET&apos;S CREATE THE <br />
          <span className="italic font-normal text-mosphere-goldLight">EXPERIENCE.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base text-white/60 font-light max-w-lg mb-10 leading-relaxed"
        >
          Elevate your daily presence with bespoke grooming and restorative hair rituals.
        </motion.p>

        {/* Dual Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
        >
          <a
            href="#booking"
            className="px-9 py-4 rounded-full text-xs sm:text-sm font-bold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:shadow-goldGlow transition-all uppercase flex items-center justify-center gap-2.5"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>RESERVE APPOINTMENT</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </a>

          <a
            href={salonConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full text-xs sm:text-sm font-medium tracking-wider text-white/90 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-mosphere-gold/40 transition-all uppercase flex items-center justify-center gap-2.5"
          >
            <Instagram className="w-4 h-4 text-mosphere-gold" />
            <span>EXPLORE INSTAGRAM</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
