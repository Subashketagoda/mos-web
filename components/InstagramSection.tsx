'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import { salonConfig } from '@/lib/config';

const instagramPosts = [
  {
    id: 'ig-1',
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    likes: '142',
    caption: 'Restorative Hair Botox glass-shine finish at Mosphere Nawala. ✨ #Mosphere #ColomboHair',
  },
  {
    id: 'ig-2',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    likes: '210',
    caption: 'Private sanctuary aesthetics. Step in, unwind, and experience bespoke personal elevation. 🏛️',
  },
  {
    id: 'ig-3',
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
    likes: '188',
    caption: 'Dimensional Blonde & Caramel Balayage melt. Hand-painted with bio-protecting gloss. 💫',
  },
  {
    id: 'ig-4',
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    likes: '175',
    caption: 'Precision Fade Architecture & eucalyptus hot towel beard ritual in the Gents Suite. ✂️',
  },
];

export default function InstagramSection() {
  return (
    <section className="py-24 sm:py-32 relative bg-[#060608] border-t border-white/5 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-mosphere-gold font-semibold">09</span>
              <span className="text-white/20">/</span>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
                SOCIAL JOURNAL
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white tracking-tight">
              FOLLOW <span className="italic text-mosphere-goldLight">MOSPHERE</span>
            </h2>
          </div>

          <a
            href={salonConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-mosphere-gold/10 border border-white/10 hover:border-mosphere-gold/40 text-xs font-mono uppercase tracking-widest text-mosphere-gold transition-all"
          >
            <span>{salonConfig.instagramHandle}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {instagramPosts.map((post, idx) => (
            <motion.a
              key={post.id}
              href={salonConfig.instagram}
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

      </div>
    </section>
  );
}
