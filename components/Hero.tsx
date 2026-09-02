'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight, ArrowDown } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-28 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12"
    >
      {/* Background Cinematic Visual with Film Grain Overlay */}
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
        {/* Layered cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-[#070709]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070709]/50 to-[#070709]" />
        <div className="absolute inset-0 film-grain pointer-events-none" />
      </div>

      {/* Top Editorial Eyebrow Tag */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/10 pb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-mosphere-gold uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-mosphere-gold animate-pulse" />
          <span>NAWALA / SRI LANKA</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4 text-xs font-sans text-white/50 tracking-widest uppercase hidden md:flex"
        >
          <span>GENTS & LADIES HAUTE SALON</span>
          <span className="text-white/20">•</span>
          <span>EST. 2026</span>
        </motion.div>
      </div>

      {/* Main Asymmetrical Editorial Composition */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-auto py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Left Column: Oversized Monumental Title & Emblem */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-8 rounded-full border border-mosphere-gold/50 flex items-center justify-center bg-black/60 p-1.5 shadow-goldGlow">
                <img src={salonConfig.emblem} alt="Mosphere" className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.16em] sm:tracking-[0.35em] text-mosphere-gold uppercase font-semibold">
                HAUTE BEAUTY & PRECISION GROOMING
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[3.25rem] xs:text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-light text-white leading-none tracking-tight ml-0 sm:-ml-2"
            >
              MOSPHERE
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex items-center gap-4 mt-2"
            >
              <span className="h-[1px] w-12 sm:w-20 bg-mosphere-gold" />
              <span className="font-serif text-xl sm:text-3xl text-mosphere-goldLight italic tracking-wide">
                &ldquo;Grab Life.&rdquo;
              </span>
            </motion.div>
          </div>

          {/* Right Column: Editorial Narrative & Action CTAs */}
          <div className="lg:col-span-4 flex flex-col justify-end gap-8 lg:pb-3">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-sm sm:text-base text-white/70 font-light leading-relaxed border-l-2 border-mosphere-gold/40 pl-5"
            >
              A sanctuary of bespoke hair architecture, restorative Keratin rituals, and precision aesthetics crafted for individuals who demand perfection.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <a
                href="#booking"
                className="group relative overflow-hidden px-8 py-4 rounded-full text-xs font-bold tracking-[0.18em] text-black uppercase transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.7)] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
                }}
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>RESERVE NOW</span>
              </a>

              <a
                href="#services"
                className="px-7 py-4 rounded-full text-xs font-medium tracking-[0.18em] text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center justify-center gap-2 group"
              >
                <span>EXPLORE</span>
                <ArrowRight className="w-3.5 h-3.5 text-mosphere-gold group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom Ticker / Ambient Details */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-white/40 font-mono">
        <div className="flex items-center gap-4">
          <span>01 / 07</span>
          <span className="hidden sm:inline">HAIR BOTOX • KERATIN SILK • BALAYAGE • FADES</span>
        </div>

        <a
          href="#about"
          className="flex items-center gap-2 text-white/60 hover:text-mosphere-gold transition-colors tracking-widest uppercase"
        >
          <span>SCROLL TO DISCOVER</span>
          <ArrowDown className="w-3.5 h-3.5 text-mosphere-gold animate-bounce" />
        </a>
      </div>
    </section>
  );
}
