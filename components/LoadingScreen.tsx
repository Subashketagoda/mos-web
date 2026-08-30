'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user already saw loader in this session
    const hasLoaded = sessionStorage.getItem('mosphere_loader_seen');
    if (!hasLoaded) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('mosphere_loader_seen', 'true');
      }, 550);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="mosphere-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeOut' },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070709] select-none pointer-events-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#D4AF37]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

          {/* Complete Official Logo with Monogram & Typography */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-56 sm:w-72 h-32 sm:h-36 flex items-center justify-center p-3 mb-2"
          >
            <img
              src="/images/mosphere-full-logo-gold.png"
              alt="MOSPHERE GRAB LIFE"
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(212,175,55,0.75)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.35em] text-[#D4AF37]"
          >
            <span>✦</span>
            <span>COLOMBO • NAWALA • NEGOMBO</span>
            <span>✦</span>
          </motion.div>

          {/* Fast Gold Progress Indicator */}
          <div className="w-36 sm:w-44 h-[1.5px] bg-white/10 rounded-full mt-6 overflow-hidden relative">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-r from-[#A38018] via-[#D4AF37] to-[#F3E5AB] shadow-[0_0_8px_#D4AF37]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
