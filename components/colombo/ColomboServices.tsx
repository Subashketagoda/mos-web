'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface ColomboServicesProps {
  onSelectService?: (service: any) => void;
}

const colomboServices = [
  {
    id: 'srv-col-hair-botox',
    number: '01',
    name: 'Hair Botox Deep Hydration & Repair',
    category: 'Restorative Hair Lab',
    duration: '90 MIN',
    price: 'Starting LKR 14,500',
    description: 'Intense amino-collagen infusion to seal cuticles, eliminate humidity frizz, and restore glass-like shine.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    tag: 'Signature Ritual',
  },
  {
    id: 'srv-col-keratin-silk',
    number: '02',
    name: 'Keratin Silk Protein Smoothing',
    category: 'Restorative Hair Lab',
    duration: '120 MIN',
    price: 'Starting LKR 18,500',
    description: 'Structural bio-smoothing protein therapy for mirror-smooth manageability and long-lasting silkiness.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Long Lasting',
  },
  {
    id: 'srv-col-gents-cut-beard',
    number: '03',
    name: 'Gents Master Cut & Beard Architecture',
    category: 'Gents Bespoke Grooming',
    duration: '45 MIN',
    price: 'Starting LKR 3,500',
    description: 'Precision taper or fade consultation, eucalyptus hot towel prep, and sharp straight-razor detailing.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Master Barber',
  },
  {
    id: 'srv-col-ladies-couture-cut',
    number: '04',
    name: 'Ladies Couture Cut & Signature Blowout',
    category: 'Ladies Hair & Styling',
    duration: '60 MIN',
    price: 'Starting LKR 4,500',
    description: 'Architectural haircut tailored to your facial geometry, finished with a high-volume runway blowout.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    tag: 'Couture Styling',
  },
  {
    id: 'srv-col-color-balayage',
    number: '05',
    name: 'Dimensional Balayage & Gloss Tone Melt',
    category: 'Color & Highlights',
    duration: '120 MIN',
    price: 'Starting LKR 15,500',
    description: 'Bespoke hand-painted highlights with seamless transitions and a radiant pH-balancing gloss tone.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bespoke Color',
  },
  {
    id: 'srv-col-beard-sculpt',
    number: '06',
    name: 'Beard Sculpture & Hot Towel Shave',
    category: 'Gents Bespoke Grooming',
    duration: '30 MIN',
    price: 'Starting LKR 2,200',
    description: 'Crisp beard contouring, dual aromatic hot towel compresses, and soothing sandalwood balm finish.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    tag: 'Classic Shave',
  },
  {
    id: 'srv-col-scalp-detox',
    number: '07',
    name: 'Deep Scalp Detox & High-Frequency Therapy',
    category: 'Scalp & Hair Wellness',
    duration: '45 MIN',
    price: 'Starting LKR 5,500',
    description: 'Exfoliating scalp cleanse, ozone stimulation, and botanical nourishment for healthy follicle growth.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
    tag: 'Scalp Health',
  },
  {
    id: 'srv-col-glow-facial',
    number: '08',
    name: 'Hydro-Radiance Deep Cleanse Facial',
    category: 'Skin & Aesthetics',
    duration: '60 MIN',
    price: 'Starting LKR 7,500',
    description: 'Enzyme pore purification, antioxidant hydration infusion, and jade-stone lymphatic sculpting.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    tag: 'Skin Glow',
  },
];

export default function ColomboServices({ onSelectService }: ColomboServicesProps) {
  const [hoveredService, setHoveredService] = useState<any | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

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
    <section id="services" className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
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
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              SERVICES & OFFERINGS
            </span>
          </div>
          <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline uppercase">
            NAWALA • BESPOKE URBAN MENU
          </span>
        </motion.div>

        {/* Pricing Transparency Note */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono text-white/60">
          <span className="text-mosphere-gold font-semibold shrink-0">✦ BESPOKE PRICING:</span>
          <span>Starting rates shown. Exact investment confirmed during your personalized stylist consultation.</span>
        </div>

        {/* Horizontal Editorial Service Blocks (Distinct Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {colomboServices.map((service, idx) => {
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
                className={`group relative p-7 sm:p-9 rounded-2xl bg-[#0C0C12] border shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-mosphere-gold ring-1 ring-mosphere-gold/40'
                    : 'border-white/10 hover:border-mosphere-gold/50'
                }`}
              >
                {/* Subtle background image reveal on hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-15 transition-opacity duration-500 scale-105 group-hover:scale-100"
                  style={{ backgroundImage: `url('${service.image}')` }}
                />

                <div>
                  {/* Header Meta */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-mono text-mosphere-gold font-semibold">
                      {service.number}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                        {service.category}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-mono">
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  {/* Service Name */}
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-medium group-hover:text-mosphere-goldLight transition-colors duration-300">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed mt-2.5">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Price and Book Action */}
                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="font-serif text-lg font-medium text-mosphere-goldLight">
                    {service.price}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleProceedToBooking(e, service)}
                    className={`flex items-center gap-2 text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-mosphere-gold text-black font-semibold shadow-goldGlow'
                        : 'text-mosphere-gold hover:text-black hover:bg-mosphere-gold border border-mosphere-gold/40'
                    }`}
                  >
                    <span>{isSelected ? 'BOOK NOW' : 'BOOK NOW'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
