'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface CinematicLoaderProps {
  onComplete: () => void;
  durationMs?: number;
}

export default function CinematicLoader({
  onComplete,
  durationMs = 3000,
}: CinematicLoaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);

  const finish = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [isFinished, onComplete]);

  // Guaranteed 3-second progress ticker and completion
  useEffect(() => {
    const startTime = performance.now();
    let animFrame: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed < durationMs) {
        animFrame = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [durationMs, finish]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="cinematic-brand-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050507] select-none overflow-hidden"
          style={{ minHeight: '100svh' }}
          role="dialog"
          aria-label="Loading MOSPHERE"
        >
          {/* ============================================================
               01 — BACKGROUND ARCHITECTURAL VISUAL WITH SLOW PAN
               ============================================================ */}
          <motion.div
            initial={{ scale: 1.08, opacity: 0.2 }}
            animate={{
              scale: isFinished ? 1.02 : 1.0,
              opacity: isFinished ? 0.45 : 0.3,
            }}
            transition={{
              duration: durationMs / 1000 + 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 bg-cover bg-center transform-gpu will-change-transform pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80&fm=webp')`,
            }}
          />

          {/* Layered Noir Vignettes for Crystal Center Focus */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-[#050507]/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,7,0.3)_0%,rgba(5,5,7,0.95)_100%)] pointer-events-none" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />

          {/* ============================================================
               04 — ANIMATED LIGHT EFFECT BEHIND LOGO (Cinematic Gallery Beam)
               ============================================================ */}
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: ['-18%', '18%'],
                    y: ['-8%', '8%'],
                    opacity: [0.35, 0.7, 0.35],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute w-[450px] sm:w-[650px] h-[320px] sm:h-[450px] rounded-full pointer-events-none blur-3xl transform-gpu"
            style={{
              background:
                'radial-gradient(ellipse 65% 45% at center, rgba(229, 184, 66, 0.15) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 75%)',
            }}
          />

          {/* Delicate traveling light sheen */}
          <motion.div
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '220%', opacity: [0, 0.6, 0] }}
            transition={{ duration: 2.4, delay: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255, 245, 215, 0.08) 50%, transparent 60%)',
            }}
          />

          {/* ============================================================
               02 & 03 — BRAND REVEAL & LUXURY TYPOGRAPHY
               ============================================================ */}
          <motion.div
            animate={{
              y: isFinished ? -28 : 0,
              opacity: isFinished ? 0.9 : 1,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg mx-auto"
          >
            {/* Official MOSPHERE Golden Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1.0, y: 0 }}
              transition={{
                duration: 0.85,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full border border-[#E5B842]/50 bg-black/70 backdrop-blur-md p-2 flex items-center justify-center shadow-[0_0_35px_rgba(229,184,66,0.35)] mb-3 sm:mb-4"
            >
              <img
                src="/images/mosphere-emblem-gold.png"
                alt="MOSPHERE Emblem"
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(229,184,66,0.75)]"
              />
            </motion.div>

            {/* MOSPHERE Luxury Wordmark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1.0, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center"
            >
              <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-[0.42em] sm:tracking-[0.52em] uppercase leading-none pl-[0.42em] sm:pl-[0.52em] drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                MOSPHERE
              </h1>

              {/* Sub-motto with balanced accent lines */}
              <div className="flex items-center gap-2.5 sm:gap-3 mt-2 sm:mt-2.5">
                <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-r from-transparent to-[#E5B842]/70 shadow-[0_0_6px_#E5B842]" />
                <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.45em] text-[#E5B842] uppercase font-semibold pl-[0.45em]">
                  GRAB LIFE
                </span>
                <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-l from-transparent to-[#E5B842]/70 shadow-[0_0_6px_#E5B842]" />
              </div>
            </motion.div>

            {/* ============================================================
                 06 — PROGRESS INDICATOR (Minimal Horizontal Line)
                 ============================================================ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="w-36 sm:w-52 h-[1.5px] bg-white/10 relative overflow-hidden mt-6 mb-3 sm:mb-4 rounded-full"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#B8860B] via-[#E5B842] to-[#FFF3C4] shadow-[0_0_10px_rgba(229,184,66,0.9)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </motion.div>

            {/* ============================================================
                 05 — MOSPHERE SIGNATURE LINE (Fade-in Character)
                 ============================================================ */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
              className="text-[9px] sm:text-[11px] font-mono tracking-[0.32em] sm:tracking-[0.42em] text-[#F3E5AB]/80 uppercase text-center pl-[0.32em] sm:pl-[0.42em]"
            >
              BEAUTY • STYLE • EXPERIENCE
            </motion.p>
          </motion.div>

          {/* Ambient Brand Cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-6 sm:bottom-8 text-[9px] font-mono tracking-[0.3em] text-[#E5B842]/60 uppercase pointer-events-none"
          >
            MOSPHERE SALON &bull; SRI LANKA
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
