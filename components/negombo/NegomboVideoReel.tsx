'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Sparkles, Film, Maximize2 } from 'lucide-react';

export default function NegomboVideoReel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-[#02180F] border-y border-emerald-500/20 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E5B842]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#062A1D] border border-[#E5B842]/40 text-[#E5B842] text-xs font-mono tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(229,184,66,0.3)]">
            <Film className="w-3.5 h-3.5" />
            <span>OFFICIAL LAUNCH FILM</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight">
            NOW OPEN IN <span className="italic text-[#F3CC68]">NEGOMBO</span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/70 font-light mt-3 leading-relaxed">
            The wait is over. Experience world-class hair care, hair botox, and precision grooming at our new coastal sanctuary.
          </p>
        </div>

        {/* Video Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-[#E5B842]/50 shadow-[0_0_50px_rgba(229,184,66,0.35)] bg-black group"
        >
          <video
            ref={videoRef}
            src="/videos/negombo-hero-bg.mp4"
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full aspect-[9/16] sm:aspect-video object-contain sm:object-cover bg-black cursor-pointer"
            onClick={togglePlay}
          />

          {/* Big Center Play Overlay (when paused) */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/30"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] flex items-center justify-center shadow-[0_0_40px_rgba(229,184,66,0.8)] transform transition-transform group-hover:scale-110">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-black fill-black ml-1" />
              </div>
              <span className="text-xs font-mono text-[#F3CC68] tracking-widest uppercase mt-4 font-semibold">
                CLICK TO PLAY FILM
              </span>
            </div>
          )}

          {/* Bottom Custom Control Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 flex items-center justify-between z-20">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 text-xs font-mono text-white hover:text-[#E5B842] transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#E5B842] transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleFullscreen}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#E5B842] transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
