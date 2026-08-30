'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { salonConfig } from '@/lib/config';

export default function AboutSection() {
  return (
    <section id="story" className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Editorial Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-white/10 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-mosphere-gold font-semibold">03</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              THE STORY
            </span>
          </div>
          <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline uppercase">
            PHILOSOPHY & ARTISTRY
          </span>
        </motion.div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Overlapping Editorial Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            {/* Primary Large Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80"
                alt="Mosphere Craftsmanship"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-mono tracking-widest text-mosphere-gold uppercase block mb-1">
                  STUDIO SUITE
                </span>
                <p className="font-serif text-lg text-white font-medium">
                  Custom Grooming Architecture
                </p>
              </div>
            </div>

            {/* Overlapping Small Secondary Image */}
            <div className="hidden sm:block absolute -bottom-10 -right-8 w-52 sm:w-60 aspect-square rounded-2xl overflow-hidden border-2 border-mosphere-gold/40 shadow-2xl bg-black">
              <img
                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80"
                alt="Bio-Active Formulations"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          </motion.div>

          {/* Right Column: Editorial Narrative & Craftsmanship Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-6 flex flex-col gap-8"
          >
            <div>
              <span className="text-xs font-mono tracking-[0.25em] text-mosphere-gold uppercase">
                THE ART OF DETAIL
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight mt-2">
                CRAFTED FOR <br />
                <span className="italic font-normal text-mosphere-goldLight">PERSONAL ELEVATION.</span>
              </h3>
            </div>

            <div className="flex flex-col gap-5 text-sm sm:text-base text-white/70 font-light leading-relaxed">
              <p>
                Mosphere was founded on a simple conviction: grooming is an art form that deserves precision, serenity, and high craftsmanship. We curate a distinct atmosphere where clients can step away from the noise of Colombo and immerse themselves in bespoke care.
              </p>
              <p className="text-white/50 text-xs sm:text-sm">
                From specialized <strong className="text-white font-medium">Hair Botox</strong> and <strong className="text-white font-medium">Keratin Silk Infusions</strong> to tailored fade architecture and custom Balayage color formulation, our artisans combine modern technique with warm concierge hospitality.
              </p>
            </div>

            {/* Differentiator Highlights */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10 text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-serif text-2xl sm:text-3xl text-mosphere-gold font-medium">100%</span>
                <span className="text-white/80 font-medium uppercase tracking-wider">Custom Consultation</span>
                <span className="text-white/40 text-[11px]">Tailored to facial geometry and hair porosity</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-serif text-2xl sm:text-3xl text-mosphere-gold font-medium">Bio-Safe</span>
                <span className="text-white/80 font-medium uppercase tracking-wider">Premium Formulations</span>
                <span className="text-white/40 text-[11px]">Formaldehyde-free smoothing and botanical oils</span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
