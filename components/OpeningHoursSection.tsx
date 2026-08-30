'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, Sparkles, ShieldCheck } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function OpeningHoursSection() {
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    // Check current hour in Sri Lanka Time
    try {
      const now = new Date();
      const colomboTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
      const currentHour = colomboTime.getHours();
      setIsOpenNow(currentHour >= 10 && currentHour < 20);
    } catch {
      setIsOpenNow(true);
    }
  }, []);

  const days = [
    { name: 'Monday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
    { name: 'Tuesday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
    { name: 'Wednesday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
    { name: 'Thursday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
    { name: 'Friday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
    { name: 'Saturday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
    { name: 'Sunday', gents: '10:00 AM – 8:00 PM', ladies: '10:00 AM – 7:00 PM' },
  ];

  return (
    <section className="py-24 relative bg-[#09090B] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-mosphere-gold/30 backdrop-blur-md mb-4">
            <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white font-medium">
              {isOpenNow ? 'Currently Welcoming Guests' : 'Open Tomorrow at 10:00 AM'}
            </span>
          </div>

          <h3 className="font-serif text-3xl sm:text-5xl font-light text-white mb-3">
            SALON OPERATING HOURS
          </h3>
          <p className="text-xs sm:text-sm text-white/50 font-light">
            Dedicated private styling suites for both Gents and Ladies at 422A Nawala Road.
          </p>
        </div>

        {/* Dual Department Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Gents Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-b from-[#14141A] to-[#0E0E12] border border-white/10 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-mosphere-gold font-medium px-3 py-1 rounded-full bg-mosphere-gold/10 border border-mosphere-gold/30">
                GENTS SALON
              </span>
              <Clock className="w-5 h-5 text-mosphere-gold" />
            </div>
            <div className="text-3xl font-serif text-white font-light mb-2">
              {salonConfig.openingHoursGents}
            </div>
            <p className="text-xs text-white/60 font-light mb-6">
              Monday — Sunday (Open 7 Days a Week)
            </p>
            <div className="text-[11px] text-white/40 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Precision Hair Architecture, Hot Towel Beard Sculpt & Facials</span>
            </div>
          </motion.div>

          {/* Ladies Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl bg-gradient-to-b from-[#14141A] to-[#0E0E12] border border-white/10 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-mosphere-gold font-medium px-3 py-1 rounded-full bg-mosphere-gold/10 border border-mosphere-gold/30">
                LADIES SALON
              </span>
              <Sparkles className="w-5 h-5 text-mosphere-gold" />
            </div>
            <div className="text-3xl font-serif text-white font-light mb-2">
              {salonConfig.openingHoursLadies}
            </div>
            <p className="text-xs text-white/60 font-light mb-6">
              Monday — Sunday (Open 7 Days a Week)
            </p>
            <div className="text-[11px] text-white/40 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hair Botox, Keratin Silk, Balayage, Layering & Skincare</span>
            </div>
          </motion.div>
        </div>

        {/* Weekly Breakdown Table */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
          <div className="divide-y divide-white/5 text-xs sm:text-sm">
            {days.map((d, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-serif tracking-widest text-white font-medium uppercase w-32">{d.name}</span>
                <div className="flex items-center gap-6 text-xs text-white/70">
                  <span>Gents: <strong className="text-mosphere-cream">{d.gents}</strong></span>
                  <span>•</span>
                  <span>Ladies: <strong className="text-mosphere-goldLight">{d.ladies}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instant Contact CTA */}
        <div className="text-center mt-10">
          <p className="text-xs text-white/50 mb-4">
            Walk-ins welcome based on stylist availability • Prior appointment recommended
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#booking"
              className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase"
            >
              Book Online
            </a>
            <a
              href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`}
              className="px-6 py-3.5 rounded-full text-xs font-medium tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all uppercase flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-mosphere-gold" />
              <span>Call {salonConfig.phone}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
