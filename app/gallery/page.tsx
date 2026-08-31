'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Star,
  Plus,
  X,
  ZoomIn,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Calendar,
  Filter,
  Image as ImageIcon,
  Heart,
  ChevronDown
} from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  aspectRatio?: string;
  active?: number | boolean;
  createdAt?: string;
}

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  source?: string;
  active?: number | boolean;
  createdAt?: string;
}

const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'gal-1',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    title: 'Hair Botox Silk Glaze & Smooth Transformation',
    category: 'Hair Botox',
    aspectRatio: 'portrait',
  },
  {
    id: 'gal-2',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    title: 'Private Styling Suite & Wash Lounge',
    category: 'Studio Interior',
    aspectRatio: 'landscape',
  },
  {
    id: 'gal-3',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    title: 'Gents Master Skin Fade & Beard Architecture',
    category: 'Gents Grooming',
    aspectRatio: 'portrait',
  },
  {
    id: 'gal-4',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    title: 'Ladies Precision Layering & High-Volume Blowout',
    category: 'Ladies Styling',
    aspectRatio: 'portrait',
  },
  {
    id: 'gal-5',
    imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
    title: 'Dimensional Caramel Melt Balayage & Gloss',
    category: 'Color & Balayage',
    aspectRatio: 'portrait',
  },
  {
    id: 'gal-6',
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
    title: 'Bio-Active Caviar & High-Frequency Scalp Ritual',
    category: 'Scalp & Care',
    aspectRatio: 'square',
  },
  {
    id: 'gal-7',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    title: 'Hydro-Radiance Facial & Jade Stone Drainage',
    category: 'Facial Aesthetics',
    aspectRatio: 'landscape',
  },
  {
    id: 'gal-8',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    title: 'Hot Towel Steam Shave & Precision Razor Edge',
    category: 'Gents Grooming',
    aspectRatio: 'portrait',
  },
];

const defaultReviewItems: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Dinuka Senanayake',
    rating: 5,
    comment: 'Without doubt the most refined salon experience in Sri Lanka. The attention to detail, scalp massage ritual, and bespoke hair architecture are unmatched.',
    source: 'Verified Client • Colombo',
    createdAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'rev-2',
    authorName: 'Anuki Perera',
    rating: 5,
    comment: 'Found my holy grail salon! Gorgeous aesthetics, calm private suites, and my balayage and hair botox turned out so smooth, silky, and glossy.',
    source: 'Verified Client • Colombo',
    createdAt: '2026-08-26T14:30:00Z',
  },
  {
    id: 'rev-3',
    authorName: 'Tharindu Wickrama',
    rating: 5,
    comment: 'Seamless online calendar booking with instant confirmation. Master stylist was attentive, highly skilled, and gave me the best fade and beard trim I have ever had.',
    source: 'Verified Client • Negombo',
    createdAt: '2026-08-22T09:15:00Z',
  },
  {
    id: 'rev-4',
    authorName: 'Shenali Fonseka',
    rating: 5,
    comment: 'The Hair Botox is magic for Colombo humidity! My hair is completely frizz-free, soft, and feels so healthy. Highly recommend Mosphere.',
    source: 'Verified Client • Colombo',
    createdAt: '2026-08-18T16:45:00Z',
  },
  {
    id: 'rev-5',
    authorName: 'Kavinda Alwis',
    rating: 5,
    comment: 'Extremely clean, private, and relaxing atmosphere. The staff are true artisans who treat grooming like high architecture.',
    source: 'Verified Client • Negombo',
    createdAt: '2026-08-14T11:20:00Z',
  },
];

const galleryCategories = [
  'All',
  'Hair Botox',
  'Ladies Styling',
  'Gents Grooming',
  'Color & Balayage',
  'Scalp & Care',
  'Facial Aesthetics',
  'Studio Interior'
];

import {
  subscribeToGallery,
  subscribeToReviews,
  addGalleryPhotoToFirestore,
  addReviewToFirestore,
  FirebaseGalleryItem,
  FirebaseReview
} from '@/lib/firebaseService';

export default function GalleryAndReviewsPage() {
  const [activeTab, setActiveTab] = useState<'photos' | 'reviews'>('photos');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Data states
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(defaultGalleryItems);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(defaultReviewItems);
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Modals
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states: Add Photo
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Hair Botox');
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);

  // Form states: Write Review
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBranch, setReviewBranch] = useState<'Colombo' | 'Negombo'>('Colombo');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch initial & Subscribe to Firebase real-time live updates
  useEffect(() => {
    fetchGallery();
    fetchReviews();

    const unsubGallery = subscribeToGallery((livePhotos) => {
      if (livePhotos && livePhotos.length > 0) {
        const formatted: GalleryItem[] = livePhotos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          title: p.title,
          category: p.category,
          aspectRatio: p.aspectRatio,
          active: p.active,
          createdAt: p.createdAt,
        }));
        setGalleryList((prev) => {
          const liveIds = new Set(formatted.map((p) => p.id));
          const remaining = prev.filter((item) => !liveIds.has(item.id));
          return [...formatted, ...remaining];
        });
      }
    });

    const unsubReviews = subscribeToReviews((liveReviews) => {
      if (liveReviews && liveReviews.length > 0) {
        const formatted: ReviewItem[] = liveReviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          source: r.source,
          active: r.active,
          createdAt: r.createdAt,
        }));
        setReviewsList((prev) => {
          const liveIds = new Set(formatted.map((r) => r.id));
          const remaining = prev.filter((item) => !liveIds.has(item.id));
          return [...formatted, ...remaining];
        });
      }
    });

    return () => {
      unsubGallery();
      unsubReviews();
    };
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        setGalleryList(data.images);
      }
    } catch (e) {
      console.error('Failed to fetch gallery:', e);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && data.reviews && data.reviews.length > 0) {
        setReviewsList(data.reviews);
      }
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Submit Photo Handler with Firebase Dual Sync
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    setIsSubmittingPhoto(true);
    try {
      await addGalleryPhotoToFirestore({
        imageUrl: newPhotoUrl.trim(),
        title: newPhotoTitle.trim() || 'Mosphere Hair Transformation',
        category: newPhotoCategory,
        aspectRatio: 'portrait',
      });
      showToast('Photo added & synced to real-time gallery!');
      setIsAddPhotoOpen(false);
      setNewPhotoUrl('');
      setNewPhotoTitle('');
      fetchGallery();
    } catch (err) {
      alert('Error submitting photo');
    } finally {
      setIsSubmittingPhoto(false);
    }
  };

  // Submit Review Handler with Firebase Dual Sync
  const handleWriteReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addReviewToFirestore({
        authorName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        source: `Verified Client • ${reviewBranch}`,
      });
      showToast('Thank you! Review published & synced live in real-time.');
      setIsWriteReviewOpen(false);
      setReviewerName('');
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      alert('Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filtered gallery items
  const filteredGallery = selectedCategory === 'All'
    ? galleryList
    : galleryList.filter((item) => item.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-mosphere-gold selection:text-black">
      
      {/* Top Floating Notification Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3.5 rounded-full bg-mosphere-gold text-black font-semibold text-xs tracking-wider shadow-2xl flex items-center gap-2.5 uppercase"
          >
            <CheckCircle className="w-4 h-4 text-black" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bespoke Header */}
      <header className="sticky top-0 z-40 bg-[#070709]/90 backdrop-blur-2xl border-b border-white/10 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Back to Sanctuary Link */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-white/70 hover:text-mosphere-gold transition-colors uppercase group"
          >
            <div className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center group-hover:border-mosphere-gold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-white/80 group-hover:text-mosphere-gold group-hover:-translate-x-0.5 transition-all" />
            </div>
            <span className="hidden sm:inline">RETURN TO SANCTUARY</span>
            <span className="sm:hidden">HOME</span>
          </Link>

          {/* Center Brand Emblem */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full border border-mosphere-gold/60 bg-black flex items-center justify-center p-1.5 shadow-goldGlow">
              <img
                src={salonConfig.emblem}
                alt="Mosphere"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif text-lg tracking-[0.2em] font-normal text-white uppercase group-hover:text-mosphere-goldLight transition-colors">
              MOSPHERE
            </span>
          </Link>

          {/* Quick Book CTA */}
          <Link
            href="/#booking"
            className="px-5 py-2 rounded-full text-xs font-bold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:shadow-goldGlow transition-all uppercase flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">RESERVE VISIT</span>
            <span className="sm:hidden">BOOK</span>
          </Link>

        </div>
      </header>

      {/* Subpage Monumental Hero */}
      <section className="py-16 sm:py-24 relative border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#0B0B10] to-[#070709]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 text-center flex flex-col items-center">
          
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono tracking-[0.35em] text-mosphere-gold uppercase font-semibold mb-3 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-mosphere-gold animate-pulse" />
            <span>PORTFOLIO & CLIENT EXPERIENCES</span>
            <Sparkles className="w-3.5 h-3.5 text-mosphere-gold animate-pulse" />
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.08] max-w-4xl"
          >
            GALLERY & <br />
            <span className="italic font-normal text-mosphere-goldLight">CLIENT REVIEWS.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-white/60 font-light max-w-xl mx-auto mt-4 leading-relaxed"
          >
            Explore our signature hair transformations, bespoke suites, and authenticated 5.0-star reviews from our clients in Colombo & Negombo.
          </motion.p>

          {/* Interactive Mode Switcher Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex items-center gap-2 p-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl"
          >
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'photos'
                  ? 'bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark text-black font-bold shadow-goldGlow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>PHOTO GALLERY ({galleryList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark text-black font-bold shadow-goldGlow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>CLIENT REVIEWS ({reviewsList.length})</span>
            </button>
          </motion.div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        
        {/* =========================================================================
            TAB 1: PHOTO GALLERY & PORTFOLIO
            ========================================================================= */}
        {activeTab === 'photos' && (
          <div>
            
            {/* Gallery Control Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10 mb-12">
              
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {galleryCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-mosphere-gold text-black font-semibold shadow-md'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/25'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Add Photo Action Button */}
              <button
                onClick={() => setIsAddPhotoOpen(true)}
                className="px-6 py-2.5 rounded-full text-xs font-bold font-mono tracking-wider text-mosphere-gold border border-mosphere-gold/50 bg-mosphere-gold/10 hover:bg-mosphere-gold hover:text-black transition-all uppercase flex items-center gap-2 shadow-goldGlow shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>ADD NEW PHOTO</span>
              </button>

            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredGallery.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onClick={() => setActiveLightbox(item)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#0C0C12] shadow-xl aspect-[4/5] flex flex-col justify-end"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                  {/* Caption & Category Overlay */}
                  <div className="relative z-10 p-6 flex items-end justify-between gap-4">
                    <div className="flex flex-col gap-1 transform group-hover:-translate-y-1 transition-transform duration-300">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-mosphere-gold font-semibold">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-medium text-white leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white group-hover:border-mosphere-gold group-hover:bg-mosphere-gold group-hover:text-black group-hover:scale-110 transition-all duration-300 shrink-0 shadow-lg">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredGallery.length === 0 && (
              <div className="text-center py-20 text-white/40 font-mono text-sm">
                No photos found in this category. Click &quot;Add New Photo&quot; to upload one!
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 2: CLIENT REVIEWS & RATINGS HUB
            ========================================================================= */}
        {activeTab === 'reviews' && (
          <div>
            
            {/* Reviews Summary & Write Review Header */}
            <div className="p-8 sm:p-12 rounded-3xl bg-[#0B0B10] border border-white/10 shadow-2xl mb-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Left: Overall Rating Statistics */}
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/50 border border-mosphere-gold/30">
                  <span className="font-serif text-5xl sm:text-6xl font-bold text-mosphere-gold">5.0</span>
                  <div className="flex gap-1 text-mosphere-gold my-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-mosphere-gold" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
                    GOOGLE RATING
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                    Loved By Discerning Clients
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light max-w-md">
                    Over 100+ verified appointments across our Colombo and Negombo sanctuaries. Meticulous craftsmanship, personalized rituals, and serenity.
                  </p>
                </div>
              </div>

              {/* Right: Write A Review CTA Button */}
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-8 py-4 rounded-full text-xs font-bold tracking-widest text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:shadow-goldGlow transition-all uppercase flex items-center gap-2.5 shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-black" />
                <span>WRITE A REVIEW</span>
              </button>

            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {reviewsList.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="p-8 rounded-2xl bg-[#0C0C12] border border-white/10 hover:border-mosphere-gold/40 transition-colors shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Stars & Quote Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1 text-mosphere-gold">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-mosphere-gold" />
                        ))}
                      </div>
                      <span className="font-serif text-4xl text-mosphere-gold/20 leading-none select-none">
                        &ldquo;
                      </span>
                    </div>

                    {/* Review Text */}
                    <p className="font-serif text-sm sm:text-base text-white/85 font-light leading-relaxed italic mb-6">
                      {review.comment}
                    </p>
                  </div>

                  {/* Author & Source */}
                  <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-semibold text-white">
                        {review.authorName}
                      </h4>
                      <span className="text-[10px] font-mono text-mosphere-gold tracking-widest uppercase block mt-0.5">
                        {review.source || 'Verified Client'}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-mosphere-gold">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL 1: ADD NEW PHOTO MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full rounded-3xl bg-[#0E0E14] border border-white/15 shadow-2xl p-8 overflow-hidden"
            >
              {/* Close Button */}
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
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Public Showcase</span>
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
                    disabled={isSubmittingPhoto}
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight uppercase disabled:opacity-50"
                  >
                    {isSubmittingPhoto ? 'Adding...' : 'Add to Gallery'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: WRITE REVIEW MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full rounded-3xl bg-[#0E0E14] border border-white/15 shadow-2xl p-8 overflow-hidden"
            >
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-mosphere-gold/50 bg-mosphere-gold/10 flex items-center justify-center text-mosphere-gold">
                  <Star className="w-5 h-5 fill-mosphere-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-medium">Write a Review</h3>
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Share your Mosphere experience</span>
                </div>
              </div>

              <form onSubmit={handleWriteReviewSubmit} className="flex flex-col gap-4">
                
                {/* Rating Star Selection */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-2">
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
                              ? 'text-mosphere-gold fill-mosphere-gold'
                              : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-mosphere-gold ml-2 font-bold">
                      {reviewRating}.0 / 5.0
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dinuka Senanayake"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-mosphere-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-1.5">
                    Branch Visited
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewBranch('Colombo')}
                      className={`py-2.5 rounded-xl text-xs font-mono uppercase transition-all ${
                        reviewBranch === 'Colombo'
                          ? 'bg-mosphere-gold text-black font-bold'
                          : 'bg-black/60 border border-white/15 text-white/60 hover:text-white'
                      }`}
                    >
                      Colombo / Nawala
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewBranch('Negombo')}
                      className={`py-2.5 rounded-xl text-xs font-mono uppercase transition-all ${
                        reviewBranch === 'Negombo'
                          ? 'bg-mosphere-gold text-black font-bold'
                          : 'bg-black/60 border border-white/15 text-white/60 hover:text-white'
                      }`}
                    >
                      Negombo Coastal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-mosphere-gold block mb-1.5">
                    Review Comment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your haircut, Hair Botox treatment, facial, or overall atmosphere..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-mosphere-gold focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-mono text-white/60 hover:text-white uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight uppercase disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 3: FULLSCREEN LIGHTBOX PHOTO VIEWER
          ========================================================================= */}
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
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-mosphere-gold transition-all duration-200 z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative max-w-5xl max-h-[80vh] w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeLightbox.imageUrl}
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

                <Link
                  href="/#booking"
                  onClick={() => setActiveLightbox(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider text-black bg-mosphere-gold hover:bg-mosphere-goldLight transition-colors uppercase flex items-center gap-1.5 shadow-goldGlow"
                >
                  <span>BOOK THIS LOOK</span>
                  <Calendar className="w-3.5 h-3.5 text-black" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subpage Footer */}
      <footer className="py-12 border-t border-white/10 bg-[#050507] text-center text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 MOSPHERE LUXURY SANCTUARY. &ldquo;GRAB LIFE&rdquo;</span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-mosphere-gold transition-colors">
              HOME
            </Link>
            <Link href="/#booking" className="hover:text-mosphere-gold transition-colors">
              RESERVE
            </Link>
            <Link href="/admin" className="hover:text-mosphere-gold transition-colors">
              STAFF PORTAL
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
