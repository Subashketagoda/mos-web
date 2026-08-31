'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight, ArrowDown, Volume2, VolumeX, Maximize2, X, Play } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function NegomboHero() {
  const [isMuted, setIsMuted] = useState(true);
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-28 pb-12 sm:pb-16 px-6 sm:px-12 bg-black"
    >
      {/* Background Video - 100% Crystal Clear & Vivid */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/negombo-hero-bg.mp4?v=2026" type="video/mp4" />
        </video>

        {/* Minimal Luxury Vignette (Keeps Video Ultra-Bright & Clear) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02180F]/90 via-black/20 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Floating Video Controls Pill (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2.5">
        <button
          onClick={() => setIsCinemaOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-black/75 hover:bg-black/95 text-[#E5B842] border border-[#E5B842]/50 backdrop-blur-md transition-all shadow-xl hover:scale-105 text-xs font-mono tracking-wider uppercase"
          title="Watch in Cinema Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">FULLSCREEN VIDEO</span>
        </button>

        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-black/75 hover:bg-black/95 text-[#E5B842] border border-[#E5B842]/50 backdrop-blur-md transition-all shadow-xl hover:scale-105"
          title={isMuted ? 'Unmute video sound' : 'Mute video sound'}
          aria-label="Toggle Hero Video Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
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

      {/* Fullscreen Theater Modal */}
      <AnimatePresence>
        {isCinemaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCinemaOpen(false)}
              className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
              aria-label="Close cinema view"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title Header */}
            <div className="text-center mb-4 sm:mb-6">
              <span className="text-xs font-mono text-[#E5B842] uppercase tracking-[0.3em]">
                MOSPHERE CINEMATIC EXPERIENCE
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-white mt-1">
                Now Open in Negombo
              </h3>
            </div>

            {/* Video Container */}
            <div className="relative max-w-5xl w-full aspect-video rounded-2xl overflow-hidden border border-[#E5B842]/40 shadow-[0_0_50px_rgba(229,184,66,0.3)] bg-black">
              <video
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              >
                <source src="/videos/negombo-hero-bg.mp4?v=2026" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
