'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface LocationSelectorProps {
  onSelectLocation: (location: 'colombo' | 'negombo') => void;
}

export default function LocationSelector({ onSelectLocation }: LocationSelectorProps) {
  const [hovered, setHovered] = useState<'colombo' | 'negombo' | null>(null);
  const [selected, setSelected] = useState<'colombo' | 'negombo' | null>(null);

  const handleSelect = (loc: 'colombo' | 'negombo') => {
    setSelected(loc);
    setTimeout(() => {
      onSelectLocation(loc);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-[9000] bg-[#070709] flex flex-col select-none overflow-y-auto">
      
      {/* Top Floating Brand Header */}
      <header className="relative lg:absolute top-0 lg:top-6 left-0 lg:left-1/2 lg:-translate-x-1/2 z-30 w-full lg:w-auto flex flex-col items-center justify-center text-center px-4 py-3 lg:py-0 bg-[#070709]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b lg:border-b-0 border-white/10 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <div className="h-9 sm:h-12 w-auto flex items-center justify-center">
            <img
              src="/images/mosphere-full-logo-gold.png"
              alt="MOSPHERE GRAB LIFE"
              loading="eager"
              decoding="async"
              className="h-full w-auto object-contain filter drop-shadow-[0_0_12px_rgba(212,175,55,0.75)]"
            />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-[1px] w-5 bg-mosphere-gold/50" />
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.25em] text-mosphere-gold font-semibold">
              SELECT YOUR SANCTUARY
            </span>
            <span className="h-[1px] w-5 bg-mosphere-gold/50" />
          </div>
        </div>
      </header>

      {/* Main Container: Desktop 50/50 Split, Mobile Stack */}
      <div className="relative w-full flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* ============================================================
             OPTION 01: COLOMBO / NAWALA (Urban Noir & Champagne Gold)
             ============================================================ */}
        <motion.div
          onMouseEnter={() => setHovered('colombo')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleSelect('colombo')}
          animate={{
            flex: selected === 'colombo' ? 10 : selected === 'negombo' ? 0 : hovered === 'colombo' ? 1.2 : hovered === 'negombo' ? 0.8 : 1,
            opacity: selected === 'negombo' ? 0 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 min-h-[44svh] lg:min-h-full cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 group flex flex-col justify-end p-5 sm:p-10 lg:p-16 transition-all duration-300"
        >
          {/* Background Visual with Smooth Zoom */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div
              animate={{ scale: hovered === 'colombo' ? 1.06 : 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=75&fm=webp')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-[#070709]/45 group-hover:via-[#070709]/70 transition-colors duration-500" />
            <div className="absolute inset-0 film-grain pointer-events-none opacity-50" />
          </div>

          {/* Colombo Content Card */}
          <div className="relative z-10 flex flex-col gap-2.5 sm:gap-3.5 max-w-lg">
            
            {/* Eyebrow Pill */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-mosphere-gold/60 bg-black/90 flex items-center justify-center p-1 shadow-goldGlow shrink-0">
                <img
                  src="/images/mosphere-emblem-gold.png"
                  alt="Mosphere Colombo"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-mosphere-goldLight uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold animate-pulse" />
                <span>URBAN HAUTE STUDIO • NAWALA</span>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-none">
                COLOMBO
              </h2>
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light italic text-mosphere-goldLight tracking-wide mt-0.5">
                NAWALA SANCTUARY
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
              422A Nawala Rd, Rajagiriya • Hair Botox, French Balayage & Precision Fade Architecture.
            </p>

            {/* Action CTA Button */}
            <div className="pt-2">
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow group-hover:shadow-[0_0_35px_rgba(212,175,55,0.85)] group-hover:scale-[1.02] transition-all uppercase">
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
            flex: selected === 'negombo' ? 10 : selected === 'colombo' ? 0 : hovered === 'negombo' ? 1.2 : hovered === 'colombo' ? 0.8 : 1,
            opacity: selected === 'colombo' ? 0 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 min-h-[44svh] lg:min-h-full cursor-pointer overflow-hidden group flex flex-col justify-end p-5 sm:p-10 lg:p-16 transition-all duration-300"
        >
          {/* Background Visual with Smooth Zoom */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div
              animate={{ scale: hovered === 'negombo' ? 1.06 : 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center bg-[#02180F]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=75&fm=webp')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02180F] via-[#02180F]/80 to-[#02180F]/45 group-hover:via-[#02180F]/70 transition-colors duration-500" />
            <div className="absolute inset-0 film-grain pointer-events-none opacity-50" />
          </div>

          {/* Negombo Content Card */}
          <div className="relative z-10 flex flex-col gap-2.5 sm:gap-3.5 max-w-lg">
            
            {/* Eyebrow Pill */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#E5B842]/70 bg-[#062A1D] flex items-center justify-center p-1 shadow-[0_0_12px_rgba(229,184,66,0.5)] shrink-0">
                <img
                  src="/images/mosphere-emblem-gold.png"
                  alt="Mosphere Negombo"
                  loading="eager"
                  decoding="async"
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
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-none">
                NEGOMBO
              </h2>
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light italic text-[#F3CC68] tracking-wide mt-0.5">
                COASTAL STUDIO
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/75 font-light leading-relaxed">
              51 Galison Mawatha, Negombo • Tropical Hair Botox Rituals & Master Barbering.
            </p>

            {/* Action CTA Button */}
            <div className="pt-2">
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] shadow-[0_0_25px_rgba(229,184,66,0.5)] group-hover:shadow-[0_0_35px_rgba(229,184,66,0.9)] group-hover:scale-[1.02] transition-all uppercase">
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
