'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Menu, X, Phone, Sparkles, MapPin, Clock } from 'lucide-react';
import { salonConfig } from '@/lib/config';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      // Simple active section detection
      const sections = ['hero', 'about', 'services', 'experience', 'gallery', 'reviews', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '#hero', id: 'hero' },
    { name: 'ABOUT', href: '#about', id: 'about' },
    { name: 'SERVICES', href: '#services', id: 'services' },
    { name: 'EXPERIENCE', href: '#experience', id: 'experience' },
    { name: 'GALLERY', href: '#gallery', id: 'gallery' },
    { name: 'REVIEWS', href: '#reviews', id: 'reviews' },
    { name: 'CONTACT', href: '#contact', id: 'contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#09090B]/90 backdrop-blur-2xl border-b border-mosphere-gold/20 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5 sm:py-6 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Emblem */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              {/* Outer Subtle Halo */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mosphere-gold/40 to-mosphere-goldLight/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-mosphere-gold/60 bg-gradient-to-br from-black via-[#141419] to-black flex items-center justify-center p-2 shadow-goldGlow group-hover:border-mosphere-gold transition-all duration-300">
                <img
                  src={salonConfig.emblem}
                  alt="Mosphere Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(212,175,55,0.6)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.2em] font-semibold text-white uppercase group-hover:text-mosphere-goldLight transition-colors">
                MOSPHERE
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-mosphere-gold" />
                <span className="text-[9px] tracking-[0.3em] text-mosphere-gold uppercase font-sans font-medium">
                  GRAB LIFE
                </span>
                <span className="w-1 h-1 rounded-full bg-mosphere-gold" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-xs tracking-[0.18em] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-mosphere-gold font-semibold'
                      : 'text-white/70 hover:text-white'
                  } after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
                    isActive
                      ? 'after:w-full after:bg-gradient-to-r after:from-transparent after:via-mosphere-gold after:to-transparent'
                      : 'after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-transparent after:via-mosphere-gold/70 after:to-transparent'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3.5">
            {/* Direct Phone / Hotline Pill */}
            <a
              href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`}
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-mosphere-gold/40 text-white/80 hover:text-white transition-all text-xs flex items-center gap-2 group/phone"
              title="Call Salon Hotline"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <Phone className="w-3.5 h-3.5 text-mosphere-gold group-hover/phone:rotate-12 transition-transform" />
              <span className="text-[11px] tracking-wider font-medium text-white/90">
                {salonConfig.phone}
              </span>
            </a>

            {/* Premium CTA Button */}
            <a
              href="#booking"
              className="relative group/btn overflow-hidden px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-bold tracking-[0.16em] text-black uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.65)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
              }}
            >
              {/* Shimmer Light Reflection Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
              
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>RESERVE NOW</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <a
              href="#booking"
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-black uppercase"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 100%)',
              }}
            >
              Book
            </a>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-mosphere-gold hover:border-mosphere-gold/40 transition-all"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Luxury Full-Screen Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#070709]/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
          >
            {/* Ambient Gold Glow Behind Drawer */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-mosphere-gold/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-mosphere-gold/10 blur-3xl pointer-events-none" />

            {/* Mobile Header Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-mosphere-gold/60 bg-black p-1.5 flex items-center justify-center shadow-goldGlow">
                  <img
                    src={salonConfig.emblem}
                    alt="Mosphere"
                    className="w-full h-full object-contain filter brightness-110"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg tracking-[0.2em] font-semibold text-white">
                    MOSPHERE
                  </span>
                  <span className="text-[8px] tracking-[0.25em] text-mosphere-gold uppercase font-sans">
                    GRAB LIFE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:text-mosphere-gold hover:border-mosphere-gold/50 transition-all"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Staggered Nav Links */}
            <nav className="relative z-10 flex flex-col items-center gap-5 my-8">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.04, duration: 0.4 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-2 font-serif text-2xl tracking-[0.18em] text-white/90 hover:text-mosphere-gold transition-colors"
                >
                  <span className="text-xs text-mosphere-gold/40 group-hover:text-mosphere-gold transition-colors">✦</span>
                  <span>{link.name}</span>
                </motion.a>
              ))}

              <motion.a
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                href="#booking"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 w-full max-w-xs py-4 rounded-full text-xs font-bold tracking-[0.2em] text-black text-center uppercase shadow-goldGlow transition-transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
                }}
              >
                RESERVE APPOINTMENT
              </motion.a>
            </nav>

            {/* Mobile Footer & Instant Concierge Actions */}
            <div className="relative z-10 border-t border-white/10 pt-6 flex flex-col gap-4 text-xs text-white/70">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${salonConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all"
                >
                  <span>💬 WhatsApp</span>
                </a>
                <a
                  href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:border-mosphere-gold/40 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-mosphere-gold" />
                  <span>Call Now</span>
                </a>
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center text-[11px] text-white/40 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-mosphere-gold" />
                  <span>422A Nawala Rd, Rajagiriya</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/30">
                  <Clock className="w-3 h-3 text-mosphere-gold/60" />
                  <span>Gents: 10AM–8PM • Ladies: 10AM–7PM</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

