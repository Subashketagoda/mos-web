'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface NegomboFooterProps {
  onOpenLocationSwitcher: () => void;
}

export default function NegomboFooter({ onOpenLocationSwitcher }: NegomboFooterProps) {
  const loc = salonConfig.locations.negombo;

  return (
    <footer className="bg-[#02180F] text-white border-t border-[#E5B842]/20 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#E5B842]/20">
          
          {/* Col 1: Brand & Official Negombo Logo */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-auto flex items-center">
                <img
                  src={salonConfig.locations.negombo.logo}
                  alt="Mosphere Negombo Logo"
                  className="h-11 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(229,184,66,0.6)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.2em] font-normal text-white uppercase">
                  MOSPHERE
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#E5B842] font-sans font-semibold uppercase -mt-0.5">
                  NEGOMBO • COASTAL STUDIO
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-100/70 font-light max-w-sm leading-relaxed mt-2">
              Tropical luxury salon and master grooming sanctuary in Negombo, Sri Lanka. Specializing in bespoke hair architecture, restorative hair botox, and calming coastal experiences.
            </p>

            {/* Switch Location Button */}
            <button
              onClick={onOpenLocationSwitcher}
              className="mt-2 text-xs font-mono text-[#F3CC68] hover:text-white uppercase tracking-wider underline underline-offset-4 flex items-center gap-1.5"
            >
              <span>Switch to Colombo / Nawala Studio</span>
              <ArrowUpRight className="w-3 h-3 text-[#E5B842]" />
            </button>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5B842] font-semibold mb-1">
              NAVIGATION
            </span>
            <Link href="#hero" className="text-xs text-emerald-100/70 hover:text-[#E5B842] transition-colors">
              Home
            </Link>
            <Link href="#about" className="text-xs text-emerald-100/70 hover:text-[#E5B842] transition-colors">
              01 / Introduction
            </Link>
            <Link href="#services" className="text-xs text-emerald-100/70 hover:text-[#E5B842] transition-colors">
              02 / Services Menu
            </Link>
            <Link href="#gallery" className="text-xs text-emerald-100/70 hover:text-[#E5B842] transition-colors">
              03 / Studio Gallery
            </Link>
            <Link href="#reviews" className="text-xs text-emerald-100/70 hover:text-[#E5B842] transition-colors">
              04 / Client Reviews
            </Link>
            <Link href="#booking" className="text-xs text-emerald-100/70 hover:text-[#E5B842] transition-colors">
              Reserve Negombo Visit
            </Link>
          </div>

          {/* Col 3: Concierge & Hours */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5B842] font-semibold mb-1">
              CONCIERGE & LOCATION
            </span>
            
            <div className="flex items-start gap-2.5 text-xs text-emerald-100/80">
              <MapPin className="w-4 h-4 text-[#E5B842] shrink-0 mt-0.5" />
              <span>{loc.address}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-emerald-100/80">
              <Phone className="w-4 h-4 text-[#E5B842] shrink-0" />
              <a href={`tel:${loc.phone.replace(/[^0-9]/g, '')}`} className="hover:text-[#E5B842] transition-colors">
                {loc.phone}
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-emerald-100/80">
              <Instagram className="w-4 h-4 text-[#E5B842] shrink-0" />
              <a
                href={loc.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E5B842] transition-colors inline-flex items-center gap-1"
              >
                <span>{loc.instagramHandle}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 text-[11px] text-emerald-300/60">
              {loc.openingHoursSummary}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-200/50 font-mono">
          <div>
            © 2026 MOSPHERE NEGOMBO. ALL RIGHTS RESERVED. &ldquo;GRAB LIFE&rdquo;
          </div>
          <div className="flex items-center gap-6">
            <span>51 GALISON MAWATHA, NEGOMBO</span>
            <Link href="/admin" className="text-emerald-300/30 hover:text-[#E5B842] transition-colors text-[10px] uppercase">
              Staff Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
