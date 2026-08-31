'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ArrowRight,
  Camera,
  Plus,
  Sparkles,
  CheckCircle,
  Upload,
  Calendar
} from 'lucide-react';

const galleryItems = [
  {
    id: 'gal-1',
    title: 'Bespoke Hair Architecture',
    category: 'Haute Styling',
    aspect: 'portrait',
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-7 row-span-2 aspect-[4/3] sm:aspect-[16/10]',
  },
  {
    id: 'gal-2',
    title: 'Mosphere Private Suite',
    category: 'Sanctuary Interior',
    aspect: 'portrait',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-5 aspect-[4/5]',
  },
  {
    id: 'gal-3',
    title: 'Precision Wash & Rejuvenation Ritual',
    category: 'Scalp Therapy',
    aspect: 'square',
    src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-4 aspect-square',
  },
  {
    id: 'gal-4',
    title: 'Bio-Active Caviar & Keratin Formulations',
    category: 'Pure Care',
    aspect: 'landscape',
    src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-4 aspect-[4/3]',
  },
  {
    id: 'gal-5',
    title: 'Dimensional Tone Melt Balayage',
    category: 'Color Artistry',
    aspect: 'portrait',
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',
    span: 'col-span-1 md:col-span-6 lg:col-span-4 aspect-[3/4]',
  },
  {
    id: 'gal-6',
    title: 'Hydro-Radiance Skincare Lounge',
    category: 'Facial Aesthetics',
    aspect: 'landscape',
    src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    span: 'col-span-1 md:col-span-12 aspect-[16/9] sm:aspect-[21/9]',
  },
];

import {
  subscribeToGallery,
  addGalleryPhotoToFirestore,
  FirebaseGalleryItem
} from '@/lib/firebaseService';

export default function GallerySection() {
  const [activeLightbox, setActiveLightbox] = useState<any | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Hair Botox');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>(galleryItems);

  // Live Firestore subscription
  React.useEffect(() => {
    const unsub = subscribeToGallery((livePhotos) => {
      if (livePhotos && livePhotos.length > 0) {
        setItems((prev) => {
          const liveFormatted = livePhotos.map((p, idx) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            src: p.imageUrl,
            span: idx === 0 ? 'col-span-1 md:col-span-6 lg:col-span-7 row-span-2 aspect-[4/3] sm:aspect-[16/10]' : 'col-span-1 md:col-span-6 lg:col-span-4 aspect-[4/3]',
          }));
          const liveIds = new Set(liveFormatted.map((l) => l.id));
          const remaining = galleryItems.filter((item) => !liveIds.has(item.id));
          return [...liveFormatted, ...remaining];
        });
      }
    });
    return () => unsub();
  }, []);

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await addGalleryPhotoToFirestore({
        imageUrl: newPhotoUrl.trim(),
        title: newPhotoTitle.trim() || 'Mosphere Hair Artistry',
        category: newPhotoCategory,
        aspectRatio: 'portrait',
      });
      setToastMessage('Photo added & synced live in real-time!');
      setIsAddPhotoOpen(false);
      setNewPhotoUrl('');
      setNewPhotoTitle('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Error submitting photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="gallery" className="py-28 sm:py-36 relative bg-[#070709] border-t border-white/5 overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-full bg-mosphere-gold text-black font-bold text-xs tracking-wider shadow-2xl flex items-center gap-2 uppercase"
          >
            <CheckCircle className="w-4 h-4 text-black" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header with Direct Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-10"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-mosphere-gold font-semibold">03</span>
            <span className="text-white/20">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              STUDIO GALLERY
            </span>
          </div>

          {/* Action Hub: Add Photo & View All Subpage */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold font-mono tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:shadow-goldGlow transition-all uppercase flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>+ ADD YOUR PHOTO</span>
            </button>

            <Link
              href="/gallery"
              className="px-4 py-2 rounded-full text-xs font-mono tracking-wider text-mosphere-gold hover:text-white bg-white/5 hover:bg-white/10 border border-mosphere-gold/40 transition-all uppercase flex items-center gap-1"
            >
              <span>FULL PORTFOLIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Feature Invitation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0C0C12] via-[#12121A] to-[#0C0C12] border border-mosphere-gold/30 shadow-xl mb-12 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full border border-mosphere-gold/60 bg-mosphere-gold/10 flex items-center justify-center text-mosphere-gold shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base sm:text-lg text-white font-medium">
                Share Your Fresh Hair Transformation
              </h4>
              <p className="text-xs text-white/50 font-light">
                Add your style or look to be showcased in our official client gallery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold font-mono tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight transition-all uppercase flex items-center gap-1.5 shadow-goldGlow"
            >
              <Upload className="w-3.5 h-3.5 text-black" />
              <span>UPLOAD PHOTO</span>
            </button>
          </div>
        </motion.div>

        {/* Artistic Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: idx * 0.08 }}
              data-cursor="view"
              onClick={() => setActiveLightbox(item)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#0E0E14] shadow-xl ${item.span}`}
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Hover Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Caption & Category Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1 transform group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-mosphere-gold">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-2xl font-medium text-white">
                    {item.title}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white group-hover:border-mosphere-gold group-hover:text-mosphere-gold group-hover:scale-110 transition-all duration-300 shrink-0">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Full Gallery Subpage CTA */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/gallery"
            className="px-8 py-3.5 rounded-full text-xs font-mono tracking-widest text-mosphere-gold border border-mosphere-gold/40 bg-white/[0.02] hover:bg-mosphere-gold hover:text-black transition-all uppercase flex items-center gap-2 group shadow-goldGlow"
          >
            <span>VIEW FULL PORTFOLIO SUB-PAGE</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal Viewer */}
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
            {/* Close Button */}
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-mosphere-gold transition-all duration-200 z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative max-w-5xl max-h-[80vh] w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeLightbox.src}
                alt={activeLightbox.title}
                className="w-full h-full max-h-[75vh] object-contain mx-auto"
              />
              
              <div className="p-4 sm:p-6 bg-[#0E0E14] border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-mosphere-gold uppercase block">
                    {activeLightbox.category}
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl text-white font-medium">
                    {activeLightbox.title}
                  </h4>
                </div>

                <a
                  href="#booking"
                  onClick={() => setActiveLightbox(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight transition-colors uppercase flex items-center gap-1.5 shadow-goldGlow"
                >
                  <span>RESERVE VISIT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Photo Modal */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full rounded-3xl bg-[#0E0E14] border border-white/15 shadow-2xl p-8 overflow-hidden"
            >
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-mosphere-gold/50 bg-mosphere-gold/10 flex items-center justify-center text-mosphere-gold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-medium">Add Photo to Gallery</h3>
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Showcase Your Transformation</span>
                </div>
              </div>

              <form onSubmit={handleAddPhotoSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-1.5">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... or direct image link"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-mosphere-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-1.5">
                    Title / Hairstyle Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hair Botox Glass Glaze, Master Fade..."
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-mosphere-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-1.5">
                    Category
                  </label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-mosphere-gold focus:outline-none"
                  >
                    <option value="Hair Botox">Hair Botox</option>
                    <option value="Ladies Styling">Ladies Styling</option>
                    <option value="Gents Grooming">Gents Grooming</option>
                    <option value="Color & Balayage">Color & Balayage</option>
                    <option value="Scalp & Care">Scalp & Care</option>
                    <option value="Facial Aesthetics">Facial Aesthetics</option>
                    <option value="Studio Interior">Studio Interior</option>
                  </select>
                </div>

                {newPhotoUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                    <img
                      src={newPhotoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddPhotoOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-mono text-white/60 hover:text-white uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight uppercase disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add to Gallery'}
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
