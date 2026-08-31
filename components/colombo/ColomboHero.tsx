'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ArrowDown, Sparkles } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function ColomboHero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-24 sm:pt-28 pb-8 sm:pb-10 px-6 sm:px-12 lg:px-16 bg-[#070709]"
    >
      {/* Background Urban Noir Visual */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=85')`,
          }}
        />
        {/* Layered Noir Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-[#070709]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070709]/50 to-[#070709]" />
        <div className="absolute inset-0 film-grain pointer-events-none" />
      </div>

      {/* Top Editorial Eyebrow Tag (Desktop) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto hidden sm:flex items-center justify-between gap-4 pt-2 border-b border-white/10 pb-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-mosphere-gold uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-mosphere-gold shadow-[0_0_8px_#D4AF37] animate-pulse" />
          <span>MOSPHERE / COLOMBO</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4 text-xs font-sans text-white/60 tracking-widest uppercase"
        >
          <span>422A NAWALA RD, RAJAGIRIYA</span>
          <span className="text-white/20">•</span>
          <span>EST. 2026</span>
        </motion.div>
      </div>

      {/* Main Asymmetrical Editorial Composition */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-auto py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-mosphere-gold/40 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-4 sm:mb-5"
            >
              <div className="w-5 h-5 rounded-full border border-mosphere-gold/60 flex items-center justify-center bg-black p-0.5 shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                <img src={salonConfig.emblem} alt="Mosphere" className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] sm:text-xs font-sans tracking-[0.3em] text-mosphere-gold uppercase font-semibold">
                HAUTE BEAUTY & PRECISION GROOMING
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-[4.75rem] font-light text-white leading-[1.14] tracking-tight"
            >
              <span className="block text-white">A MODERN</span>
              <span className="italic font-normal gold-gradient-text-light pb-1 block">
                BEAUTY EXPERIENCE.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-5"
            >
              <span className="h-[1.5px] w-8 sm:w-16 bg-gradient-to-r from-mosphere-gold to-transparent shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <span className="font-serif text-base sm:text-lg lg:text-xl text-mosphere-goldLight italic tracking-wide">
                &ldquo;Grab Life. Nawala Sanctuary.&rdquo;
              </span>
            </motion.div>
          </div>

          {/* Right Column: Editorial Narrative & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-end mt-4 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="rounded-2xl border border-mosphere-gold/25 bg-[#121218]/75 backdrop-blur-xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col gap-4 sm:gap-5"
            >
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-mosphere-gold">
                <Sparkles className="w-3.5 h-3.5 text-mosphere-gold" />
                <span>NAWALA SANCTUARY</span>
              </div>

              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                A sanctuary of bespoke hair architecture, precision grooming, and restorative aesthetic rituals crafted for individuals who demand perfection.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <a
                  href="#booking"
                  className="group relative overflow-hidden px-7 py-3.5 rounded-full text-xs font-bold tracking-[0.18em] text-black uppercase transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.8)] hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
                  }}
                >
                  <Calendar className="w-3.5 h-3.5 text-black" />
                  <span>RESERVE VISIT</span>
                </a>

                <a
                  href="#services"
                  className="px-6 py-3.5 rounded-full text-xs font-medium tracking-[0.18em] text-white/90 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-mosphere-gold/50 transition-all uppercase flex items-center justify-center gap-2 group hover:scale-[1.02]"
                >
                  <span>SERVICES MENU</span>
                  <ArrowRight className="w-3.5 h-3.5 text-mosphere-gold group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 text-[10px] sm:text-[11px] text-white/50 font-mono">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-mosphere-gold font-semibold">01 / 07</span>
          <span className="hidden sm:inline tracking-wider">HAIR BOTOX • KERATIN SILK • BALAYAGE • FADES</span>
        </div>

        <a
          href="#about"
          className="flex items-center gap-2 text-white/70 hover:text-mosphere-gold transition-colors tracking-widest uppercase group"
        >
          <span>SCROLL TO DISCOVER</span>
          <ArrowDown className="w-3.5 h-3.5 text-mosphere-gold group-hover:translate-y-0.5 transition-transform animate-bounce" />
        </a>
      </div>
    </section>
  );
}
