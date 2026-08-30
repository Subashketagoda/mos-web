'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Award, CalendarCheck, HeartHandshake } from 'lucide-react';

export default function WhyChooseSection() {
  const pillars = [
    {
      num: '01',
      title: 'PRECISION ARTISTRY',
      desc: 'Every haircut, fade, and balayage tone is customized to your unique facial geometry, bone structure, and lifestyle.',
      icon: Award,
    },
    {
      num: '02',
      title: 'DEDICATED PRIVATE SUITES',
      desc: 'Separate, serene grooming spaces for Gents and Ladies designed for total privacy, acoustic calm, and artisanal relaxation.',
      icon: Shield,
    },
    {
      num: '03',
      title: 'CERTIFIED HAIR BOTOX & KERATIN',
      desc: 'World-renowned restorative formulations that rebuild damaged hair fibers, eliminate humidity frizz, and restore mirror shine.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'SEAMLESS CONCIERGE EXPERIENCE',
      desc: 'Live Google Calendar synchronization, anti-double-booking precision, instant WhatsApp support, and dedicated guest parking.',
      icon: CalendarCheck,
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-mosphere-gold">04</span>
              <span className="text-white/20">/</span>
              <span className="text-xs uppercase tracking-[0.25em] text-white/60 font-medium">
                THE MOSPHERE STANDARD
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white">
              WHY MOSPHERE
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/50 font-light max-w-sm">
            Setting the benchmark for modern aesthetic care and personalized luxury in Rajagiriya, Sri Lanka.
          </p>
        </div>

        {/* 4 Pillars Grid with Oversized Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group p-8 rounded-2xl bg-gradient-to-b from-[#111116] to-[#0A0A0E] border border-white/10 hover:border-mosphere-gold/40 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-luxury"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-4xl sm:text-5xl font-light text-white/20 group-hover:text-mosphere-gold transition-colors">
                      {item.num}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-mosphere-gold group-hover:bg-mosphere-gold/10 group-hover:border-mosphere-gold/30 transition-all">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-white tracking-wide mb-3 group-hover:text-mosphere-goldLight transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-mosphere-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Mosphere Standard</span>
                  <span>✓</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
