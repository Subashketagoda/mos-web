'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface LocationSelectorProps {
  onSelectLocation: (location: 'colombo' | 'negombo') => void;
}

export default function LocationSelector({ onSelectLocation }: LocationSelectorProps) {
  const [hovered, setHovered] = useState<'colombo' | 'negombo' | null>(null);
  const [selected, setSelected] = useState<'colombo' | 'negombo' | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  }, []);

  const handleSelect = (loc: 'colombo' | 'negombo') => {
    setSelected(loc);
    setTimeout(() => {
      onSelectLocation(loc);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[9000] bg-[#070709] flex flex-col overflow-y-auto select-none min-h-[100svh]">
      
      {/* Top Floating Brand Header (Responsive & Clean) */}
      <div className="relative lg:absolute top-0 lg:top-8 left-0 lg:left-1/2 lg:-translate-x-1/2 z-30 w-full lg:w-auto flex flex-col items-center justify-center text-center px-4 py-3 sm:py-4 lg:py-0 bg-[#070709]/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b lg:border-b-0 border-white/10 shrink-0">
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-10 sm:h-12 lg:h-14 w-auto flex items-center justify-center">
            <img
              src="/images/mosphere-full-logo-gold.png"
              alt="MOSPHERE GRAB LIFE"
              className="h-full w-auto object-contain filter drop-shadow-[0_0_10px_rgba(212,175,55,0.7)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-6 bg-mosphere-gold/40" />
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.16em] sm:tracking-[0.3em] text-mosphere-gold font-medium">
              CHOOSE YOUR LOCATION
            </span>
            <span className="h-[1px] w-6 bg-mosphere-gold/40" />
          </div>
        </div>
      </div>

      {/* Main Split Container: Desktop 50/50, Mobile Responsive Stack */}
      <div className="relative w-full flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* ============================================================
             OPTION 01: COLOMBO / NAWALA (Urban Noir & Champagne)
             ============================================================ */}
        <motion.div
          onMouseEnter={() => setHovered('colombo')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleSelect('colombo')}
          animate={{
            flex: selected === 'colombo' ? 10 : selected === 'negombo' ? 0 : hovered === 'colombo' ? 1.25 : hovered === 'negombo' ? 0.75 : 1,
            opacity: selected === 'negombo' ? 0 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 min-h-[42svh] lg:min-h-0 cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 group flex flex-col justify-end p-4 sm:p-8 lg:p-16 transition-all duration-300"
        >
          {/* Background Visual */}
          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{ scale: hovered === 'colombo' ? 1.08 : 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=75')`,
              }}
            />
            {/* Charcoal & Noir Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/85 to-[#070709]/40 group-hover:via-[#070709]/70 transition-colors duration-500" />
            <div className="absolute inset-0 film-grain pointer-events-none" />
          </div>

          {/* Colombo Info Card */}
          <div className="relative z-10 flex flex-col gap-2 sm:gap-3">
            
            {/* Eyebrow Pill */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-mosphere-gold/60 bg-black/90 flex items-center justify-center p-1 shadow-goldGlow shrink-0">
                <img
                  src="/images/mosphere-emblem-gold.png"
                  alt="Mosphere Colombo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-mosphere-goldLight uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold animate-pulse" />
                <span>URBAN HAUTE STUDIO • RAJAGIRIYA</span>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-4xl lg:text-6xl font-light text-white tracking-tight leading-none">
                COLOMBO
              </span>
              <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-light italic text-mosphere-goldLight/90 tracking-wide mt-0.5 sm:mt-1">
                NAWALA
              </span>
            </div>

            <p className="text-[11px] sm:text-xs lg:text-sm text-white/70 font-light max-w-md line-clamp-2 leading-relaxed">
              422A Nawala Rd, Rajagiriya • Hair Botox, Balayage, Precision Fade Architecture.
            </p>

            {/* Enter Button Action */}
            <div className="pt-2 sm:pt-3">
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_35px_rgba(212,175,55,0.8)] group-hover:scale-105 transition-all uppercase">
                <span>ENTER COLOMBO</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ============================================================
             OPTION 02: NEGOMBO (Official Deep Pine Green & Satin Gold)
             ============================================================ */}
        <motion.div
          onMouseEnter={() => setHovered('negombo')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleSelect('negombo')}
          animate={{
            flex: selected === 'negombo' ? 10 : selected === 'colombo' ? 0 : hovered === 'negombo' ? 1.25 : hovered === 'colombo' ? 0.75 : 1,
            opacity: selected === 'colombo' ? 0 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 min-h-[42svh] lg:min-h-0 cursor-pointer overflow-hidden group flex flex-col justify-end p-4 sm:p-8 lg:p-16 transition-all duration-300"
        >
          {/* Background Video Visual - Crystal Clear & Vivid */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=75"
              className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform group-hover:scale-105 transition-transform duration-1000 ease-out bg-[#02180F]"
            >
              <source src="/videos/negombo-hero-bg.mp4" type="video/mp4" />
              <source src="/api/video" type="video/mp4" />
            </video>
            {/* Subtle Luxury Gradient Overlay (Keeps video bright & vibrant) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02180F]/90 via-black/20 to-black/15 group-hover:via-black/10 transition-colors duration-500" />
            <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
          </div>

          {/* Negombo Info Card */}
          <div className="relative z-10 flex flex-col gap-2 sm:gap-3">
            
            {/* Eyebrow Pill */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E5B842]/70 bg-[#062A1D] flex items-center justify-center p-1 shadow-[0_0_12px_rgba(229,184,66,0.5)] shrink-0">
                <img
                  src="/images/mosphere-emblem-gold.png"
                  alt="Mosphere Negombo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#E5B842] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] animate-pulse" />
                <span>COASTAL SANCTUARY • NEGOMBO</span>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-4xl lg:text-6xl font-light text-white tracking-tight leading-none">
                NEGOMBO
              </span>
              <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-light italic text-[#F3CC68] tracking-wide mt-0.5 sm:mt-1">
                COASTAL STUDIO
              </span>
            </div>

            <p className="text-[11px] sm:text-xs lg:text-sm text-emerald-100/80 font-light max-w-md line-clamp-2 leading-relaxed">
              51 Galison Mawatha, Negombo • Tropical Luxury Hair Care & Master Grooming.
            </p>

            {/* Enter Button Action */}
            <div className="pt-2 sm:pt-3">
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] shadow-[0_0_25px_rgba(229,184,66,0.45)] group-hover:shadow-[0_0_40px_rgba(229,184,66,0.85)] group-hover:scale-105 transition-all uppercase">
                <span>ENTER NEGOMBO</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
