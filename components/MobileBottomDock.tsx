'use client';

import React from 'react';
import { Calendar, MessageCircle, Phone } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface MobileBottomDockProps {
  location: 'colombo' | 'negombo';
  onOpenLocationSwitcher: () => void;
}

export default function MobileBottomDock({
  location,
  onOpenLocationSwitcher,
}: MobileBottomDockProps) {
  const isNegombo = location === 'negombo';
  const locConfig = isNegombo ? salonConfig.locations.negombo : salonConfig.locations.colombo;
  const whatsappUrl = `https://wa.me/${locConfig.whatsapp}?text=${encodeURIComponent(
    `Hello Mosphere ${locConfig.name}, I would like to inquire about booking an appointment.`
  )}`;
  const phoneUrl = `tel:${locConfig.phone.replace(/[^0-9]/g, '')}`;

  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      aria-label="Quick Concierge Navigation"
      className="fixed bottom-3 inset-x-3 z-40 lg:hidden pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      <div
        className={`pointer-events-auto max-w-md mx-auto p-1.5 rounded-full backdrop-blur-2xl border shadow-[0_12px_45px_rgba(0,0,0,0.9)] flex items-center justify-between gap-1.5 transition-all duration-300 ${
          isNegombo
            ? 'bg-[#03150F]/92 border-emerald-500/35 shadow-[0_12px_45px_rgba(3,21,15,0.9)]'
            : 'bg-[#0B0B10]/92 border-mosphere-gold/35 shadow-[0_12px_45px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* 01. Instant WhatsApp Concierge Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Concierge"
          className="w-10 h-10 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 transition-transform active:scale-95 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
        >
          <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
        </a>

        {/* 02. Direct Studio Call Button */}
        <a
          href={phoneUrl}
          aria-label="Call Salon Concierge"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-transform active:scale-95 shrink-0 ${
            isNegombo
              ? 'bg-[#062A1D] border-emerald-500/30 text-emerald-200 hover:border-emerald-400'
              : 'bg-white/5 border-white/15 text-mosphere-goldLight hover:border-mosphere-gold/50'
          }`}
        >
          <Phone className="w-4 h-4" />
        </a>

        {/* 03. Primary Hero Reserve Button */}
        <a
          href="#booking"
          onClick={scrollToBooking}
          className={`flex-1 py-2.5 px-3 sm:px-4 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${
            isNegombo
              ? 'bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] text-black shadow-[0_0_20px_rgba(229,184,66,0.4)]'
              : 'bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark text-black shadow-goldGlow'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>RESERVE VISIT</span>
        </a>

        {/* 04. Location Switcher Pill */}
        <button
          type="button"
          onClick={onOpenLocationSwitcher}
          aria-label="Switch Salon Location"
          className={`px-2.5 py-2 rounded-full border text-[9.5px] font-mono tracking-wider uppercase flex items-center gap-1 transition-transform active:scale-95 shrink-0 ${
            isNegombo
              ? 'bg-[#062A1D] border-emerald-500/40 text-[#E5B842]'
              : 'bg-white/5 border-white/15 text-mosphere-gold'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span>{isNegombo ? 'NEGOMBO' : 'COLOMBO'}</span>
        </button>
      </div>
    </aside>
  );
}
