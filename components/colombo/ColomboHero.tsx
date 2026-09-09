'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  Film
} from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function ColomboHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
            const unlock = () => {
              video.muted = true;
              video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
              ['click', 'touchstart', 'pointerdown', 'scroll'].forEach((ev) =>
                window.removeEventListener(ev, unlock)
              );
            };
            ['click', 'touchstart', 'pointerdown', 'scroll'].forEach((ev) =>
              window.addEventListener(ev, unlock, { passive: true, once: true })
            );
          });
      }
    };

    tryPlay();
    video.addEventListener('loadeddata', tryPlay, { once: true });
    video.addEventListener('canplay', tryPlay, { once: true });

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-16 bg-[#070709]"
    >
      {/* Background Urban Noir Video Visual */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#070709]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=75&fm=webp"
          className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform bg-[#070709]"
        >
          <source src="/videos/colombo-hero-bg.mp4" type="video/mp4" />
          <source src="/api/video?name=colombo-hero-bg" type="video/mp4" />
        </video>

        {/* Layered Noir Gradients (Bright & Clear Focus) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-[#070709]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070709]/50 to-[#070709] pointer-events-none" />
        <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />

        {/* Floating Media Controls (Sound & Watch Film) */}
        <div className="absolute bottom-20 sm:bottom-16 right-4 sm:right-8 lg:right-16 z-20 flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/85 hover:bg-[#15151c] border border-mosphere-gold/40 hover:border-mosphere-gold backdrop-blur-md text-mosphere-gold shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all hover:scale-105"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-mosphere-gold" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold hidden sm:inline">
                  SOUND OFF
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-mosphere-gold animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold hidden sm:inline text-mosphere-goldLight">
                  SOUND ON
                </span>
              </>
            )}
          </button>

          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
            className="p-2 sm:p-2.5 rounded-full bg-black/85 hover:bg-[#15151c] border border-mosphere-gold/40 hover:border-mosphere-gold backdrop-blur-md text-mosphere-gold shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-mosphere-gold" />
            )}
          </button>

          {/* Full Launch Film Button */}
          <button
            type="button"
            onClick={() => setIsFilmModalOpen(true)}
            title="Watch Official Colombo Film"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark text-black font-bold text-[10px] font-mono tracking-wider uppercase shadow-goldGlow hover:shadow-[0_0_30px_rgba(212,175,55,0.9)] transition-all hover:scale-105"
          >
            <Film className="w-3.5 h-3.5 text-black" />
            <span>WATCH FILM</span>
          </button>
        </div>
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
                <img src={salonConfig.emblem} alt="Mosphere" loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-contain" />
              </div>
              <span className="text-[9px] sm:text-xs font-sans tracking-[0.16em] sm:tracking-[0.3em] text-mosphere-gold uppercase font-semibold">
                HAUTE BEAUTY & PRECISION GROOMING
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[2.45rem] xs:text-[2.85rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.75rem] font-light text-white leading-[1.08] tracking-tight"
            >
              <span className="block text-white">A MODERN</span>
              <span className="italic font-normal gold-gradient-text-light pb-1 block drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
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
              className="relative overflow-hidden rounded-2xl border border-mosphere-gold/30 bg-[#121218]/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-5"
            >
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-mosphere-gold/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-mosphere-gold">
                <Sparkles className="w-3.5 h-3.5 text-mosphere-gold" />
                <span>NAWALA SANCTUARY</span>
              </div>

              <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed">
                A sanctuary of bespoke hair architecture, precision grooming, and restorative aesthetic rituals crafted for individuals who demand perfection.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <a
                  href="#booking"
                  className="group relative overflow-hidden px-7 py-3.5 rounded-full text-xs font-bold tracking-[0.18em] text-black uppercase transition-all duration-300 shadow-goldGlow hover:shadow-[0_0_40px_rgba(212,175,55,0.8)] hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
                  }}
                >
                  <Calendar className="w-3.5 h-3.5 text-black" />
                  <span>RESERVE VISIT</span>
                </a>

                <a
                  href="#services"
                  className="px-6 py-3.5 rounded-full text-xs font-semibold tracking-[0.18em] text-white/90 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-mosphere-gold/50 transition-all uppercase flex items-center justify-center gap-2 group hover:scale-[1.02]"
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

      {/* Fullscreen Cinema Film Modal for Colombo */}
      <AnimatePresence>
        {isFilmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setIsFilmModalOpen(false)}
          >
            {/* Modal Header Controls */}
            <div
              className="w-full max-w-5xl flex items-center justify-between pb-3 border-b border-mosphere-gold/30 mb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-mosphere-gold animate-pulse shadow-[0_0_10px_#D4AF37]" />
                <span className="font-serif text-lg sm:text-xl text-white tracking-wide">
                  MOSPHERE COLOMBO • OFFICIAL FILM
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsFilmModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Close Film"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container */}
            <div
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-mosphere-gold/40 shadow-goldGlow"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src="/videos/colombo-hero-bg.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              >
                <source src="/videos/colombo-hero-bg.mp4" type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
