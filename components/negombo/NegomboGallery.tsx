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
  Image as ImageIcon
} from 'lucide-react';

const negomboGalleryItems = [
  {
    id: 'neg-gal-1',
    title: 'Coastal Suite & Styling Bar',
    category: 'Sanctuary Interior',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'neg-gal-2',
    title: 'Bespoke Hair Architecture',
    category: 'Haute Artistry',
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'neg-gal-3',
    title: 'Precision Razor & Steam Shave',
    category: 'Gents Grooming',
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'neg-gal-4',
    title: 'Hydro-Radiance Skincare Lounge',
    category: 'Facial Aesthetics',
    src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'neg-gal-5',
    title: 'Sunlit Balayage & Glaze',
    category: 'Color Artistry',
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'neg-gal-6',
    title: 'Coastal Marine Scalp Therapy',
    category: 'Scalp Sanctuary',
    src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
  },
];

import {
  subscribeToGallery,
  addGalleryPhotoToFirestore,
  uploadImageFile
} from '@/lib/firebaseService';

export default function NegomboGallery() {
  const [activeLightbox, setActiveLightbox] = useState<any | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Hair Botox');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>(negomboGalleryItems);

  // Live Firestore subscription - ONLY Show Negombo photos
  React.useEffect(() => {
    const unsub = subscribeToGallery((livePhotos) => {
      if (livePhotos && livePhotos.length > 0) {
        // Strict Location Filter: only photos uploaded for Negombo
        const negomboPhotos = livePhotos.filter((p) => p.location === 'negombo');
        setItems((prev) => {
          const liveFormatted = negomboPhotos.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            src: p.imageUrl,
          }));
          const liveIds = new Set(liveFormatted.map((l) => l.id));
          const remaining = negomboGalleryItems.filter((item) => !liveIds.has(item.id));
          return [...liveFormatted, ...remaining];
        });
      }
    });
    return () => unsub();
  }, []);

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile && !newPhotoUrl.trim()) {
      alert('Please select a photo from your device or enter an image link.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = newPhotoUrl.trim();
      if (photoFile) {
        finalImageUrl = await uploadImageFile(photoFile);
      }

      if (!finalImageUrl) {
        throw new Error('Could not upload image. Please try again.');
      }

      await addGalleryPhotoToFirestore({
        imageUrl: finalImageUrl,
        title: newPhotoTitle.trim() || 'Mosphere Negombo Hair Artistry',
        category: newPhotoCategory,
        aspectRatio: 'portrait',
        location: 'negombo', // Explicitly lock to Negombo gallery only!
      });
      setToastMessage('Photo uploaded & synced to coastal gallery in real-time!');
      setIsAddPhotoOpen(false);
      setNewPhotoUrl('');
      setNewPhotoTitle('');
      setPhotoFile(null);
      setPhotoPreview('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert('Error uploading photo: ' + (err.message || 'Please try again'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="gallery" className="py-28 sm:py-36 relative bg-[#03150F] border-t border-emerald-500/20 overflow-hidden">
      
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
            <span className="text-xs font-mono text-[#D4AF37] font-semibold">03</span>
            <span className="text-emerald-300/30">/</span>
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-200/70 font-medium">
              NEGOMBO GALLERY
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold font-mono tracking-wider text-black bg-gradient-to-r from-[#E5B842] via-[#F3CC68] to-[#9B7617] hover:shadow-[0_0_20px_rgba(229,184,66,0.6)] transition-all uppercase flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>+ ADD YOUR PHOTO</span>
            </button>

            <Link
              href="/gallery"
              className="px-4 py-2 rounded-full text-xs font-mono tracking-wider text-[#F3CC68] hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-[#E5B842]/40 transition-all uppercase flex items-center gap-1"
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
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#042217] via-[#063323] to-[#042217] border border-[#E5B842]/35 shadow-xl mb-12 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full border border-[#E5B842]/60 bg-[#E5B842]/10 flex items-center justify-center text-[#E5B842] shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base sm:text-lg text-white font-medium">
                Share Your Negombo Hair & Style Transformation
              </h4>
              <p className="text-xs text-emerald-100/60 font-light">
                Upload your look to be featured in our official coastal sanctuary portfolio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold font-mono tracking-wider text-black bg-[#E5B842] hover:bg-[#F3CC68] transition-all uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,184,66,0.5)]"
            >
              <Upload className="w-3.5 h-3.5 text-black" />
              <span>UPLOAD PHOTO</span>
            </button>
          </div>
        </motion.div>

        {/* Refined Coastal Sanctuary Compact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              data-cursor="view"
              onClick={() => setActiveLightbox(item)}
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border border-emerald-500/20 hover:border-[#D4AF37]/60 bg-[#041c14] shadow-lg aspect-[4/5] sm:aspect-[3/4]"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#03150F]/90 via-[#03150F]/30 to-transparent opacity-75 group-hover:opacity-95 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex items-end justify-between gap-2">
                <div className="flex flex-col gap-0.5 transform group-hover:-translate-y-0.5 transition-transform duration-300 overflow-hidden">
                  <span className="text-[9px] font-mono tracking-wider uppercase text-[#D4AF37] font-medium truncate">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xs sm:text-sm font-medium text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#D4AF37]/40 bg-[#03150F]/80 backdrop-blur-md flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black group-hover:scale-105 transition-all duration-300 shrink-0">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full Gallery Subpage CTA */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/gallery"
            className="px-8 py-3.5 rounded-full text-xs font-mono tracking-widest text-[#E5B842] border border-[#E5B842]/40 bg-[#062A1D] hover:bg-[#E5B842] hover:text-black transition-all uppercase flex items-center gap-2 group shadow-[0_0_20px_rgba(229,184,66,0.3)]"
          >
            <span>VIEW FULL PORTFOLIO SUB-PAGE</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
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

      {/* Add Photo Modal */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full rounded-3xl bg-[#03150F] border border-[#E5B842]/30 shadow-2xl p-8 overflow-hidden"
            >
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-[#E5B842]/50 bg-[#E5B842]/10 flex items-center justify-center text-[#E5B842]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-medium">Add Photo to Negombo Gallery</h3>
                  <span className="text-[10px] font-mono text-emerald-200/50 tracking-wider uppercase">Showcase Coastal Transformation</span>
                </div>
              </div>

              <form onSubmit={handleAddPhotoSubmit} className="flex flex-col gap-4">
                
                {/* Upload Mode Selector: Device or URL */}
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-emerald-500/20">
                  <button
                    type="button"
                    onClick={() => setUploadMode('device')}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                      uploadMode === 'device'
                        ? 'bg-[#E5B842] text-black font-bold shadow-md'
                        : 'text-emerald-100/60 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose from Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                      uploadMode === 'url'
                        ? 'bg-[#E5B842] text-black font-bold shadow-md'
                        : 'text-emerald-100/60 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image Link (URL)</span>
                  </button>
                </div>

                {/* Mode 1: Device File Upload */}
                {uploadMode === 'device' ? (
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-1.5">
                      Select Photo from Device *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id="negombo-gallery-file-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPhotoFile(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    
                    {!photoPreview ? (
                      <label
                        htmlFor="negombo-gallery-file-input"
                        className="cursor-pointer border-2 border-dashed border-[#E5B842]/40 hover:border-[#E5B842] bg-black/40 hover:bg-[#E5B842]/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#E5B842]/10 border border-[#E5B842]/30 flex items-center justify-center text-[#E5B842] group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-semibold text-white block mb-0.5">Click to choose photo</span>
                          <span className="text-[11px] text-emerald-200/50 block font-mono">JPG, PNG, WEBP, HEIC from phone/PC</span>
                        </div>
                      </label>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-[#E5B842]/40 bg-black aspect-video flex items-center justify-center group">
                        <img
                          src={photoPreview}
                          alt="Selected preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label
                            htmlFor="negombo-gallery-file-input"
                            className="cursor-pointer px-4 py-2 rounded-full bg-white text-black text-xs font-bold font-mono uppercase shadow-lg hover:bg-white/90"
                          >
                            Change Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoFile(null);
                              setPhotoPreview('');
                            }}
                            className="px-4 py-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold font-mono uppercase shadow-lg"
                          >
                            Remove
                          </button>
                        </div>
                        {photoFile && (
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10">
                            {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mode 2: Direct Image URL */
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-1.5">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or direct image link"
                      value={newPhotoUrl}
                      onChange={(e) => {
                        setNewPhotoUrl(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-emerald-500/20 text-white text-xs placeholder:text-emerald-100/30 focus:border-[#E5B842] focus:outline-none"
                    />
                    {newPhotoUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-emerald-500/20 bg-black">
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
                  </div>
                )}

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-1.5">
                    Title / Hairstyle Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Negombo Hair Botox Silk Glaze, Skin Fade..."
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-emerald-500/20 text-white text-xs placeholder:text-emerald-100/30 focus:border-[#E5B842] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#E5B842] block mb-1.5">
                    Category
                  </label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-emerald-500/20 text-white text-xs focus:border-[#E5B842] focus:outline-none"
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

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddPhotoOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-mono text-emerald-200/60 hover:text-white uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-[#E5B842] hover:bg-[#F3CC68] uppercase disabled:opacity-50"
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
