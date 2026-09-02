'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface NegomboServicesProps {
  onSelectService?: (service: any) => void;
}

const negomboServices = [
  {
    id: 'srv-neg-hair-botox',
    number: '01',
    name: 'Hair Botox Deep Hydration & Repair',
    category: 'Restorative Hair Lab',
    duration: '90 MIN',
    price: 'Starting LKR 14,500',
    description: 'Intense amino-collagen infusion to eliminate humidity frizz and deliver luminous glass shine.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    tag: 'Negombo Signature',
  },
  {
    id: 'srv-neg-keratin-silk',
    number: '02',
    name: 'Keratin Silk Protein Smoothing',
    category: 'Restorative Hair Lab',
    duration: '120 MIN',
    price: 'Starting LKR 18,500',
    description: 'Structural bio-smoothing protein therapy for mirror-smooth manageability and silkiness.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Long Lasting',
  },
  {
    id: 'srv-neg-gents-cut-beard',
    number: '03',
    name: 'Gents Master Cut & Beard Architecture',
    category: 'Gents Bespoke Grooming',
    duration: '45 MIN',
    price: 'Starting LKR 3,500',
    description: 'Precision fade consultation, eucalyptus hot towel steam prep, and sharp straight-razor detailing.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Master Barber',
  },
  {
    id: 'srv-neg-ladies-couture-cut',
    number: '04',
    name: 'Ladies Couture Cut & Signature Blowout',
    category: 'Ladies Hair & Styling',
    duration: '60 MIN',
    price: 'Starting LKR 4,500',
    description: 'Architectural haircut tailored to your density, finished with a high-volume runway blowout.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    tag: 'Couture Styling',
  },
  {
    id: 'srv-neg-color-balayage',
    number: '05',
    name: 'Dimensional Balayage & Gloss Tone Melt',
    category: 'Color & Highlights',
    duration: '120 MIN',
    price: 'Starting LKR 15,500',
    description: 'Sun-kissed coastal tones and organic placement with restorative gloss melt.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Coastal Tone',
  },
  {
    id: 'srv-neg-beard-sculpt',
    number: '06',
    name: 'Beard Architecture & Steam Razor Shave',
    category: 'Gents Bespoke Grooming',
    duration: '30 MIN',
    price: 'Starting LKR 2,200',
    description: 'Crisp beard sculpting, warm aromatic towel compress, and soothing balm treatment.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gents Ritual',
  },
  {
    id: 'srv-neg-scalp-detox',
    number: '07',
    name: 'Deep Scalp Detox & High-Frequency Therapy',
    category: 'Scalp & Hair Wellness',
    duration: '45 MIN',
    price: 'Starting LKR 5,500',
    description: 'Purifying scalp exfoliation, high-frequency stimulation, and botanical oil infusion.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
    tag: 'Scalp Health',
  },
];

export default function NegomboServices({ onSelectService }: NegomboServicesProps) {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [servicesList, setServicesList] = useState(negomboServices);

  // Dynamic live pricing synchronization
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
                  s.id === item.id.replace('srv-neg-', 'srv-') ||
                  s.name.toLowerCase().includes(item.name.toLowerCase().substring(0, 10)) ||
                  item.name.toLowerCase().includes(s.name.toLowerCase().substring(0, 10))
              );
              if (live && live.price !== undefined) {
                return {
                  ...item,
                  price: `Starting LKR ${Number(live.price).toLocaleString()}`,
                  duration: `${live.duration} MIN`,
                  name: live.name || item.name,
                  description: live.description || item.description,
                  rawPrice: live.price,
                };
              }
              return item;
            })
          );
        }
      } catch (err) {
        console.warn('Notice: Using default services pricing:', err);
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

  const activeService = servicesList[activeServiceIndex] || servicesList[0];

  return (
    <section id="services" className="py-28 sm:py-36 relative bg-[#042217] border-t border-[#E5B842]/20 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5B842]/25 pb-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E5B842] font-semibold">02</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-emerald-100/70 font-medium">
              OUR SERVICES
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-300/50 tracking-widest hidden sm:inline uppercase">
            NEGOMBO • RESTORATIVE & PRECISION MENU
          </span>
        </motion.div>

        {/* Pricing Transparency Note */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 px-4 py-2.5 rounded-xl bg-[#062A1D] border border-[#E5B842]/25 text-[11px] font-mono text-emerald-100/70">
          <span className="text-[#E5B842] font-semibold shrink-0">✦ STARTING RATES:</span>
          <span>Prices vary per individual depending on hair length, texture, and personalized stylist consultation.</span>
        </div>

        {/* Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Vertical Editorial List */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-[#E5B842]/15">
            {servicesList.map((service, index) => {
              const isHovered = activeServiceIndex === index;
              return (
                <div
                  key={service.id}
                  data-cursor="explore"
                  onMouseEnter={() => setActiveServiceIndex(index)}
                  onClick={() => handleSelectItem(index, service)}
                  className={`group relative py-7 sm:py-8 cursor-pointer transition-all duration-300 ${
                    isHovered ? 'pl-3 sm:pl-4 bg-[#062A1D]' : 'hover:pl-2'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-4 sm:gap-6">
                      <span
                        className={`text-xs sm:text-sm font-mono tracking-widest transition-colors duration-300 pt-1 ${
                          isHovered ? 'text-[#E5B842] font-bold scale-110' : 'text-emerald-300/40'
                        }`}
                      >
                        {service.number}
                      </span>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#E5B842]/90">
                            {service.category}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#062A1D] border border-[#E5B842]/30 text-emerald-100/70">
                            {service.duration}
                          </span>
                        </div>

                        <h3
                          className={`font-serif text-xl sm:text-2xl transition-colors duration-300 ${
                            isHovered ? 'text-white font-medium' : 'text-emerald-100/85'
                          }`}
                        >
                          {service.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-emerald-100/60 font-light leading-relaxed max-w-lg mt-1 line-clamp-2">
                          {service.description}
                        </p>

                        {isHovered && (
                          <div className="pt-2 flex sm:hidden">
                            <button
                              type="button"
                              onClick={(e) => handleProceedToBooking(e, service)}
                              className="px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-wider text-black bg-[#E5B842] font-semibold flex items-center gap-1.5 shadow-md"
                            >
                              <span>BOOK THIS SERVICE</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0 h-full pt-1">
                      <span className="font-serif text-sm sm:text-base font-medium text-[#F3CC68] whitespace-nowrap">
                        {service.price}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleProceedToBooking(e, service)}
                        aria-label={`Book ${service.name}`}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 mt-4 cursor-pointer ${
                          isHovered
                            ? 'border-[#E5B842] bg-[#E5B842] text-black shadow-[0_0_15px_rgba(229,184,66,0.6)] translate-x-1'
                            : 'border-emerald-700/40 text-emerald-300/60 bg-[#062A1D] hover:border-[#E5B842] hover:text-[#E5B842]'
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

          {/* Sticky Dynamic Preview */}
          <div className="lg:col-span-5 sticky top-28 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5B842]/35 bg-[#02180F] shadow-2xl p-2 group">
              
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
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

                <div className="absolute inset-0 bg-gradient-to-t from-[#02180F] via-[#02180F]/30 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-black bg-[#E5B842] font-bold uppercase shadow-[0_0_15px_rgba(229,184,66,0.5)]">
                    {activeService.tag}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#E5B842] uppercase">
                    {activeService.category} • {activeService.duration}
                  </span>
                  <h4 className="font-serif text-xl font-medium text-white">
                    {activeService.name}
                  </h4>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5B842]/25">
                    <span className="font-serif text-lg text-[#F3CC68]">
                      {activeService.price}
                    </span>
                    <button
                      onClick={(e) => handleProceedToBooking(e, activeService)}
                      className="px-4 py-2 rounded-full text-xs font-bold tracking-wider text-black bg-[#E5B842] hover:bg-[#F3CC68] transition-colors uppercase flex items-center gap-1.5 shadow-md"
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
