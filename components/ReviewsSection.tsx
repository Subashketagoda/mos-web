'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const verifiedReviews = [
  {
    id: 'rev-1',
    author: 'Dinuka Senanayake',
    role: 'Verified Google Review',
    rating: 5,
    quote: 'Without doubt the most refined salon experience in Colombo. The attention to detail, scalp massage ritual, and bespoke hair architecture are unmatched.',
  },
  {
    id: 'rev-2',
    author: 'Anuki Perera',
    role: 'Verified Google Review',
    rating: 5,
    quote: 'Found my holy grail salon on Nawala Road. Gorgeous aesthetics, calm private suites, and my balayage turned out so smooth, silky, and glossy!',
  },
  {
    id: 'rev-3',
    author: 'Tharindu Wickrama',
    role: 'Verified Google Review',
    rating: 5,
    quote: 'Seamless online calendar booking with instant confirmation. Master stylist was attentive, highly skilled, and delivered exactly what I asked for.',
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-28 sm:py-36 relative bg-[#060608] border-t border-white/5 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-white/10 pb-4 mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-mosphere-gold font-semibold">06</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              CLIENT TESTIMONIALS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-mosphere-gold tracking-widest uppercase">
            <span>5.0 GOOGLE RATING</span>
            <div className="flex text-mosphere-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-mosphere-gold" />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Editorial Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {verifiedReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: idx * 0.12 }}
              className="relative p-8 sm:p-10 rounded-2xl bg-[#0B0B10] border border-white/10 shadow-xl flex flex-col justify-between group hover:border-mosphere-gold/40 transition-colors duration-300"
            >
              {/* Oversized Quotation Glyph */}
              <div className="font-serif text-5xl sm:text-6xl text-mosphere-gold/25 leading-none select-none -mb-3">
                &ldquo;
              </div>

              {/* Quotation Body */}
              <p className="font-serif text-base sm:text-lg text-white/85 font-light leading-relaxed my-4 italic">
                {review.quote}
              </p>

              {/* Author Info */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                    {review.author}
                  </h4>
                  <span className="text-[10px] font-mono text-mosphere-gold tracking-widest uppercase block mt-0.5">
                    {review.role}
                  </span>
                </div>

                <div className="flex gap-0.5 text-mosphere-gold">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-mosphere-gold" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
