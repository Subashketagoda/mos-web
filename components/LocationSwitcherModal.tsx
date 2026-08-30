'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MapPin, ArrowRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface LocationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: 'colombo' | 'negombo';
  onSelectLocation: (loc: 'colombo' | 'negombo') => void;
}

export default function LocationSwitcherModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationSwitcherModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99990] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative max-w-xl w-full rounded-2xl bg-[#09090D] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-mosphere-gold animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-mosphere-gold">
              MOSPHERE LOCATIONS
            </span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl text-white font-light mb-6">
            Switch Studio Branch
          </h3>

          {/* Options */}
          <div className="flex flex-col gap-4">
            
            {/* Colombo Option */}
            <div
              onClick={() => {
                onSelectLocation('colombo');
                onClose();
              }}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                currentLocation === 'colombo'
                  ? 'border-mosphere-gold bg-white/[0.04] shadow-goldGlow'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full border border-white/20 bg-black flex items-center justify-center text-white/80 shrink-0">
                  <MapPin className="w-5 h-5 text-mosphere-gold" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-white font-medium">COLOMBO / NAWALA</span>
                    {currentLocation === 'colombo' && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-mosphere-gold text-black font-bold uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/50 font-light mt-0.5">
                    422A Nawala Rd, Rajagiriya • Urban Haute Sanctuary
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-mosphere-gold group-hover:bg-mosphere-gold group-hover:text-black transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Negombo Option */}
            <div
              onClick={() => {
                onSelectLocation('negombo');
                onClose();
              }}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                currentLocation === 'negombo'
                  ? 'border-[#D4AF37] bg-[#041c14]/80 shadow-[0_0_25px_rgba(212,175,55,0.3)]'
                  : 'border-white/10 bg-[#041c14]/30 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full border border-[#D4AF37]/50 bg-[#041c14] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-white font-medium">NEGOMBO</span>
                    {currentLocation === 'negombo' && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37] text-black font-bold uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-200/60 font-light mt-0.5">
                    51 Galison Mawatha, Negombo • Coastal Sanctuary & Haute Care
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
