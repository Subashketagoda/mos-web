'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight, ArrowDown } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function NegomboHero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-28 pb-12 sm:pb-16 px-6 sm:px-12 bg-[#062A1D]"
    >
      {/* Background Tropical Visual with Deep Pine/Emerald Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=2400&q=85')`,
          }}
        />
        {/* Layered Deep Green & Satin Gold Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02180F] via-[#062A1D]/85 to-[#062A1D]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#02180F]/65 to-[#02180F]" />
        <div className="absolute inset-0 film-grain pointer-events-none" />
      </div>

      {/* Top Editorial Eyebrow Tag */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[#E5B842]/25 pb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-[#E5B842] uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-[#E5B842] animate-pulse" />
          <span>MOSPHERE / NEGOMBO</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4 text-xs font-sans text-emerald-100/70 tracking-widest uppercase hidden md:flex"
        >
          <span>TROPICAL LUXURY & BESPOKE CARE</span>
          <span className="text-[#E5B842]/50">•</span>
          <span>EST. 2026</span>
        </motion.div>
      </div>

      {/* Main Asymmetrical Composition */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-auto py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Official Negombo Brand Card */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="w-8 h-8 rounded-full border border-[#E5B842]/60 flex items-center justify-center bg-[#062A1D] p-1.5 shadow-[0_0_12px_rgba(229,184,66,0.5)]">
                <img
                  src="/images/mosphere-emblem-gold.png"
                  alt="Mosphere Negombo Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-sans tracking-[0.35em] text-[#E5B842] uppercase font-semibold">
                HAUTE BEAUTY & COASTAL GROOMING
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-light text-white leading-none tracking-tight -ml-1"
            >
              YOUR BEAUTY. <br />
              <span className="italic font-normal text-[#F3CC68]">YOUR EXPERIENCE.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex items-center gap-4 mt-3"
            >
              <span className="h-[1.5px] w-12 sm:w-20 bg-[#E5B842]" />
              <span className="font-serif text-xl sm:text-2xl text-[#F3CC68] italic tracking-wide">
                &ldquo;Grab Life. Negombo Coastal Studio.&rdquo;
              </span>
            </motion.div>
          </div>

          {/* Right Column: Featured Official Logo Graphic & Actions */}
          <div className="lg:col-span-4 flex flex-col justify-end gap-6 lg:pb-2">
            {/* Official Logo Banner Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-2xl border border-[#E5B842]/40 bg-[#062A1D]/90 p-5 shadow-[0_0_30px_rgba(229,184,66,0.25)] backdrop-blur-md flex flex-col items-center text-center"
            >
              <img
                src={salonConfig.locations.negombo.logo}
                alt="Official Mosphere Negombo"
                className="max-h-36 sm:max-h-44 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(229,184,66,0.6)]"
              />
              <p className="text-xs text-emerald-100/80 font-light mt-3 leading-relaxed">
                Bespoke haircuts, certified hair botox, and coastal salon luxury.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <a
                href="#booking"
                className="group relative overflow-hidden px-8 py-4 rounded-full text-xs font-bold tracking-[0.18em] text-black uppercase transition-all duration-300 shadow-[0_0_25px_rgba(229,184,66,0.45)] hover:shadow-[0_0_35px_rgba(229,184,66,0.8)] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #E5B842 0%, #F3CC68 50%, #9B7617 100%)',
                }}
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>BOOK NOW</span>
              </a>

              <a
                href="#services"
                className="px-7 py-4 rounded-full text-xs font-medium tracking-[0.18em] text-emerald-100 bg-[#062A1D]/80 hover:bg-[#0A3B29] border border-[#E5B842]/40 hover:border-[#E5B842] transition-all uppercase flex items-center justify-center gap-2 group"
              >
                <span>EXPLORE MENU</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5B842] group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between pt-4 border-t border-emerald-500/20 text-[11px] text-emerald-100/50 font-mono">
        <div className="flex items-center gap-4">
          <span>01 / 07</span>
          <span className="hidden sm:inline">HAIR BOTOX • KERATIN SILK • BALAYAGE • GENTS FADES</span>
        </div>

        <a
          href="#about"
          className="flex items-center gap-2 text-emerald-200/80 hover:text-[#E5B842] transition-colors tracking-widest uppercase"
        >
          <span>SCROLL TO DISCOVER</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#E5B842] animate-bounce" />
        </a>
      </div>
    </section>
  );
}
