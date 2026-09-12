'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface CinematicLoaderProps {
  onComplete: () => void;
  durationMs?: number;
}

export default function CinematicLoader({
  onComplete,
  durationMs = 1600,
}: CinematicLoaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const finish = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  }, [isFinished, onComplete]);

  // Fast 1.6-second progress ticker and smooth exit
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

  // Ensure background video plays smoothly
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.play().catch(() => {});
  }, []);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="cinematic-brand-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050507] select-none overflow-hidden"
          style={{ minHeight: '100svh' }}
          role="dialog"
          aria-label="Loading MOSPHERE"
        >
          {/* ============================================================
               01 — REAL MOSPHERE SALON VIDEO BACKGROUND
               ============================================================ */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              src="/videos/colombo/fresh-hair-confidence.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/images/colombo/colombo-hair-treatment-1.jpg"
              className="w-full h-full object-cover opacity-35 scale-105 filter blur-[0.5px]"
            />
            {/* Layered Luxury Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-[#050507]/90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,7,0.35)_0%,rgba(5,5,7,0.96)_100%)] pointer-events-none" />
            <div className="absolute inset-0 film-grain pointer-events-none opacity-25" />
          </div>

          {/* ============================================================
               02 — AMBIENT GOLD HALO GLOW
               ============================================================ */}
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.12, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }
            }
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-[400px] sm:w-[580px] h-[280px] sm:h-[380px] rounded-full pointer-events-none blur-3xl transform-gpu"
            style={{
              background:
                'radial-gradient(ellipse 65% 50% at center, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 75%)',
            }}
          />

          {/* Delicate traveling light sheen */}
          <motion.div
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '220%', opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.8, delay: 0.1, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255, 245, 215, 0.08) 50%, transparent 60%)',
            }}
          />

          {/* ============================================================
               03 — OFFICIAL FULL GOLD LOGO & BRAND REVEAL (LARGE & BOLD)
               ============================================================ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1.0, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-xl mx-auto"
          >
            {/* Official MOSPHERE Full Logo Gold (Emblem + Wordmark + GRAB LIFE) - FULL & LARGE */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      filter: [
                        'drop-shadow(0 0 25px rgba(212,175,55,0.65)) drop-shadow(0 12px 24px rgba(0,0,0,0.85))',
                        'drop-shadow(0 0 45px rgba(212,175,55,0.95)) drop-shadow(0 12px 24px rgba(0,0,0,0.85))',
                        'drop-shadow(0 0 25px rgba(212,175,55,0.65)) drop-shadow(0 12px 24px rgba(0,0,0,0.85))',
                      ],
                    }
              }
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-64 xs:w-72 sm:w-96 md:w-[420px] max-w-[86vw] flex items-center justify-center mb-6 sm:mb-8"
            >
              <img
                src="/images/mosphere-full-logo-gold.png"
                alt="MOSPHERE GRAB LIFE"
                loading="eager"
                decoding="async"
                className="w-full h-auto object-contain max-h-[38vh] sm:max-h-[42vh] select-none pointer-events-none"
              />
            </motion.div>

            {/* ============================================================
                 04 — SLIM LUXURY GOLD PROGRESS BAR
                 ============================================================ */}
            <div className="w-48 sm:w-72 h-[2.5px] bg-white/10 relative overflow-hidden rounded-full mb-3.5 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[#B8860B] via-[#E5B842] to-[#FFF3C4] shadow-[0_0_15px_rgba(212,175,55,1)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {/* ============================================================
                 05 — SIGNATURE BRAND LINE
                 ============================================================ */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
              className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] sm:tracking-[0.42em] text-[#F3E5AB] uppercase text-center pl-[0.3em] sm:pl-[0.42em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              HAUTE BEAUTY &bull; PRECISION GROOMING
            </motion.p>
          </motion.div>

          {/* Bottom Cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.65, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-5 sm:bottom-7 text-[8px] sm:text-[9px] font-mono tracking-[0.32em] text-[#E5B842]/70 uppercase pointer-events-none"
          >
            COLOMBO &bull; NEGOMBO
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

