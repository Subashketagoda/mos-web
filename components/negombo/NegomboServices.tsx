'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock } from 'lucide-react';

interface NegomboServicesProps {
  onSelectService?: (service: any) => void;
}

const negomboServices = [
  {
    id: 'srv-hair-botox',
    number: '01',
    name: 'Hair Botox Deep Hydration & Repair',
    category: 'Restorative Hair Lab',
    duration: '90 MIN',
    price: 'Starting LKR 14,500',
    description: 'Intense amino-collagen infusion to eliminate humidity frizz and deliver luminous coastal glass shine.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    tag: 'Negombo Signature',
  },
  {
    id: 'srv-keratin-silk',
    number: '02',
    name: 'Keratin Silk Protein Smoothing',
    category: 'Restorative Hair Lab',
    duration: '120 MIN',
    price: 'Starting LKR 18,500',
    description: 'Structural bio-smoothing protein therapy for mirror-smooth manageability, humidity defense, and silkiness.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Long Lasting',
  },
  {
    id: 'srv-gents-cut-beard',
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
    id: 'srv-ladies-couture-cut',
    number: '04',
    name: 'Ladies Couture Cut & Signature Blowout',
    category: 'Ladies Hair & Styling',
    duration: '60 MIN',
    price: 'Starting LKR 4,500',
    description: 'Architectural haircut tailored to your density and facial geometry, finished with a high-volume blowout.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    tag: 'Couture Styling',
  },
  {
    id: 'srv-color-balayage',
    number: '05',
    name: 'Dimensional Balayage & Gloss Tone Melt',
    category: 'Color & Highlights',
    duration: '120 MIN',
    price: 'Starting LKR 15,500',
    description: 'Sun-kissed coastal tones and organic placement with seamless transitions and restorative gloss melt.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Coastal Tone',
  },
  {
    id: 'srv-beard-sculpt',
    number: '06',
    name: 'Beard Architecture & Steam Razor Shave',
    category: 'Gents Bespoke Grooming',
    duration: '30 MIN',
    price: 'Starting LKR 2,200',
    description: 'Crisp beard sculpting, warm aromatic towel compress, and soothing botanical balm treatment.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gents Ritual',
  },
  {
    id: 'srv-scalp-detox',
    number: '07',
    name: 'Deep Scalp Detox & High-Frequency Therapy',
    category: 'Scalp & Hair Wellness',
    duration: '45 MIN',
    price: 'Starting LKR 5,500',
    description: 'Purifying scalp exfoliation, high-frequency ozone stimulation, and coastal botanical oil infusion.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
    tag: 'Scalp Health',
  },
  {
    id: 'srv-glow-facial',
    number: '08',
    name: 'Hydro-Radiance Deep Cleanse Facial',
    category: 'Skin & Aesthetics',
    duration: '60 MIN',
    price: 'Starting LKR 7,500',
    description: 'Enzyme pore purification, antioxidant hydration infusion, and chilled jade stone lymphatic sculpting.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    tag: 'Skin Glow',
  },
];

export default function NegomboServices({ onSelectService }: NegomboServicesProps) {
  const [hoveredService, setHoveredService] = useState<any | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
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

  const handleSelectCard = (service: any) => {
    setSelectedServiceId(service.id);
    if (onSelectService) {
      onSelectService(service);
    }
  };

  const handleProceedToBooking = (e: React.MouseEvent, service: any) => {
    e.stopPropagation();
    setSelectedServiceId(service.id);
    if (onSelectService) {
      onSelectService(service);
    }
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-28 sm:py-36 relative bg-[#03150F] border-t border-[#E5B842]/20 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5B842]/20 pb-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E5B842] font-semibold">02</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-100/70 font-medium">
              SERVICES & OFFERINGS
            </span>
          </div>
          <span className="text-xs font-mono text-[#E5B842]/60 tracking-widest hidden sm:inline uppercase">
            NEGOMBO • RESTORATIVE & COASTAL MENU
          </span>
        </motion.div>

        {/* Pricing Transparency Note */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 py-2.5 rounded-xl bg-[#062A1D]/80 border border-[#E5B842]/20 text-[11px] font-mono text-emerald-100/70">
          <span className="text-[#E5B842] font-semibold shrink-0">✦ BESPOKE PRICING:</span>
          <span>Starting rates shown. Exact investment confirmed during your personalized stylist consultation.</span>
        </div>

        {/* Editorial Service Grid (Matching Colombo Architecture) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {servicesList.map((service, idx) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.6, delay: idx * 0.06 }}
                data-cursor="explore"
                onMouseEnter={() => setHoveredService(service)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => handleSelectCard(service)}
                className={`group relative rounded-2xl bg-[#062A1D] border shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-[#E5B842] ring-1 ring-[#E5B842]/40 shadow-[0_0_25px_rgba(229,184,66,0.2)]'
                    : 'border-[#E5B842]/20 hover:border-[#E5B842]/60'
                }`}
              >
                {/* Visual Image Header */}
                {service.image && (
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black/50">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#062A1D] via-[#062A1D]/20 to-black/35" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-xs font-mono text-[#E5B842] font-semibold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                        {service.number}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-100/90 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                        {service.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-emerald-100/80 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E5B842]" />
                        {service.duration}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    {!service.image && (
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-xs font-mono text-[#E5B842] font-semibold">
                          {service.number}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-200/60">
                            {service.category}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#03180F] border border-[#E5B842]/25 text-emerald-100/70 font-mono">
                            {service.duration}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Service Name */}
                    <h3 className="font-serif text-xl sm:text-2xl text-white font-medium group-hover:text-[#F3CC68] transition-colors duration-300">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-emerald-100/60 font-light leading-relaxed mt-2.5">
                      {service.description}
                    </p>
                  </div>

                {/* Bottom Price and Book Action */}
                <div className="pt-6 mt-6 border-t border-[#E5B842]/15 flex items-center justify-between relative z-10">
                  <span className="font-serif text-lg font-medium text-[#F3CC68]">
                    {service.price}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleProceedToBooking(e, service)}
                    className={`flex items-center gap-2 text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#E5B842] text-black font-semibold shadow-[0_0_15px_rgba(229,184,66,0.4)]'
                        : 'text-[#E5B842] hover:text-black hover:bg-[#E5B842] border border-[#E5B842]/40'
                    }`}
                  >
                    <span>{isSelected ? 'BOOK NOW' : 'BOOK NOW'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
