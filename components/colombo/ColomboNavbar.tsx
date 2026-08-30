'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Menu, X, ArrowRight } from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface ColomboNavbarProps {
  onOpenLocationSwitcher: () => void;
}

export default function ColomboNavbar({ onOpenLocationSwitcher }: ColomboNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = ['hero', 'about', 'services', 'story', 'experience', 'gallery', 'reviews', 'contact'];
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
    { name: 'STORY', href: '#story', id: 'story' },
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
              ? 'bg-[#070709]/92 backdrop-blur-2xl border-white/15 shadow-[0_12px_35px_rgba(0,0,0,0.85)]'
              : 'bg-[#070709]/65 backdrop-blur-xl border-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* Left: Official Brand Logo & Branch Tag */}
          <div className="flex items-center gap-3">
            <Link href="#hero" className="flex items-center gap-2.5 group">
              <div className="h-8 sm:h-9 w-auto flex items-center">
                <img
                  src="/images/mosphere-full-logo-gold.png"
                  alt="MOSPHERE"
                  className="h-7 sm:h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(212,175,55,0.7)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col border-l border-white/15 pl-2">
                <span className="text-[8.5px] tracking-[0.25em] text-mosphere-gold font-mono font-semibold uppercase leading-none">
                  COLOMBO
                </span>
                <span className="text-[7px] tracking-[0.2em] text-white/50 font-sans uppercase mt-0.5 leading-none">
                  NAWALA
                </span>
              </div>
            </Link>

            {/* Quick Location Switcher Button */}
            <button
              onClick={onOpenLocationSwitcher}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-mosphere-gold/40 text-[9.5px] font-mono tracking-wider text-mosphere-gold uppercase transition-all duration-300 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold animate-pulse" />
              <span className="text-white/70 group-hover:text-white">NEGOMBO</span>
              <ChevronDown className="w-2.5 h-2.5 text-mosphere-gold group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Center: Sleek Magnetic Navigation Pills */}
          <nav
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden lg:flex items-center gap-0.5 bg-black/50 p-1 rounded-full border border-white/10 backdrop-blur-md"
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
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {/* Active Indicator Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeColomboPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover Highlight */}
                  {!isActive && isHovered && (
                    <motion.div
                      layoutId="hoverColomboPill"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Streamlined Reserve Button */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="#booking"
              className="group relative overflow-hidden px-5 py-2 rounded-full text-[11px] font-bold tracking-wider text-black uppercase transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.8)] hover:scale-105 flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
              }}
            >
              <Calendar className="w-3 h-3 text-black" />
              <span>BOOK NOW</span>
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenLocationSwitcher}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-[9.5px] font-mono text-mosphere-gold uppercase"
            >
              <span>COLOMBO</span>
              <ChevronDown className="w-2.5 h-2.5 text-mosphere-gold" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:border-mosphere-gold/50"
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
            className="fixed inset-0 z-40 bg-[#070709]/98 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-serif tracking-wider py-2 border-b border-white/10 ${
                    activeSection === link.id ? 'text-mosphere-gold font-medium' : 'text-white/70'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLocationSwitcher();
                }}
                className="w-full py-3 rounded-full text-xs font-mono text-mosphere-gold bg-white/5 border border-mosphere-gold/40 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>SWITCH TO NEGOMBO STUDIO</span>
                <ArrowRight className="w-3.5 h-3.5 text-mosphere-gold" />
              </button>

              <a
                href="#booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark text-center uppercase shadow-goldGlow"
              >
                RESERVE APPOINTMENT
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
