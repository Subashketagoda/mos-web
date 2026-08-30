'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ArrowUpRight, Navigation, MessageSquare } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function NegomboLocation() {
  const loc = salonConfig.locations.negombo;

  return (
    <section id="contact" className="py-28 sm:py-36 relative bg-[#03150F] border-t border-emerald-500/20 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#D4AF37] font-semibold">05</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-200/70 font-medium">
              FIND US IN NEGOMBO
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-300/50 tracking-widest hidden sm:inline uppercase">
            NEGOMBO • COASTAL SANCTUARY
          </span>
        </motion.div>

        {/* Location & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex flex-col justify-between gap-10"
          >
            <div>
              <span className="text-xs font-mono tracking-[0.3em] text-[#D4AF37] uppercase">
                COASTAL SANCTUARY
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl font-light text-white tracking-tight leading-none mt-2">
                MOSPHERE <br />
                <span className="italic font-normal text-[#F3E5AB]">NEGOMBO</span>
              </h2>
            </div>

            <div className="flex flex-col gap-6 divide-y divide-emerald-500/20 text-xs sm:text-sm">
              
              {/* Address */}
              <div className="pt-6 first:pt-0 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#041c14] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">Address</span>
                  <p className="font-medium text-white text-base sm:text-lg">
                    {loc.address}
                  </p>
                  <span className="text-emerald-300/50 text-xs">
                    Negombo, Western Province, Sri Lanka
                  </span>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#041c14] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">Operating Hours</span>
                  
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 mt-1">
                    <span className="text-[11px] font-medium text-white/90 block">Studio & Lounge</span>
                    <span className="text-xs text-[#F3E5AB] font-mono mt-0.5 block">{loc.openingHoursSummary}</span>
                    <span className="text-[10px] text-emerald-300/50">Gents & Ladies • 7 Days a Week</span>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#041c14] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">Concierge</span>
                  <div className="flex items-center gap-3">
                    <a href={`tel:${loc.phone.replace(/[^0-9]/g, '')}`} className="font-serif text-lg text-white hover:text-[#D4AF37] transition-colors">
                      {loc.phone}
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href={loc.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-full text-xs font-bold tracking-wider text-black bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all uppercase flex items-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-black" />
                <span>GET DIRECTIONS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${loc.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full text-xs font-medium tracking-wider text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 transition-all uppercase flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WHATSAPP CHAT</span>
              </a>
            </div>

          </motion.div>

          {/* Google Maps Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-6 relative min-h-[380px] lg:min-h-full rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#041c14]"
          >
            <iframe
              title="Mosphere Negombo Location"
              src={loc.googleMapsEmbed}
              className="w-full h-full min-h-[380px] lg:min-h-full border-0 filter grayscale invert contrast-125 opacity-90 hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
              allowFullScreen
            />

            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#03150F]/90 backdrop-blur-md border border-[#D4AF37]/30 shadow-xl flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5B842] animate-pulse" />
                <span className="text-xs font-serif font-medium text-white">51 Galison Mawatha, Negombo</span>
              </div>
              <span className="text-[10px] font-mono text-[#E5B842] uppercase tracking-wider">Negombo, LK</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
