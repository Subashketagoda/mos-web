'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { salonConfig } from '@/lib/config';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="mosphere-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -20,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070709] select-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-mosphere-gold/10 via-transparent to-transparent blur-3xl pointer-events-none" />

          {/* Complete Official Logo with Monogram & Typography */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-64 sm:w-80 h-36 sm:h-44 flex items-center justify-center p-4 mb-2"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              src="/images/mosphere-full-logo-gold.png"
              alt="MOSPHERE GRAB LIFE"
              className="w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(212,175,55,0.75)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 mt-1 text-[10px] uppercase font-mono tracking-[0.35em] text-mosphere-gold"
          >
            <span>✦</span>
            <span>COLOMBO • NAWALA • NEGOMBO</span>
            <span>✦</span>
          </motion.div>

          {/* Thin Gold Progress Indicator */}
          <div className="w-44 h-[1.5px] bg-white/10 rounded-full mt-8 overflow-hidden relative">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full h-full bg-gradient-to-r from-mosphere-goldDark via-mosphere-gold to-mosphere-goldLight shadow-[0_0_10px_#D4AF37]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
