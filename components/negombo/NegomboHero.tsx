'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ArrowDown, Sparkles } from 'lucide-react';

export default function NegomboHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          const unlock = () => {
            video.play().catch(() => {});
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('scroll', unlock);
          };
          window.addEventListener('click', unlock, { once: true });
          window.addEventListener('touchstart', unlock, { once: true });
          window.addEventListener('scroll', unlock, { once: true });
        });
      }
    };

    tryPlay();
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-16 bg-black"
    >
      {/* Background Video - 100% Crystal Clear & Vivid */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=75"
          className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform bg-[#02180F]"
        >
          <source src="/videos/negombo-hero-bg.mp4" type="video/mp4" />
          <source src="/api/video" type="video/mp4" />
        </video>

        {/* Minimal Luxury Vignette (Keeps Video Ultra-Bright & Clear) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02180F]/95 via-black/25 to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Top Editorial Eyebrow Tag (Desktop) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto hidden sm:flex items-center justify-between gap-4 pt-2 border-b border-[#E5B842]/20 pb-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-[#E5B842] uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-[#E5B842] shadow-[0_0_8px_#E5B842] animate-pulse" />
          <span>MOSPHERE / NEGOMBO</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4 text-xs font-sans text-emerald-100/70 tracking-widest uppercase"
        >
          <span>TROPICAL LUXURY & BESPOKE CARE</span>
          <span className="text-[#E5B842]/50">•</span>
          <span>EST. 2026</span>
        </motion.div>
      </div>

      {/* Main Asymmetrical Composition */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-auto py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#E5B842]/40 bg-[#062A1D]/80 backdrop-blur-md shadow-[0_0_20px_rgba(229,184,66,0.2)] mb-4 sm:mb-5"
            >
              <div className="w-5 h-5 rounded-full border border-[#E5B842]/60 flex items-center justify-center bg-[#02180F] p-0.5 shadow-[0_0_8px_rgba(229,184,66,0.6)]">
                <img
                  src="/images/mosphere-emblem-gold.png"
                  alt="Mosphere"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] sm:text-xs font-sans tracking-[0.16em] sm:tracking-[0.3em] text-[#E5B842] uppercase font-semibold">
                HAUTE BEAUTY & COASTAL GROOMING
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[2.45rem] xs:text-[2.85rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.75rem] font-light text-white leading-[1.08] tracking-tight"
            >
              <span className="block text-white">YOUR BEAUTY.</span>
              <span className="italic font-normal gold-gradient-text pb-1 block drop-shadow-[0_2px_20px_rgba(229,184,66,0.45)]">
                YOUR EXPERIENCE.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-5"
            >
              <span className="h-[1.5px] w-8 sm:w-16 bg-gradient-to-r from-[#E5B842] to-transparent shadow-[0_0_8px_rgba(229,184,66,0.8)]" />
              <span className="font-serif text-base sm:text-lg lg:text-xl text-[#F3CC68] italic tracking-wide">
                &ldquo;Grab Life. Negombo Coastal Studio.&rdquo;
              </span>
            </motion.div>
          </div>

          {/* Right Column: Glassmorphic Editorial Card */}
          <div className="lg:col-span-5 flex flex-col justify-end mt-4 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-[#E5B842]/35 bg-[#031c13]/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-5"
            >
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#E5B842]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#E5B842]">
                <Sparkles className="w-3.5 h-3.5 text-[#E5B842]" />
                <span>COASTAL SANCTUARY</span>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-light leading-relaxed">
                A coastal sanctuary of bespoke hair architecture, restorative botanical hair botox, and calming aesthetic rituals crafted for individuals who demand perfection.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <a
                  href="#booking"
                  className="group relative overflow-hidden px-7 py-3.5 rounded-full text-xs font-bold tracking-[0.18em] text-black uppercase transition-all duration-300 shadow-[0_0_25px_rgba(229,184,66,0.45)] hover:shadow-[0_0_40px_rgba(229,184,66,0.85)] hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #E5B842 0%, #F3CC68 50%, #9B7617 100%)',
                  }}
                >
                  <Calendar className="w-3.5 h-3.5 text-black" />
                  <span>RESERVE VISIT</span>
                </a>

                <a
                  href="#services"
                  className="px-6 py-3.5 rounded-full text-xs font-semibold tracking-[0.18em] text-emerald-100 bg-white/5 hover:bg-white/10 border border-[#E5B842]/35 hover:border-[#E5B842] transition-all uppercase flex items-center justify-center gap-2 group hover:scale-[1.02]"
                >
                  <span>SERVICES MENU</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E5B842] group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between pt-3 sm:pt-4 border-t border-[#E5B842]/20 text-[10px] sm:text-[11px] text-emerald-100/60 font-mono">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-[#E5B842] font-semibold">01 / 07</span>
          <span className="hidden sm:inline tracking-wider">HAIR BOTOX • KERATIN SILK • BALAYAGE • GENTS FADES</span>
        </div>

        <a
          href="#about"
          className="flex items-center gap-2 text-emerald-100/80 hover:text-[#E5B842] transition-colors tracking-widest uppercase group"
        >
          <span>SCROLL TO DISCOVER</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#E5B842] group-hover:translate-y-0.5 transition-transform animate-bounce" />
        </a>
      </div>
    </section>
  );
}
