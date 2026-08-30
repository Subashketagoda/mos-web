'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ArrowRight } from 'lucide-react';

const negomboGalleryItems = [
  {
    id: 'neg-gal-1',
    title: 'Coastal Suite & Styling Bar',
    category: 'Sanctuary Interior',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-7 row-span-2 aspect-[4/3] sm:aspect-[16/10]',
  },
  {
    id: 'neg-gal-2',
    title: 'Bespoke Hair Architecture',
    category: 'Haute Artistry',
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-5 aspect-[4/5]',
  },
  {
    id: 'neg-gal-3',
    title: 'Pure Caviar & Keratin Infusion',
    category: 'Restorative Care',
    src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-4 aspect-square',
  },
  {
    id: 'neg-gal-4',
    title: 'Precision Taper & Beard Architecture',
    category: 'Gents Suite',
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-4 aspect-[4/3]',
  },
  {
    id: 'neg-gal-5',
    title: 'Dimensional Caramel Melt Balayage',
    category: 'Color Haute',
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-4 aspect-[3/4]',
  },
  {
    id: 'neg-gal-6',
    title: 'Hydro-Radiance Skincare Lounge',
    category: 'Aesthetic Wellness',
    src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    span: 'col-span-1 md:col-span-12 aspect-[16/9] sm:aspect-[21/9]',
  },
];

export default function NegomboGallery() {
  const [activeLightbox, setActiveLightbox] = useState<any | null>(null);

  return (
    <section id="gallery" className="py-28 sm:py-36 relative bg-[#03150F] border-t border-emerald-500/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#D4AF37] font-semibold">03</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-200/70 font-medium">
              NEGOMBO GALLERY
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-300/50 tracking-widest hidden sm:inline uppercase">
            COASTAL VISUAL JOURNAL
          </span>
        </motion.div>

        {/* Artistic Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {negomboGalleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: idx * 0.08 }}
              data-cursor="view"
              onClick={() => setActiveLightbox(item)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-emerald-500/20 hover:border-[#D4AF37]/60 bg-[#041c14] shadow-xl ${item.span}`}
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#03150F]/90 via-[#03150F]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1 transform group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37]">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-2xl font-medium text-white">
                    {item.title}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#03150F]/80 backdrop-blur-md flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black group-hover:scale-110 transition-all duration-300 shrink-0">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 sm:p-12 select-none"
            onClick={() => setActiveLightbox(null)}
          >
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37] transition-all duration-200 z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative max-w-5xl max-h-[80vh] w-full rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#03150F]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeLightbox.src}
                alt={activeLightbox.title}
                className="w-full h-full max-h-[75vh] object-contain mx-auto"
              />
              
              <div className="p-4 sm:p-6 bg-[#041c14] border-t border-emerald-500/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase block">
                    {activeLightbox.category}
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl text-white font-medium">
                    {activeLightbox.title}
                  </h4>
                </div>

                <a
                  href="#booking"
                  onClick={() => setActiveLightbox(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-[#D4AF37] hover:bg-[#F3E5AB] transition-colors uppercase flex items-center gap-1.5"
                >
                  <span>RESERVE VISIT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
