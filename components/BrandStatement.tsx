'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function BrandStatement() {
  return (
    <section id="about" className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      {/* Subtle Background Watermark */}
      <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 font-serif text-[340px] font-bold text-white/[0.015] pointer-events-none select-none">
        M
      </div>

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
            <span className="text-xs font-mono text-mosphere-gold font-semibold">01</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              INTRODUCTION
            </span>
          </div>
          <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline uppercase">
            RAJAGIRIYA • COLOMBO
          </span>
        </motion.div>

        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Oversized Monumental Statement */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight">
              MOSPHERE IS <br />
              <span className="font-normal italic text-mosphere-goldLight">AN EXPERIENCE.</span>
            </h2>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-white/50 font-light uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold" />
                Private Gents Suite
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold" />
                Ladies Haute Studio
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold" />
                Keratin & Botox Lab
              </span>
            </div>
          </motion.div>

          {/* Right Column: Narrative Description & Minimal Arrow CTA */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-5 flex flex-col gap-6 lg:pt-3 text-white/70 font-light leading-relaxed text-sm sm:text-base"
          >
            <p>
              Located at 422A Nawala Road, Mosphere redefines luxury grooming and salon care in Sri Lanka. We reject rushed cuts and generic treatments in favor of meticulous consultation, international artistry, and restorative scalp and hair rituals.
            </p>
            <p className="text-white/50 text-xs sm:text-sm">
              Every detail—from ambient soundscapes and private styling chairs to premium bio-active formulations—is calibrated to elevate your presence.
            </p>

            <div className="pt-4">
              <a
                href="#services"
                className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-medium text-mosphere-gold hover:text-mosphere-goldLight transition-colors"
              >
                <span>EXPLORE THE OFFERINGS</span>
                <ArrowRight className="w-4 h-4 text-mosphere-gold group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
