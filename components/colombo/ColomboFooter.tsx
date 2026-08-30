'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface ColomboFooterProps {
  onOpenLocationSwitcher: () => void;
}

export default function ColomboFooter({ onOpenLocationSwitcher }: ColomboFooterProps) {
  const loc = salonConfig.locations.colombo;

  return (
    <footer className="bg-[#050507] text-white border-t border-white/10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        {/* Top 3-Column Luxury Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Col 1: Brand & Location Indicator */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full border border-mosphere-gold/60 bg-black flex items-center justify-center p-2 shadow-goldGlow">
                <img
                  src={salonConfig.emblem}
                  alt="Mosphere Colombo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(212,175,55,0.7)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.2em] font-normal text-white uppercase">
                  MOSPHERE
                </span>
                <span className="text-[9px] tracking-[0.3em] text-mosphere-gold font-sans font-medium uppercase -mt-0.5">
                  COLOMBO / NAWALA
                </span>
              </div>
            </div>

            <p className="text-xs text-white/50 font-light max-w-sm leading-relaxed mt-2">
              Haute beauty & precision grooming studio in Rajagiriya, Sri Lanka. Specializing in bespoke hair architecture, restorative hair botox, and calming private sanctuary experiences.
            </p>

            {/* Switch Location Button */}
            <button
              onClick={onOpenLocationSwitcher}
              className="mt-2 text-xs font-mono text-mosphere-goldLight hover:text-white uppercase tracking-wider underline underline-offset-4 flex items-center gap-1.5"
            >
              <span>Switch to Negombo Coastal Studio</span>
              <ArrowUpRight className="w-3 h-3 text-mosphere-gold" />
            </button>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mosphere-gold font-semibold mb-1">
              NAVIGATION
            </span>
            <Link href="#hero" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              Home
            </Link>
            <Link href="#about" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              01 / Introduction
            </Link>
            <Link href="#services" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              02 / Services & Menu
            </Link>
            <Link href="#story" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              03 / The Story
            </Link>
            <Link href="#gallery" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              05 / Studio Gallery
            </Link>
            <Link href="#reviews" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              06 / Client Reviews
            </Link>
            <Link href="#booking" className="text-xs text-white/70 hover:text-mosphere-gold transition-colors">
              Reserve Colombo Visit
            </Link>
          </div>

          {/* Col 3: Concierge & Location */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mosphere-gold font-semibold mb-1">
              CONCIERGE & LOCATION
            </span>
            
            <div className="flex items-start gap-2.5 text-xs text-white/70">
              <MapPin className="w-4 h-4 text-mosphere-gold shrink-0 mt-0.5" />
              <span>{loc.address}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/70">
              <Phone className="w-4 h-4 text-mosphere-gold shrink-0" />
              <a href={`tel:${loc.phone.replace(/[^0-9]/g, '')}`} className="hover:text-mosphere-gold transition-colors">
                {loc.phone}
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/70">
              <Instagram className="w-4 h-4 text-mosphere-gold shrink-0" />
              <a
                href={salonConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mosphere-gold transition-colors inline-flex items-center gap-1"
              >
                <span>{salonConfig.instagramHandle}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 text-[11px] text-white/40">
              {loc.openingHoursSummary}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40 font-mono">
          <div>
            © 2026 MOSPHERE COLOMBO. ALL RIGHTS RESERVED. &ldquo;GRAB LIFE&rdquo;
          </div>
          <div className="flex items-center gap-6">
            <span>422A NAWALA RD, RAJAGIRIYA</span>
            <Link href="/admin" className="text-white/30 hover:text-mosphere-gold transition-colors text-[10px] uppercase">
              Staff Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
