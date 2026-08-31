'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Calendar,
  Sparkles,
  Instagram,
  ArrowRight
} from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function NegomboVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section id="launch-reel" className="py-24 sm:py-32 relative bg-[#02140D] border-t border-[#E5B842]/20 overflow-hidden">
      {/* Ambient Tropical Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E5B842]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 border-b border-[#E5B842]/20 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-[#E5B842] font-semibold">02</span>
              <span className="text-emerald-300/30">/</span>
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-100/70 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E5B842]" />
                <span>OFFICIAL LAUNCH REEL</span>
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight">
              NOW OPEN IN <span className="italic font-normal text-[#F3CC68]">NEGOMBO! 🌟</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/70 font-light max-w-md leading-relaxed">
            The wait is over. MOSPHERE is ready to redefine your grooming and hair artistry experience on the coastal shore.
          </p>
        </div>

        {/* Video Player Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Video Reel Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative group"
          >
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#E5B842]/40 bg-black shadow-[0_0_50px_rgba(229,184,66,0.2)] aspect-[9/16] sm:aspect-video max-h-[620px] mx-auto flex items-center justify-center">
              
              {/* Video Element */}
              <video
                ref={videoRef}
                src="/videos/negombo-launch.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
              />

              {/* Top Video Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#E5B842]/40 text-[10px] font-mono text-[#F3CC68] uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>NEGOMBO LAUNCH FILM</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-200 uppercase tracking-wider">
                  51 GALISON MAWATHA
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/15 flex items-center justify-between z-20 transition-opacity">
                <div className="flex items-center gap-3">
                  {/* Play / Pause Toggle */}
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-[#E5B842] hover:bg-[#F3CC68] text-black flex items-center justify-center transition-transform hover:scale-105 shadow-md"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                  </button>

                  {/* Mute / Unmute Toggle */}
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-white/70" />
                        <span className="text-[10px] text-white/70 hidden sm:inline">Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-[#E5B842]" />
                        <span className="text-[10px] text-[#E5B842] hidden sm:inline">Audio On</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right controls: Fullscreen */}
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-white/80" />
                </button>
              </div>

            </div>
          </motion.div>

          {/* Right Column: Launch Editorial Info & Direct Actions */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-6 text-emerald-100"
          >
            <div className="p-8 rounded-3xl bg-[#062A1D]/80 border border-[#E5B842]/30 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E5B842]/10 border border-[#E5B842]/40 flex items-center justify-center text-[#E5B842]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-white font-normal">A New Era of Style</h3>
                  <span className="text-[11px] font-mono text-[#E5B842] tracking-wider uppercase">Open Daily: 10:00 AM – 8:00 PM</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/80 font-light leading-relaxed">
                Experience world-class hair botox restoration, bespoke haircutting, balayage, and restorative treatments designed exclusively for our coastal clientele.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-emerald-200/90 font-light">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                  <span>📍 51 Galison Mawatha, Negombo</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                  <span>📞 Reservations: 0777 29 16 29 / 077 881 77 42</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                  <span>📸 Instagram: @mosphere_negombo</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="#booking"
                  className="flex-1 py-3.5 px-6 rounded-full text-xs font-bold tracking-wider text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] hover:shadow-[0_0_25px_rgba(229,184,66,0.7)] transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-black" />
                  <span>RESERVE VISIT</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </a>

                <a
                  href={salonConfig.locations.negombo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-5 rounded-full text-xs font-medium tracking-wider text-[#E5B842] bg-black/40 hover:bg-[#E5B842]/10 border border-[#E5B842]/40 transition-colors uppercase flex items-center justify-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  <span>REEL ON IG</span>
                </a>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
