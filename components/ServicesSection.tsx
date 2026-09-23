'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Clock, Sparkles, Check } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService?: (service: any) => void;
}

const verifiedServices = [
  {
    id: 'srv-hair-botox',
    number: '01',
    name: 'Hair Botox Deep Hydration & Repair Treatment',
    category: 'Restorative Hair Lab',
    duration: '90 MIN',
    price: 'Starting LKR 14,500',
    description: 'Signature restorative ritual infusing amino acids, marine collagen, and caviar oil to seal open cuticles, banish humidity frizz, and create luminous glass-like shine.',
    image: '/images/colombo/colombo-hair-treatment-1.jpg',
    tag: 'Signature Ritual',
  },
  {
    id: 'srv-keratin-silk',
    number: '02',
    name: 'Keratin Silk Protein Smoothing Therapy',
    category: 'Restorative Hair Lab',
    duration: '120 MIN',
    price: 'Starting LKR 18,500',
    description: 'Structural bio-smoothing protein therapy that reinforces the cortex, controls volume, and provides mirror-smooth, silky manageability for months.',
    image: '/images/colombo/colombo-hair-treatment-2.jpg',
    tag: 'Long Lasting',
  },
  {
    id: 'srv-gents-cut-beard',
    number: '03',
    name: 'Gents Master Cut & Beard Architecture',
    category: 'Gents Bespoke Grooming',
    duration: '45 MIN',
    price: 'Starting LKR 3,500',
    description: 'Facial-structure consultation, precision gradient taper or skin fade, eucalyptus hot towel steam prep, crisp straight razor edging, and botanical conditioning oil.',
    image: '/images/colombo/colombo-precision-hair-styling.jpg',
    tag: 'Master Barber',
  },
  {
    id: 'srv-ladies-couture-cut',
    number: '04',
    name: 'Ladies Couture Cut & Signature Blowout',
    category: 'Ladies Hair & Styling',
    duration: '60 MIN',
    price: 'Starting LKR 4,500',
    description: 'Custom layered architectural haircut tailored to hair density, scalp massage cleanse ritual, and runway-level blowout finish for maximum volume and bounce.',
    image: '/images/colombo/colombo-precision-hair-styling.jpg',
    tag: 'Couture Styling',
  },
  {
    id: 'srv-color-balayage',
    number: '05',
    name: 'Dimensional Balayage & Gloss Tone Melt',
    category: 'Color & Highlights',
    duration: '120 MIN',
    price: 'Starting LKR 15,500',
    description: 'Bespoke hand-painted freehand highlights, seamless blonde/caramel transitions, and pH-balancing gloss glaze for rich multi-tonal brilliance.',
    image: '/images/colombo/colombo-hair-treatment-1.jpg',
    tag: 'Bespoke Color',
  },
  {
    id: 'srv-beard-sculpt',
    number: '06',
    name: 'Beard Sculpture & Hot Towel Shave Ritual',
    category: 'Gents Bespoke Grooming',
    duration: '30 MIN',
    price: 'Starting LKR 2,200',
    description: 'Sharp silhouette beard contouring, dual hot & cold aromatic towel compress, and soothing post-shave sandalwood balm application.',
    image: '/images/colombo/colombo-precision-hair-styling.jpg',
    tag: 'Classic Shave',
  },
  {
    id: 'srv-scalp-detox',
    number: '07',
    name: 'Deep Scalp Detox & High-Frequency Therapy',
    category: 'Scalp & Hair Wellness',
    duration: '45 MIN',
    price: 'Starting LKR 5,500',
    description: 'Purifying scalp exfoliation, ozone follicular stimulation, essential botanical oil infusion, and therapeutic acupressure to promote strong hair growth.',
    image: '/images/colombo/colombo-hair-treatment-2.jpg',
    tag: 'Scalp Health',
  },
  {
    id: 'srv-glow-facial',
    number: '08',
    name: 'Hydro-Radiance Deep Cleanse Facial',
    category: 'Skin & Aesthetics',
    duration: '60 MIN',
    price: 'Starting LKR 7,500',
    description: 'Enzyme deep cleanse, gentle pore refinement, concentrated antioxidant serum infusion, and cryo-jade stone lymphatic drainage for immediate skin luminosity.',
    image: '/images/colombo/colombo-nails-tipsy-tips-1.jpg',
    tag: 'Skin Glow',
  },
];

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [servicesList, setServicesList] = useState(verifiedServices);

  // Dynamic live pricing and photo synchronization
  useEffect(() => {
    async function fetchLiveServices() {
      try {
        const res = await fetch('/api/services?t=' + Date.now());
        const data = await res.json();
        if (data.success && data.services && data.services.length > 0) {
          setServicesList((prev) =>
            prev.map((item) => {
              const live = data.services.find(
                (s: any) =>
                  s.id === item.id ||
                  s.id === item.id.replace('srv-col-', 'srv-') ||
                  s.name.toLowerCase().includes(item.name.toLowerCase().substring(0, 10)) ||
                  item.name.toLowerCase().includes(s.name.toLowerCase().substring(0, 10))
              );
              if (live) {
                return {
                  ...item,
                  price: live.price !== undefined ? `Starting LKR ${Number(live.price).toLocaleString()}` : item.price,
                  duration: live.duration ? `${live.duration} MIN` : item.duration,
                  name: live.name || item.name,
                  description: live.description || item.description,
                  image: live.image || item.image,
                  rawPrice: live.price,
                };
              }
              return item;
            })
          );
        }
      } catch (err) {
        console.warn('Notice: Using default services in ServicesSection:', err);
      }
    }

    fetchLiveServices();
  }, []);

  const handleSelectItem = (index: number, service: any) => {
    setActiveServiceIndex(index);
    if (onSelectService) {
      onSelectService(service);
    }
  };

  const handleProceedToBooking = (e: React.MouseEvent, service: any) => {
    e.stopPropagation();
    if (onSelectService) {
      onSelectService(service);
    }
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeService = servicesList[activeServiceIndex] || servicesList[0] || verifiedServices[0];

  return (
    <section id="services" className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-mosphere-gold font-semibold">02</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60 font-medium">
              SERVICES & OFFERINGS
            </span>
          </div>
          <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline uppercase">
            SANCTUARY CURATION • COLOMBO & NEGOMBO
          </span>
        </motion.div>

        {/* Pricing Transparency Note */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono text-white/60">
          <span className="text-mosphere-gold font-semibold shrink-0">✦ STARTING RATES:</span>
          <span>Prices vary per individual depending on hair length, texture, and personalized stylist consultation.</span>
        </div>

        {/* Dual Layout: Interactive Vertical List on Left + Floating Dynamic Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Vertical Editorial Service List */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-white/10">
            {servicesList.map((service, index) => {
              const isHovered = activeServiceIndex === index;
              return (
                <div
                  key={service.id}
                  data-cursor="explore"
                  onMouseEnter={() => setActiveServiceIndex(index)}
                  onClick={() => handleSelectItem(index, service)}
                  className={`group relative py-7 sm:py-8 cursor-pointer transition-all duration-300 ${
                    isHovered ? 'pl-3 sm:pl-4 bg-white/[0.02]' : 'hover:pl-2'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-4 sm:gap-6">
                      {/* Animated Number */}
                      <span
                        className={`text-xs sm:text-sm font-mono tracking-widest transition-colors duration-300 pt-1 ${
                          isHovered ? 'text-mosphere-gold font-bold scale-110' : 'text-white/30'
                        }`}
                      >
                        {service.number}
                      </span>

                      {/* Service Details */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-mosphere-gold/80">
                            {service.category}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                            {service.duration}
                          </span>
                        </div>

                        <h3
                          className={`font-serif text-xl sm:text-2xl transition-colors duration-300 ${
                            isHovered ? 'text-white font-medium' : 'text-white/80'
                          }`}
                        >
                          {service.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed max-w-lg mt-1 line-clamp-2">
                          {service.description}
                        </p>

                        {isHovered && (
                          <div className="pt-2 flex sm:hidden">
                            <button
                              type="button"
                              onClick={(e) => handleProceedToBooking(e, service)}
                              className="px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-wider text-black bg-mosphere-gold font-semibold flex items-center gap-1.5 shadow-goldGlow"
                            >
                              <span>BOOK THIS SERVICE</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Price & Arrow Action */}
                    <div className="flex flex-col items-end justify-between shrink-0 h-full pt-1">
                      <span className="font-serif text-sm sm:text-base font-medium text-mosphere-goldLight whitespace-nowrap">
                        {service.price}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleProceedToBooking(e, service)}
                        aria-label={`Book ${service.name}`}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 mt-4 cursor-pointer ${
                          isHovered
                            ? 'border-mosphere-gold bg-mosphere-gold text-black shadow-goldGlow translate-x-1'
                            : 'border-white/15 text-white/50 bg-white/5 hover:border-mosphere-gold hover:text-mosphere-gold'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Dynamic Visual Display */}
          <div className="lg:col-span-5 sticky top-28 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0E0E14] shadow-2xl p-2 group">
              
              {/* Active Image Box with Fade Transition (1:1 Ratio) */}
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeService.id}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    src={activeService.image}
                    alt={activeService.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Tag Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-black bg-mosphere-gold font-bold uppercase shadow-goldGlow">
                    {activeService.tag}
                  </span>
                </div>

                {/* Overlay Detail Card */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-mosphere-gold uppercase">
                    {activeService.category} • {activeService.duration}
                  </span>
                  <h4 className="font-serif text-xl font-medium text-white">
                    {activeService.name}
                  </h4>
                  <div className="flex items-center justify-between pt-3 border-t border-white/15">
                    <span className="font-serif text-lg text-mosphere-goldLight">
                      {activeService.price}
                    </span>
                    <button
                      onClick={(e) => handleProceedToBooking(e, activeService)}
                      className="px-4 py-2 rounded-full text-xs font-bold tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight transition-colors uppercase flex items-center gap-1.5"
                    >
                      <span>BOOK THIS</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
