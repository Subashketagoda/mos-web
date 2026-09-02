import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

/**
 * Uploads an image file:
 * 1. Tries Firebase Storage first (Cloud CDN)
 * 2. Falls back to local API endpoint (/api/upload)
 * 3. Falls back to Base64 Data URL for instant resilience
 */
export async function uploadImageFile(file: File): Promise<string> {
  // 1. Try Firebase Storage
  if (storage) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `gallery/${Date.now()}_${cleanName}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      if (downloadUrl) return downloadUrl;
    } catch (firebaseErr) {
      console.warn('Firebase Storage upload failed, trying local API upload:', firebaseErr);
    }
  }

  // 2. Try Local API upload endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
  } catch (apiErr) {
    console.warn('Local API upload failed, falling back to base64:', apiErr);
  }

  // 3. Fallback to Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export interface FirebaseReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  source: string;
  active: boolean;
  createdAt: any;
}

export interface FirebaseGalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  aspectRatio: string;
  active: boolean;
  createdAt: any;
}

export interface FirebaseBooking {
  id: string;
  bookingRef: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: string;
  notes?: string;
  createdAt: any;
}

/* =========================================================================
   1. REVIEWS REAL-TIME SERVICE
   ========================================================================= */

/**
 * Subscribes to real-time reviews from Firestore.
 * Automatically triggers callback on any addition, edit, or delete.
 */
export function subscribeToReviews(
  onUpdate: (reviews: FirebaseReview[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!db) {
    console.warn('Firestore not initialized');
    return () => {};
  }

  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: FirebaseReview[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            authorName: data.authorName || 'Guest',
            rating: data.rating || 5,
            comment: data.comment || '',
            source: data.source || 'Verified Client',
            active: data.active !== undefined ? data.active : true,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore reviews snapshot subscription error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up reviews listener:', err);
    return () => {};
  }
}

/**
 * Submits a new review to Cloud Firestore and syncs to local database.
 */
export async function addReviewToFirestore(review: {
  authorName: string;
  rating: number;
  comment: string;
  source?: string;
}) {
  const payload = {
    authorName: review.authorName.trim(),
    rating: review.rating,
    comment: review.comment.trim(),
    source: review.source || 'Verified Client Review',
    active: true,
    createdAt: serverTimestamp(),
  };

  let firestoreDocId = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), payload);
      firestoreDocId = docRef.id;
    } catch (e) {
      console.warn('Firestore review write failed (will sync to API):', e);
    }
  }

  // Dual Sync: Also send to Next.js API route to persist in SQLite
  try {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
  } catch (e) {
    console.warn('API review dual-sync warning:', e);
  }

  return { success: true, id: firestoreDocId };
}

/* =========================================================================
   2. GALLERY REAL-TIME SERVICE
   ========================================================================= */

/**
 * Subscribes to real-time gallery transformations from Firestore.
 */
export function subscribeToGallery(
  onUpdate: (photos: FirebaseGalleryItem[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!db) {
    console.warn('Firestore not initialized');
    return () => {};
  }

  try {
    const galleryRef = collection(db, 'gallery');
    const q = query(galleryRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: FirebaseGalleryItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            title: data.title || 'Mosphere Transformation',
            category: data.category || 'Hair Styling',
            aspectRatio: data.aspectRatio || 'portrait',
            active: data.active !== undefined ? data.active : true,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore gallery snapshot subscription error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up gallery listener:', err);
    return () => {};
  }
}

/**
 * Adds a new photo to Cloud Firestore and syncs to local DB.
 */
export async function addGalleryPhotoToFirestore(photo: {
  imageUrl: string;
  title: string;
  category: string;
  aspectRatio?: string;
}) {
  const payload = {
    imageUrl: photo.imageUrl.trim(),
    title: photo.title.trim(),
    category: photo.category || 'Hair Botox',
    aspectRatio: photo.aspectRatio || 'portrait',
    active: true,
    createdAt: serverTimestamp(),
  };

  let firestoreDocId = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'gallery'), payload);
      firestoreDocId = docRef.id;
    } catch (e) {
      console.warn('Firestore gallery write failed (will sync to API):', e);
    }
  }

  // Dual Sync to API
  try {
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo),
    });
  } catch (e) {
    console.warn('API gallery dual-sync warning:', e);
  }

  return { success: true, id: firestoreDocId };
}

/* =========================================================================
   3. BOOKINGS REAL-TIME SERVICE
   ========================================================================= */

/**
 * Subscribes to real-time appointments/bookings from Firestore.
 */
export function subscribeToBookings(
  onUpdate: (bookings: FirebaseBooking[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!db) {
    console.warn('Firestore not initialized');
    return () => {};
  }

  try {
    const bookingsRef = collection(db, 'bookings');

    const unsubscribe = onSnapshot(
      bookingsRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: FirebaseBooking[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            bookingRef: data.bookingRef || doc.id.substring(0, 8).toUpperCase(),
            customerName: data.customerName || 'Guest',
            phone: data.phone || '',
            email: data.email || '',
            serviceId: data.serviceId || '',
            serviceName: data.serviceName || '',
            date: data.date || '',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            duration: data.duration || 60,
            price: data.price || 0,
            status: data.status || 'confirmed',
            notes: data.notes || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });

        // In-memory sort by date DESC, startTime DESC
        items.sort((a, b) => {
          const cmp = (b.date || '').localeCompare(a.date || '');
          if (cmp !== 0) return cmp;
          return (b.startTime || '').localeCompare(a.startTime || '');
        });

        onUpdate(items);
      },
      (error) => {
        console.warn('Realtime bookings listener notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up bookings listener:', err);
    return () => {};
  }
}

/**
 * Syncs a confirmed booking to Cloud Firestore.
 */
export async function syncBookingToFirestore(booking: any) {
  if (!db) return null;

  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...booking,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Could not sync booking to Firestore:', err);
    return null;
  }
}

/**
 * Fetches all bookings from Cloud Firestore.
 */
export async function getBookingsFromFirestore(): Promise<FirebaseBooking[]> {
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, 'bookings'));
    const items: FirebaseBooking[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        bookingRef: data.bookingRef || doc.id.substring(0, 8).toUpperCase(),
        customerName: data.customerName || 'Guest',
        phone: data.phone || '',
        email: data.email || '',
        serviceId: data.serviceId || '',
        serviceName: data.serviceName || '',
        date: data.date || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        duration: data.duration || 60,
        price: data.price || 0,
        status: data.status || 'confirmed',
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
      });
    });

    items.sort((a, b) => {
      const cmp = (b.date || '').localeCompare(a.date || '');
      if (cmp !== 0) return cmp;
      return (b.startTime || '').localeCompare(a.startTime || '');
    });

    return items;
  } catch (err) {
    console.warn('Could not fetch bookings from Firestore:', err);
    return [];
  }
}

