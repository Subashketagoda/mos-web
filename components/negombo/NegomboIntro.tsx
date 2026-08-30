'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function NegomboIntro() {
  return (
    <section id="about" className="py-28 sm:py-36 relative bg-[#02180F] border-t border-[#E5B842]/20 overflow-hidden">
      
      {/* Background Watermark */}
      <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 font-serif text-[340px] font-bold text-emerald-400/[0.02] pointer-events-none select-none">
        N
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Editorial Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#E5B842]/25 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E5B842] font-semibold">01</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-100/70 font-medium">
              MOSPHERE NEGOMBO
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-300/50 tracking-widest hidden sm:inline uppercase">
            COASTAL SANCTUARY • NEGOMBO
          </span>
        </motion.div>

        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Headline & Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight">
              TROPICAL LUXURY <br />
              <span className="font-normal italic text-[#F3CC68]">MEETS BESPOKE ARTISTRY.</span>
            </h2>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-emerald-100/70 font-light uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                Negombo Gents Suite
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                Ladies Haute Lounge
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]" />
                Keratin & Hair Botox Lab
              </span>
            </div>
          </motion.div>

          {/* Right Column: Narrative & Arrow CTA */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-5 flex flex-col gap-6 lg:pt-3 text-emerald-100/80 font-light leading-relaxed text-sm sm:text-base"
          >
            <p>
              Mosphere Negombo brings luxury salon care and master grooming to Sri Lanka&apos;s west coast. Designed in our signature deep pine green and regal satin gold, our studio offers a tranquil sanctuary away from the bustle.
            </p>
            <p className="text-emerald-200/60 text-xs sm:text-sm">
              From restorative <strong className="text-[#F3CC68] font-medium">Hair Botox</strong> and <strong className="text-[#F3CC68] font-medium">Keratin Silk Therapy</strong> to tailored fade architecture and custom Balayage color formulation, every service is tailored to elevate your presence.
            </p>

            <div className="pt-4">
              <a
                href="#services"
                className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-[#E5B842] hover:text-[#F3CC68] transition-colors"
              >
                <span>EXPLORE NEGOMBO SERVICES</span>
                <ArrowRight className="w-4 h-4 text-[#E5B842] group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
