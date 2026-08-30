'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ArrowUpRight, Navigation, MessageSquare } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function LocationSection() {
  return (
    <section id="contact" className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-white/10 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-mosphere-gold font-semibold">08</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              FIND US
            </span>
          </div>
          <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline uppercase">
            RAJAGIRIYA • SRI JAYAWARDENEPURA KOTTE
          </span>
        </motion.div>

        {/* Location & Map Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* Left Column: Contact & Business Schedule Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex flex-col justify-between gap-10"
          >
            <div>
              <span className="text-xs font-mono tracking-[0.3em] text-mosphere-gold uppercase">
                STUDIO SANCTUARY
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl font-light text-white tracking-tight leading-none mt-2">
                MOSPHERE <br />
                <span className="italic font-normal text-mosphere-goldLight">NAWALA</span>
              </h2>
            </div>

            <div className="flex flex-col gap-6 divide-y divide-white/10 text-xs sm:text-sm">
              
              {/* Address */}
              <div className="pt-6 first:pt-0 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-mosphere-gold/40 bg-black/60 flex items-center justify-center text-mosphere-gold shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mosphere-gold">Address</span>
                  <p className="font-medium text-white text-base sm:text-lg">
                    {salonConfig.address}
                  </p>
                  <span className="text-white/40 text-xs">
                    Sri Jayawardenepura Kotte 10107, Sri Lanka
                  </span>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-mosphere-gold/40 bg-black/60 flex items-center justify-center text-mosphere-gold shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mosphere-gold">Operating Hours</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[11px] font-medium text-white/90 block">Gents Lounge</span>
                      <span className="text-xs text-mosphere-goldLight font-mono mt-0.5 block">{salonConfig.openingHoursGents}</span>
                      <span className="text-[10px] text-white/40">Open 7 Days a Week</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[11px] font-medium text-white/90 block">Ladies Studio</span>
                      <span className="text-xs text-mosphere-goldLight font-mono mt-0.5 block">{salonConfig.openingHoursLadies}</span>
                      <span className="text-[10px] text-white/40">Open 7 Days a Week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone & Direct Hotline */}
              <div className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-mosphere-gold/40 bg-black/60 flex items-center justify-center text-mosphere-gold shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mosphere-gold">Direct Concierge</span>
                  <div className="flex flex-wrap items-center gap-4">
                    <a href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`} className="font-serif text-lg text-white hover:text-mosphere-gold transition-colors">
                      {salonConfig.phone}
                    </a>
                    <span className="text-white/20">•</span>
                    <a href={`tel:${salonConfig.phoneSecondary.replace(/[^0-9]/g, '')}`} className="font-serif text-base text-white/60 hover:text-white transition-colors">
                      {salonConfig.phoneSecondary}
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Direct Directions & WhatsApp Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href={salonConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-full text-xs font-bold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:shadow-goldGlow transition-all uppercase flex items-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-black" />
                <span>GET DIRECTIONS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${salonConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full text-xs font-medium tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all uppercase flex items-center gap-2"
              >
                <span>WHATSAPP CHAT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </motion.div>

          {/* Right Column: Google Maps Interactive Embed Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-6 relative min-h-[380px] lg:min-h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0E0E14]"
          >
            <iframe
              title="Mosphere Salon Nawala Location"
              src="https://maps.google.com/maps?q=422A+Nawala+Rd,+Rajagiriya,+Sri+Lanka&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[380px] lg:min-h-full border-0 filter grayscale invert contrast-125 opacity-90 hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
              allowFullScreen
            />

            {/* Subtle Map Overlay Badge */}
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 shadow-xl flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-mosphere-gold animate-pulse" />
                <span className="text-xs font-serif font-medium text-white">422A Nawala Rd, Rajagiriya</span>
              </div>
              <span className="text-[10px] font-mono text-mosphere-gold uppercase tracking-wider">Colombo, LK</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
