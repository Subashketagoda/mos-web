'use client';

import React, { useState } from 'react';
import CustomCursor from '@/components/CustomCursor';
import LoadingScreen from '@/components/LoadingScreen';
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
import BookingSection from '@/components/BookingSection';
import InstagramSection from '@/components/InstagramSection';

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<'colombo' | 'negombo' | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [selectedServiceFromMenu, setSelectedServiceFromMenu] = useState<any>(null);

  const handleSelectService = (service: any) => {
    setSelectedServiceFromMenu(service);
  };

  const handleLocationSelected = (loc: 'colombo' | 'negombo') => {
    setSelectedLocation(loc);
  };

  return (
    <main className="min-h-screen bg-[#070709] text-mosphere-cream overflow-x-hidden selection:bg-mosphere-gold selection:text-black">
      {/* Bespoke Desktop Cursor */}
      <CustomCursor />

      {/* 01. Initial Cinematic Loading Screen */}
      <LoadingScreen />

      {/* 02. Location Selection Choice Screen (Shown until user selects Colombo or Negombo) */}
      {!selectedLocation && (
        <LocationSelector onSelectLocation={handleLocationSelected} />
      )}

      {/* Location Switcher Modal */}
      <LocationSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentLocation={selectedLocation || 'colombo'}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />

      {/* =========================================================================
          BRANCH EXPERIENCE: NEGOMBO (DEEP EMERALD GREEN + METALLIC GOLD)
          ========================================================================= */}
      {selectedLocation === 'negombo' && (
        <div className="bg-[#03150F] text-emerald-100 transition-colors duration-500">
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
        </div>
      )}

      {/* =========================================================================
          BRANCH EXPERIENCE: COLOMBO / NAWALA (URBAN NOIR + CHAMPAGNE GOLD)
          ========================================================================= */}
      {selectedLocation === 'colombo' && (
        <div className="bg-[#070709] text-mosphere-cream transition-colors duration-500">
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
        </div>
      )}
    </main>
  );
}
