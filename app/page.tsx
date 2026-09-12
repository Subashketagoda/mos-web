'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from '@/components/CustomCursor';
import LocationSelector from '@/components/LocationSelector';
import LocationSwitcherModal from '@/components/LocationSwitcherModal';

// Colombo / Nawala Components (Urban Noir & Champagne)
import ColomboNavbar from '@/components/colombo/ColomboNavbar';
import ColomboHero from '@/components/colombo/ColomboHero';
import BrandStatement from '@/components/BrandStatement';
import ColomboServices from '@/components/colombo/ColomboServices';
import FeaturedVisual from '@/components/FeaturedVisual';
import GallerySection from '@/components/GallerySection';
import ReviewsSection from '@/components/ReviewsSection';
import ColomboLocation from '@/components/LocationSection';
import FinalCTA from '@/components/FinalCTA';
import ColomboFooter from '@/components/colombo/ColomboFooter';

// Negombo Components (Deep Emerald Green & Metallic Gold)
import NegomboNavbar from '@/components/negombo/NegomboNavbar';
import NegomboHero from '@/components/negombo/NegomboHero';
import NegomboIntro from '@/components/negombo/NegomboIntro';
import NegomboServices from '@/components/negombo/NegomboServices';
import NegomboExperience from '@/components/negombo/NegomboExperience';
import NegomboGallery from '@/components/negombo/NegomboGallery';
import NegomboReviews from '@/components/negombo/NegomboReviews';
import NegomboLocation from '@/components/negombo/NegomboLocation';
import NegomboFinalCTA from '@/components/negombo/NegomboFinalCTA';
import NegomboFooter from '@/components/negombo/NegomboFooter';

// Shared Components
import CinematicLoader from '@/components/CinematicLoader';
import BookingSection from '@/components/BookingSection';
import InstagramSection from '@/components/InstagramSection';
import MobileBottomDock from '@/components/MobileBottomDock';

export default function HomePage() {
  const [showCinematicLoader, setShowCinematicLoader] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'colombo' | 'negombo' | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [selectedServiceFromMenu, setSelectedServiceFromMenu] = useState<any>(null);

  // Show cinematic intro once per session for lightning-fast subsequent loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem('mosphere_intro_seen');
      if (!hasSeen) {
        setShowCinematicLoader(true);
      }
    }
  }, []);

  const handleLoaderComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mosphere_intro_seen', 'true');
    }
    setShowCinematicLoader(false);
  };

  const handleSelectService = (service: any) => {
    setSelectedServiceFromMenu({ ...service, _selectedAt: Date.now() });
  };

  const handleLocationSelected = (loc: 'colombo' | 'negombo') => {
    setSelectedLocation(loc);
  };

  return (
    <main className="min-h-screen bg-[#070709] text-mosphere-cream overflow-x-hidden selection:bg-mosphere-gold selection:text-black">
      {/* Bespoke Desktop Cursor */}
      <CustomCursor />

      {/* Cinematic Brand Intro Loading Screen */}
      <AnimatePresence mode="wait">
        {showCinematicLoader && (
          <CinematicLoader durationMs={950} onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>

      {/* Location Switcher Modal */}
      {isSwitcherOpen && (
        <LocationSwitcherModal
          isOpen={isSwitcherOpen}
          onClose={() => setIsSwitcherOpen(false)}
          currentLocation={selectedLocation || 'colombo'}
          onSelectLocation={(loc) => handleLocationSelected(loc)}
        />
      )}

      {/* AnimatePresence for Butter-Smooth Branch Transitions */}
      <AnimatePresence mode="wait">
        {/* 01. Initial Sanctuary Selection Screen */}
        {!selectedLocation && !showCinematicLoader && (
          <motion.div
            key="location-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <LocationSelector onSelectLocation={handleLocationSelected} />
          </motion.div>
        )}

        {/* 02. Negombo Experience (Deep Pine Emerald & Gold) */}
        {selectedLocation === 'negombo' && (
          <motion.div
            key="branch-negombo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-[#03150F] text-emerald-100 transition-colors duration-500 pb-24 lg:pb-0"
          >
            <NegomboNavbar onOpenLocationSwitcher={() => setIsSwitcherOpen(true)} />
            <NegomboHero />
            <NegomboIntro />
            <NegomboServices onSelectService={handleSelectService} />
            <NegomboExperience />
            <NegomboGallery />
            <NegomboReviews />
            <BookingSection
              initialSelectedService={selectedServiceFromMenu}
              initialLocation="negombo"
            />
            <NegomboLocation />
            <InstagramSection location="negombo" />
            <NegomboFinalCTA />
            <NegomboFooter onOpenLocationSwitcher={() => setIsSwitcherOpen(true)} />
            <MobileBottomDock
              location="negombo"
              onOpenLocationSwitcher={() => setIsSwitcherOpen(true)}
            />
          </motion.div>
        )}

        {/* 03. Colombo Experience (Urban Noir & Champagne Gold) */}
        {selectedLocation === 'colombo' && (
          <motion.div
            key="branch-colombo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-[#070709] text-mosphere-cream transition-colors duration-500 pb-24 lg:pb-0"
          >
            <ColomboNavbar onOpenLocationSwitcher={() => setIsSwitcherOpen(true)} />
            <ColomboHero />
            <BrandStatement />
            <ColomboServices onSelectService={handleSelectService} />
            <FeaturedVisual />
            <GallerySection />
            <ReviewsSection />
            <BookingSection
              initialSelectedService={selectedServiceFromMenu}
              initialLocation="colombo"
            />
            <ColomboLocation />
            <InstagramSection location="colombo" />
            <FinalCTA />
            <ColomboFooter onOpenLocationSwitcher={() => setIsSwitcherOpen(true)} />
            <MobileBottomDock
              location="colombo"
              onOpenLocationSwitcher={() => setIsSwitcherOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
