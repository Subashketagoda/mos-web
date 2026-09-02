'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface NegomboNavbarProps {
  onOpenLocationSwitcher: () => void;
}

export default function NegomboNavbar({ onOpenLocationSwitcher }: NegomboNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
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
    { name: 'LOCATION', href: '#contact', id: 'contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-3 sm:px-6 pt-2.5 sm:pt-3">
        <div
          className={`max-w-6xl mx-auto rounded-full transition-all duration-500 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border ${
            scrolled
              ? 'bg-[#02180F]/94 backdrop-blur-2xl border-[#E5B842]/35 shadow-[0_12px_35px_rgba(2,24,15,0.95)]'
              : 'bg-[#02180F]/65 backdrop-blur-xl border-[#E5B842]/20 shadow-[0_8px_25px_rgba(2,24,15,0.6)]'
          }`}
        >
          {/* Left: Official Negombo Brand Logo & Branch Tag */}
          <div className="flex items-center gap-3">
            <Link href="#hero" className="flex items-center gap-2.5 group">
              <div className="h-8 sm:h-9 w-auto flex items-center">
                <img
                  src="/images/mosphere-full-logo-gold.png"
                  alt="MOSPHERE NEGOMBO"
                  className="h-7 sm:h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(229,184,66,0.8)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col border-l border-[#E5B842]/30 pl-2">
                <span className="text-[8.5px] tracking-[0.25em] text-[#E5B842] font-mono font-semibold uppercase leading-none">
                  NEGOMBO
                </span>
                <span className="text-[7px] tracking-[0.2em] text-emerald-200/60 font-sans uppercase mt-0.5 leading-none">
                  STUDIO
                </span>
              </div>
            </Link>

            {/* Quick Location Switcher Button */}
            <button
              onClick={onOpenLocationSwitcher}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#062A1D]/80 hover:bg-[#0A3B29] border border-[#E5B842]/35 hover:border-[#E5B842] text-[9.5px] font-mono tracking-wider text-[#F3CC68] uppercase transition-all duration-300 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] animate-pulse" />
              <span className="text-emerald-100/80 group-hover:text-white">COLOMBO</span>
              <ChevronDown className="w-2.5 h-2.5 text-[#E5B842] group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Center: Sleek Magnetic Navigation Pills */}
          <nav
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden lg:flex items-center gap-0.5 bg-[#042217]/80 p-1 rounded-full border border-[#E5B842]/25 backdrop-blur-md"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              const isHovered = hoveredNav === link.id;

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onMouseEnter={() => setHoveredNav(link.id)}
                  className={`relative px-3.5 py-1 rounded-full text-[11px] font-sans tracking-[0.16em] uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-black font-semibold'
                      : isHovered
                      ? 'text-white'
                      : 'text-emerald-100/75 hover:text-white'
                  }`}
                >
                  {/* Active Indicator Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNegomboPill"
                      className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(229,184,66,0.5)]"
                      style={{
                        background: 'linear-gradient(135deg, #E5B842 0%, #F3CC68 50%, #9B7617 100%)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover Highlight */}
                  {!isActive && isHovered && (
                    <motion.div
                      layoutId="hoverNegomboPill"
                      className="absolute inset-0 rounded-full bg-[#062A1D] border border-[#E5B842]/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Streamlined Book Now Button */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="#booking"
              className="group relative overflow-hidden px-5 py-2 rounded-full text-[11px] font-bold tracking-wider text-black uppercase transition-all duration-300 shadow-[0_0_15px_rgba(229,184,66,0.4)] hover:shadow-[0_0_25px_rgba(229,184,66,0.8)] hover:scale-105 flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #E5B842 0%, #F3CC68 50%, #9B7617 100%)',
              }}
            >
              <Calendar className="w-3 h-3 text-black" />
              <span>BOOK NOW</span>
            </a>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenLocationSwitcher}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#062A1D] border border-[#E5B842]/40 text-[9.5px] font-mono text-[#F3CC68] uppercase"
            >
              <span>NEGOMBO</span>
              <ChevronDown className="w-2.5 h-2.5 text-[#E5B842]" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full bg-[#062A1D] border border-emerald-600/30 text-white hover:border-[#E5B842]/50"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#02180F]/98 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#E5B842] uppercase">COASTAL ATELIER</span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-300/60 uppercase">NEGOMBO SANCTUARY</span>
              </div>
              {navLinks.map((link, idx) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between text-lg font-serif tracking-wider py-2.5 border-b border-emerald-800/20 transition-colors ${
                    activeSection === link.id ? 'text-[#E5B842] font-medium' : 'text-emerald-100/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#E5B842]/70">0{idx + 1}</span>
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-500/30" />
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <div className="flex items-center justify-between text-xs text-emerald-200/60 font-mono py-2 border-t border-emerald-500/20">
                <span>HOTLINE:</span>
                <a href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`} className="text-[#F3CC68]">
                  {salonConfig.phone}
                </a>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLocationSwitcher();
                }}
                className="w-full py-3 rounded-full text-xs font-mono text-[#F3CC68] bg-[#062A1D] border border-[#E5B842]/50 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>SWITCH TO COLOMBO / NAWALA</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5B842]" />
              </button>

              <a
                href="#booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] text-center uppercase shadow-[0_0_20px_rgba(229,184,66,0.5)]"
              >
                BOOK APPOINTMENT
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
