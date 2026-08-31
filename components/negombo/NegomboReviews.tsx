'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ArrowRight,
  MessageSquare,
  X,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const verifiedReviews = [
  {
    id: 'neg-rev-1',
    author: 'Dinuka Senanayake',
    role: 'Verified Google Review',
    rating: 5,
    quote: 'Without doubt the most refined salon experience. The attention to detail, scalp massage ritual, and bespoke hair architecture are unmatched.',
  },
  {
    id: 'neg-rev-2',
    author: 'Anuki Perera',
    role: 'Verified Google Review',
    rating: 5,
    quote: 'Found my holy grail salon experience. Gorgeous aesthetics, calm private suites, and my balayage turned out so smooth, silky, and glossy!',
  },
  {
    id: 'neg-rev-3',
    author: 'Tharindu Wickrama',
    role: 'Verified Google Review',
    rating: 5,
    quote: 'Seamless online calendar booking with instant confirmation. Master stylist was attentive, highly skilled, and delivered exactly what I asked for.',
  },
];

import {
  subscribeToReviews,
  addReviewToFirestore
} from '@/lib/firebaseService';

export default function NegomboReviews() {
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>(verifiedReviews);

  // Live Firestore subscription
  React.useEffect(() => {
    const unsub = subscribeToReviews((liveReviews) => {
      if (liveReviews && liveReviews.length > 0) {
        setReviews((prev) => {
          const formatted = liveReviews.map((r) => ({
            id: r.id,
            author: r.authorName,
            role: r.source || 'Verified Client • Negombo',
            rating: r.rating,
            quote: r.comment,
          }));
          const liveIds = new Set(formatted.map((f) => f.id));
          const remaining = verifiedReviews.filter((item) => !liveIds.has(item.id));
          return [...formatted, ...remaining];
        });
      }
    });
    return () => unsub();
  }, []);

  const handleWriteReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReviewToFirestore({
        authorName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        source: 'Verified Client • Negombo',
      });
      setToastMessage('Thank you! Your Negombo review has been published & synced live.');
      setIsWriteReviewOpen(false);
      setReviewerName('');
      setReviewComment('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-28 sm:py-36 relative bg-[#041c14] border-t border-emerald-500/20 overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-full bg-[#E5B842] text-black font-bold text-xs tracking-wider shadow-2xl flex items-center gap-2 uppercase"
          >
            <CheckCircle className="w-4 h-4 text-black" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header with Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/25 pb-5 mb-10"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#D4AF37] font-semibold">04</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-200/70 font-medium">
              CLIENT TESTIMONIALS
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold font-mono tracking-wider text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] hover:shadow-[0_0_20px_rgba(229,184,66,0.6)] transition-all uppercase flex items-center gap-1.5 shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5 text-black" />
              <span>+ WRITE A REVIEW</span>
            </button>

            <Link
              href="/reviews"
              className="px-4 py-2 rounded-full text-xs font-mono tracking-wider text-[#F3CC68] hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-[#E5B842]/40 transition-all uppercase flex items-center gap-1"
            >
              <span>5.0 GOOGLE RATING</span>
              <div className="flex text-[#D4AF37] ml-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                ))}
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Feature Invitation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#03150F] via-[#062A1D] to-[#03150F] border border-[#E5B842]/35 shadow-xl mb-12 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full border border-[#E5B842]/60 bg-[#E5B842]/10 flex items-center justify-center text-[#E5B842] shrink-0">
              <Star className="w-5 h-5 fill-[#E5B842]" />
            </div>
            <div>
              <h4 className="font-serif text-base sm:text-lg text-white font-medium">
                Share Your Negombo Studio Experience
              </h4>
              <p className="text-xs text-emerald-100/60 font-light">
                Rate your coastal appointment, Hair Botox treatment, or precision haircut.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold font-mono tracking-wider text-black bg-[#E5B842] hover:bg-[#F3CC68] transition-all uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,184,66,0.5)]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-black" />
              <span>LEAVE FEEDBACK</span>
            </button>
          </div>
        </motion.div>

        {/* Editorial Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: idx * 0.12 }}
              className="relative p-8 sm:p-10 rounded-2xl bg-[#03150F] border border-emerald-500/25 shadow-xl flex flex-col justify-between group hover:border-[#D4AF37]/60 transition-colors duration-300"
            >
              <div className="font-serif text-5xl sm:text-6xl text-[#D4AF37]/25 leading-none select-none -mb-3">
                &ldquo;
              </div>

              <p className="font-serif text-base sm:text-lg text-emerald-100/90 font-light leading-relaxed my-4 italic">
                {review.quote}
              </p>

              <div className="pt-6 border-t border-emerald-500/20 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                    {review.author}
                  </h4>
                  <span className="text-[10px] font-mono text-[#D4AF37] tracking-widest uppercase block mt-0.5">
                    {review.role}
                  </span>
                </div>

                <div className="flex gap-0.5 text-[#D4AF37]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Subpage CTA */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/reviews"
            className="px-8 py-3.5 rounded-full text-xs font-mono tracking-widest text-[#E5B842] border border-[#E5B842]/40 bg-[#062A1D] hover:bg-[#E5B842] hover:text-black transition-all uppercase flex items-center gap-2 group shadow-[0_0_20px_rgba(229,184,66,0.3)]"
          >
            <span>VIEW ALL CLIENT REVIEWS SUB-PAGE</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full rounded-3xl bg-[#03150F] border border-[#E5B842]/30 shadow-2xl p-8 overflow-hidden"
            >
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-[#E5B842]/50 bg-[#E5B842]/10 flex items-center justify-center text-[#E5B842]">
                  <Star className="w-5 h-5 fill-[#E5B842]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-medium">Write a Review</h3>
                  <span className="text-[10px] font-mono text-emerald-200/50 tracking-wider uppercase">Mosphere Negombo Coastal</span>
                </div>
              </div>

              <form onSubmit={handleWriteReviewSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating
                              ? 'text-[#E5B842] fill-[#E5B842]'
                              : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-[#E5B842] ml-2 font-bold">
                      {reviewRating}.0 / 5.0
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dinuka Senanayake"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-emerald-500/20 text-white text-xs placeholder:text-emerald-100/30 focus:border-[#E5B842] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-1.5">
                    Review Comment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your haircut, Hair Botox treatment, or overall experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-emerald-500/20 text-white text-xs placeholder:text-emerald-100/30 focus:border-[#E5B842] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-mono text-emerald-200/60 hover:text-white uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-[#E5B842] hover:bg-[#F3CC68] uppercase disabled:opacity-50"
                  >
                    {isSubmitting ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
