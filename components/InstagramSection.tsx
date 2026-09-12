'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  ArrowUpRight,
  Heart,
  Sparkles,
  Play,
  Pause,
  X,
  Film,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { salonConfig } from '@/lib/config';

// Default / Negombo fallback posts
const negomboInstagramPosts = [
  {
    id: 'ig-neg-1',
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=75&fm=webp',
    likes: '194',
    caption: 'Restorative Tropical Hair Botox with deep ocean radiance at Negombo Coastal Studio. ✨',
    postUrl: 'https://www.instagram.com/mosphere_negombo/',
  },
  {
    id: 'ig-neg-2',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=75&fm=webp',
    likes: '235',
    caption: 'Coastal sanctuary vibes. Step into serene tropical luxury in Galison Mawatha, Negombo. 🌴',
    postUrl: 'https://www.instagram.com/mosphere_negombo/',
  },
  {
    id: 'ig-neg-3',
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=75&fm=webp',
    likes: '210',
    caption: 'Sun-kissed honey and champagne balayage hand-painted for effortless coastal glam. ☀️',
    postUrl: 'https://www.instagram.com/mosphere_negombo/',
  },
  {
    id: 'ig-neg-4',
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=75&fm=webp',
    likes: '185',
    caption: 'Master Barbering & coastal grooming ritual with iced eucalyptus compress in Negombo. ✂️',
    postUrl: 'https://www.instagram.com/mosphere_negombo/',
  },
];

// Official Real Colombo (@mosphere_nawala) Instagram Photos
const colomboInstagramPosts = [
  {
    id: 'col-ig-1',
    src: '/images/colombo/colombo-hair-treatment-1.jpg',
    likes: '342',
    caption: 'Is your hair feeling dry, frizzy, or difficult to manage? Time for our signature restorative Hair Botox at Mosphere Nawala. ✨ #MosphereNawala',
    postUrl: 'https://www.instagram.com/p/DYpZlQEjm_K/',
    tag: 'Hair Botox',
  },
  {
    id: 'col-ig-2',
    src: '/images/colombo/colombo-precision-hair-styling.jpg',
    likes: '418',
    caption: 'Precise and prim, just the way you want it. Experience master hair architecture at Salon Mosphere Nawala. ✂️',
    postUrl: 'https://www.instagram.com/mosphere_nawala/',
    tag: 'Haute Cut',
  },
  {
    id: 'col-ig-3',
    src: '/images/colombo/colombo-nails-tipsy-tips-1.jpg',
    likes: '286',
    caption: 'Get your nails prim and perfect! Book your bespoke manicure & pedicure at Tipsy Tips by Mosphere. 💅',
    postUrl: 'https://www.instagram.com/mosphere_nawala/',
    tag: 'Tipsy Tips',
  },
  {
    id: 'col-ig-4',
    src: '/images/colombo/colombo-hair-treatment-2.jpg',
    likes: '379',
    caption: 'Flawless frizz-free silk transformation. Rebalance, strengthen, and shine with bespoke hair care. 💫',
    postUrl: 'https://www.instagram.com/mosphere_nawala/',
    tag: 'Hair Glow',
  },
  {
    id: 'col-ig-5',
    src: '/images/colombo/colombo-nails-tipsy-tips-2.jpg',
    likes: '315',
    caption: 'Tipsy Tips prim & perfect pedicure & nail architecture. Step into complete luxury at Mosphere Nawala. 💅✨',
    postUrl: 'https://www.instagram.com/mosphere_nawala/',
    tag: 'Tipsy Tips',
  },
];

export interface VideoReel {
  id: string;
  title: string;
  celebrity: string;
  category: 'Celebrities' | 'Transformations' | 'Grooming' | 'Styling' | 'Nails & Care';
  src: string;
  tag: string;
  caption: string;
}

// All 10 Real Colombo (@mosphere_nawala) Video Reels from "New folder (2)"
const colomboVideoReels: VideoReel[] = [
  {
    id: 'reel-1',
    title: 'Oshadi Himasha at Mosphere',
    celebrity: 'Oshadi Himasha Visit',
    category: 'Celebrities',
    src: '/videos/colombo/oshadi-himasha-visit.mp4',
    tag: 'Celebrity Visit',
    caption: 'Oshadi Himasha dropping into Salon Mosphere, Nawala for some serious hair love & luxury glow! ✨💇‍♀️',
  },
  {
    id: 'reel-2',
    title: 'Maduwa Rap Energy at Mosphere',
    celebrity: 'Maduwa Rap Star',
    category: 'Celebrities',
    src: '/videos/colombo/maduwa-celebrity-visit.mp4',
    tag: 'Celebrity Vibe',
    caption: 'Maduwa just pulled up to Mosphere Saloon! 🔥🎤 Sri Lankan rap energy meets the luxury salon chair.',
  },
  {
    id: 'reel-3',
    title: 'Keratin by Pooja Vindy',
    celebrity: 'Pooja Vindy Transformation',
    category: 'Transformations',
    src: '/videos/colombo/keratin-pooja-transformation.mp4',
    tag: 'Keratin Silk',
    caption: 'Smooth, silky, and frizz-free! ✨ Another stunning keratin transformation by Pooja Vindy at Salon Mosphere.',
  },
  {
    id: 'reel-4',
    title: 'Hair Color Transformation for Ihara',
    celebrity: 'Ihara Color Makeover',
    category: 'Transformations',
    src: '/videos/colombo/hair-color-ihara-transformation.mp4',
    tag: 'Color Artistry',
    caption: 'Hair color transformation for Ihara at Salon Mosphere! From ordinary to absolutely stunning! 💖',
  },
  {
    id: 'reel-5',
    title: 'Sharp & Clean Gents Precision Fade',
    celebrity: 'Gents Master Barber',
    category: 'Grooming',
    src: '/videos/colombo/gents-hair-fade.mp4',
    tag: 'Precision Fade',
    caption: 'Keeping it sharp on and off the field. Every great performance starts with feeling your best. ✂️',
  },
  {
    id: 'reel-6',
    title: 'Beauty All-in-One Experience',
    celebrity: 'Head-to-Toe Luxury',
    category: 'Nails & Care',
    src: '/videos/colombo/beauty-all-in-one-services.mp4',
    tag: 'Nails & Hair',
    caption: 'Beauty services at Mosphere! ✨ Get your pedicure, nails done, and hair redo — all in one visit!',
  },
  {
    id: 'reel-7',
    title: 'Rich Dimensional Color Tones',
    celebrity: 'Gloss & Depth Formulation',
    category: 'Transformations',
    src: '/videos/colombo/rich-color-tones.mp4',
    tag: 'Rich Color',
    caption: 'Ultra-luxurious rich color tones and velvet shine crafted specifically for Colombo humidity. 🌟',
  },
  {
    id: 'reel-8',
    title: 'Fresh Hair & Radiant Confidence',
    celebrity: 'Signature Blowout & Glow',
    category: 'Styling',
    src: '/videos/colombo/fresh-hair-confidence.mp4',
    tag: 'Confidence',
    caption: 'That fresh hair feeling hits different! Step out with renewed poise and luminous silk bounce. 💃',
  },
  {
    id: 'reel-9',
    title: 'Good Hair Days at Mosphere',
    celebrity: 'Effortless Everyday Glamour',
    category: 'Styling',
    src: '/videos/colombo/hairday-mosphere.mp4',
    tag: 'Hair Day',
    caption: 'Because life is too short for bad hair days. Bespoke wash, scalp massage, and couture styling. ✨',
  },
  {
    id: 'reel-10',
    title: 'Aruja AJ Styling Session',
    celebrity: 'Aruja AJ Makeover',
    category: 'Celebrities',
    src: '/videos/colombo/aruja-aj-styling.mp4',
    tag: 'Celebrity Style',
    caption: 'Aruja AJ getting styled with custom texture architecture and runway finishing at Salon Mosphere Nawala! 🎬',
  },
];

// Subcomponent: Reel Card that automatically plays video seamlessly in a loop
function ReelCard({ reel, onSelect }: { reel: VideoReel; onSelect: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      video.muted = true;
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          const unlock = () => {
            video.muted = true;
            video.play().catch(() => {});
            ['click', 'touchstart', 'scroll', 'pointerdown'].forEach((ev) =>
              window.removeEventListener(ev, unlock)
            );
          };
          ['click', 'touchstart', 'scroll', 'pointerdown'].forEach((ev) =>
            window.addEventListener(ev, unlock, { passive: true, once: true })
          );
        });
      }
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    tryPlay();

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
    };
  }, [reel.src]);

  return (
    <div
      onClick={onSelect}
      className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-[#0E0E14] border border-white/10 hover:border-mosphere-gold/60 cursor-pointer shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(212,175,55,0.35)]"
    >
      <video
        ref={videoRef}
        src={reel.src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out bg-black"
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono uppercase tracking-wider bg-black/75 text-mosphere-gold border border-mosphere-gold/30 backdrop-blur-md">
          {reel.tag}
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[8px] font-mono text-white/90">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Center Play Indicator on Hover */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 border border-white/40 group-hover:border-mosphere-gold group-hover:bg-mosphere-gold group-hover:text-black text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:scale-110 shadow-2xl">
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Captions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10 pointer-events-none">
        <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-mosphere-goldLight uppercase block truncate mb-0.5">
          {reel.celebrity}
        </span>
        <h4 className="font-serif text-xs sm:text-sm text-white font-medium line-clamp-1 group-hover:text-mosphere-gold transition-colors">
          {reel.title}
        </h4>
        <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5 font-light">
          Tap for sound & full reel
        </p>
      </div>
    </div>
  );
}

// Subcomponent: Fullscreen Video Modal with Sound, Controls, and Navigation
function ReelModalPlayer({
  reel,
  onClose,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}: {
  reel: VideoReel;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Try playing with sound
    video.muted = isMuted;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setShowSoundPrompt(false);
        })
        .catch(() => {
          // If unmuted playback is blocked by browser policy, fallback to muted autoplay
          video.muted = true;
          setIsMuted(true);
          setShowSoundPrompt(true);
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
    }

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [reel.src]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = modalVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = modalVideoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setShowSoundPrompt(false);
    }
  };

  const handleUnmutePromptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = modalVideoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setShowSoundPrompt(false);
    video.play().catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 select-none"
      onClick={onClose}
    >
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-mosphere-gold transition-all duration-200 z-30"
        aria-label="Close Video Player"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Navigation Arrows (Desktop) */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-mosphere-gold text-white transition-all z-30"
          aria-label="Previous Reel"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-mosphere-gold text-white transition-all z-30"
          aria-label="Next Reel"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Video Container Box */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative max-w-sm sm:max-w-md w-full max-h-[92vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Video Area */}
        <div
          className="relative aspect-[9/16] w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={modalVideoRef}
            src={reel.src}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Tap for Sound Floating Pill */}
          {showSoundPrompt && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleUnmutePromptClick}
              className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mosphere-gold text-black text-xs font-bold font-mono tracking-wider shadow-goldGlow hover:scale-105 transition-all"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>TAP FOR SOUND 🔊</span>
            </motion.button>
          )}

          {/* Quick Play/Pause Feedback Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/70 border border-mosphere-gold/50 flex items-center justify-center text-mosphere-gold shadow-2xl">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Floating Controls Overlay */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 hover:border-mosphere-gold transition-all backdrop-blur-md"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-mosphere-gold" />
              )}
            </button>
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 hover:border-mosphere-gold transition-all backdrop-blur-md"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-mosphere-gold fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Info & Action Bar */}
        <div className="p-4 bg-[#0E0E14] border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-mosphere-gold font-semibold">
              {reel.tag} • {reel.category}
            </span>
            <span className="text-[9px] font-mono uppercase text-white/50">
              SALON MOSPHERE NAWALA
            </span>
          </div>

          <h4 className="font-serif text-base sm:text-lg text-white font-medium line-clamp-1">
            {reel.title}
          </h4>

          <p className="text-xs text-white/70 font-light leading-relaxed line-clamp-2">
            {reel.caption}
          </p>

          <div className="pt-3 flex items-center justify-between border-t border-white/10 mt-1">
            <a
              href="https://www.instagram.com/mosphere_nawala/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-mosphere-gold hover:underline flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>INSTAGRAM FEED</span>
            </a>

            <div className="flex items-center gap-2">
              <div className="flex md:hidden items-center gap-1">
                {hasPrev && (
                  <button
                    onClick={onPrev}
                    className="p-1.5 rounded-full bg-white/10 text-white text-xs border border-white/20"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {hasNext && (
                  <button
                    onClick={onNext}
                    className="p-1.5 rounded-full bg-white/10 text-white text-xs border border-white/20"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <a
                href="#booking"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-bold text-black bg-mosphere-gold hover:bg-mosphere-goldLight transition-colors uppercase shadow-goldGlow"
              >
                BOOK VISIT
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface InstagramSectionProps {
  location?: 'colombo' | 'negombo';
}

export default function InstagramSection({ location = 'colombo' }: InstagramSectionProps) {
  const isNegombo = location === 'negombo';
  const branchConfig = isNegombo ? salonConfig.locations.negombo : salonConfig.locations.colombo;
  const instagramUrl = branchConfig?.instagram || salonConfig.instagram;
  const instagramHandle = branchConfig?.instagramHandle || salonConfig.instagramHandle;

  const currentPosts = isNegombo ? negomboInstagramPosts : colomboInstagramPosts;
  const [activeVideoModal, setActiveVideoModal] = useState<VideoReel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Celebrities', 'Transformations', 'Grooming', 'Styling', 'Nails & Care'];

  const filteredReels = selectedCategory === 'All'
    ? colomboVideoReels
    : colomboVideoReels.filter((r) => r.category === selectedCategory);

  const activeIndex = activeVideoModal
    ? filteredReels.findIndex((r) => r.id === activeVideoModal.id)
    : -1;

  const handleNext = () => {
    if (activeIndex >= 0 && activeIndex < filteredReels.length - 1) {
      setActiveVideoModal(filteredReels[activeIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveVideoModal(filteredReels[activeIndex - 1]);
    }
  };

  return (
    <section
      className={`py-24 sm:py-32 relative border-t overflow-hidden ${
        isNegombo ? 'bg-[#03150F] border-emerald-500/20' : 'bg-[#060608] border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 border-b pb-6 ${
            isNegombo ? 'border-emerald-500/20' : 'border-white/10'
          }`}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`text-xs font-mono font-semibold ${
                  isNegombo ? 'text-[#E5B842]' : 'text-mosphere-gold'
                }`}
              >
                07
              </span>
              <span className="text-white/20">/</span>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
                SOCIAL JOURNAL {isNegombo ? '• NEGOMBO' : '• COLOMBO'}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white tracking-tight">
              FOLLOW{' '}
              <span
                className={`italic ${isNegombo ? 'text-[#F3CC68]' : 'text-mosphere-goldLight'}`}
              >
                {isNegombo ? 'MOSPHERE NEGOMBO' : 'MOSPHERE NAWALA'}
              </span>
            </h2>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-3 px-6 py-3 rounded-full border text-xs font-mono uppercase tracking-widest transition-all ${
              isNegombo
                ? 'bg-emerald-950/40 hover:bg-[#E5B842]/10 border-emerald-500/30 hover:border-[#E5B842] text-[#E5B842]'
                : 'bg-white/5 hover:bg-mosphere-gold/10 border-white/10 hover:border-mosphere-gold/40 text-mosphere-gold'
            }`}
          >
            <span>{instagramHandle}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Instagram Photos Grid */}
        <div className={`grid gap-4 sm:gap-6 ${isNegombo ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
          {currentPosts.map((post, idx) => (
            <motion.a
              key={post.id}
              href={post.postUrl || instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#0E0E14] shadow-xl block"
            >
              <img
                src={post.src}
                alt="Mosphere Instagram"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between">
                  <Instagram className="w-5 h-5 text-mosphere-gold" />
                  <div className="flex items-center gap-1 text-xs text-white/80 font-mono">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    <span>{post.likes}</span>
                  </div>
                </div>

                <p className="text-xs text-white/80 font-light line-clamp-3 leading-relaxed">
                  {post.caption}
                </p>

                <span className="text-[10px] font-mono tracking-widest text-mosphere-gold uppercase">
                  VIEW ON INSTAGRAM →
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Colombo Exclusive: Viral Video Reels & Celebrity Moments */}
        {!isNegombo && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-mosphere-gold">
                  <Film className="w-3.5 h-3.5 text-mosphere-gold animate-pulse" />
                  <span>VIRAL REELS & CELEBRITY VISITS (10 VIDEOS)</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-4xl text-white font-light">
                  Live From <span className="italic text-mosphere-goldLight">Salon Mosphere Nawala</span>
                </h3>
              </div>
              <p className="text-xs text-white/60 font-light max-w-md">
                Watch continuous live video transformations, celebrity sessions, and master grooming recorded directly from our salon floor. Tap any reel to play with sound!
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all uppercase ${
                    selectedCategory === cat
                      ? 'bg-mosphere-gold text-black font-bold shadow-goldGlow'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  {cat === 'All' ? `All (${colomboVideoReels.length})` : cat}
                </button>
              ))}
            </div>

            {/* Video Reels Grid - Automatically plays seamlessly */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {filteredReels.map((reel) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  onSelect={() => setActiveVideoModal(reel)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Video Modal Player */}
      <AnimatePresence>
        {activeVideoModal && (
          <ReelModalPlayer
            reel={activeVideoModal}
            onClose={() => setActiveVideoModal(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < filteredReels.length - 1}
          />
        )}
      </AnimatePresence>

    </section>
  );
}

