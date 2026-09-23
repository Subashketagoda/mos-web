'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Scissors,
  Clock,
  Ban,
  Image as ImageIcon,
  Globe,
  Plus,
  Search,
  Filter,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  Trash2,
  Edit2,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  LogOut,
  RefreshCw,
  AlertCircle,
  Shield,
  Home,
  Upload,
  Menu,
  X,
  Phone,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Sparkles,
  DollarSign,
  Users,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { salonConfig } from '@/lib/config';
import { subscribeToBookings, subscribeToGallery, uploadImageFile, compressImage, deleteGalleryPhotoFromFirestore } from '@/lib/firebaseService';
import { getServiceImage } from '@/components/BookingSection';
import {
  requestNotificationPermission,
  sendLockScreenNotification,
  getNotificationPermissionStatus,
  registerNotificationServiceWorker,
  playNotificationChime,
  subscribeToLockScreenPush,
  isPushSubscribed,
} from '@/lib/notifications';

function getInitials(name: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        dot: 'bg-emerald-400',
        label: 'Confirmed',
      };
    case 'rescheduled':
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        dot: 'bg-amber-400',
        label: 'Rescheduled',
      };
    case 'completed':
      return {
        bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        dot: 'bg-blue-400',
        label: 'Completed',
      };
    case 'no-show':
      return {
        bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        dot: 'bg-purple-400',
        label: 'No-Show',
      };
    case 'cancelled':
    default:
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        dot: 'bg-rose-400',
        label: status || 'Cancelled',
      };
  }
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'bookings' | 'services' | 'hours' | 'blocked' | 'gallery' | 'calendar'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [gcalStatus, setGcalStatus] = useState<any>(null);
  const [isFirebaseLive, setIsFirebaseLive] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Modals
  const [rescheduleModal, setRescheduleModal] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleSlotsList, setRescheduleSlotsList] = useState<any[]>([]);
  const [serviceModal, setServiceModal] = useState<any | null>(null);
  const [walkinModal, setWalkinModal] = useState(false);
  const [galleryModal, setGalleryModal] = useState(false);
  const [blockedModal, setBlockedModal] = useState(false);

  // Walk-in form
  const [walkinService, setWalkinService] = useState('');
  const [walkinDate, setWalkinDate] = useState(new Date().toISOString().split('T')[0]);
  const [walkinSlot, setWalkinSlot] = useState('');
  const [walkinSlotsList, setWalkinSlotsList] = useState<any[]>([]);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinNotes, setWalkinNotes] = useState('');

  // Service form
  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState(60);
  const [srvPrice, setSrvPrice] = useState(4500);
  const [srvCategory, setSrvCategory] = useState('Hair');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvImage, setSrvImage] = useState('');
  const [srvImageFile, setSrvImageFile] = useState<File | null>(null);
  const [srvImagePreview, setSrvImagePreview] = useState('');
  const [srvUploadMode, setSrvUploadMode] = useState<'device' | 'url'>('device');
  const [srvUploading, setSrvUploading] = useState(false);

  // Blocked Date form
  const [blkDate, setBlkDate] = useState('');
  const [blkStart, setBlkStart] = useState('');
  const [blkEnd, setBlkEnd] = useState('');
  const [blkReason, setBlkReason] = useState('');

  // Gallery form
  const [galUploadMode, setGalUploadMode] = useState<'device' | 'url'>('device');
  const [galFile, setGalFile] = useState<File | null>(null);
  const [galPreview, setGalPreview] = useState<string>('');
  const [galUrl, setGalUrl] = useState('');
  const [galTitle, setGalTitle] = useState('');
  const [galCat, setGalCat] = useState('Hair');
  const [galRatio, setGalRatio] = useState('portrait');
  const [galLocation, setGalLocation] = useState<'colombo' | 'negombo' | 'all'>('colombo');

  // Lock Screen Notification States
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificationTesting, setNotificationTesting] = useState(false);
  const notifiedKeysRef = useRef<Set<string>>((() => {
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const stored = localStorage.getItem('mosphere_notified_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set<string>(parsed);
      }
    } catch {}
    return new Set<string>();
  })());
  const sentAlertRefsRef = useRef<Set<string>>(new Set());
  const isInitialBookingsLoad = useRef(true);
  const sessionStartMsRef = useRef(Date.now());
  const startupSilenceUntilMsRef = useRef(Date.now() + 6000); // 6s silence window on page load

  // Initialize notification permission status, Service Worker, and load notified history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNotificationStatus(getNotificationPermissionStatus());
      registerNotificationServiceWorker();

      // Load already notified booking keys from localStorage so notifications never fire again on page reload
      try {
        const stored = localStorage.getItem('mosphere_notified_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            notifiedKeysRef.current = new Set(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  function checkAndNotifyNewBookings(incomingBookings: any[]) {
    if (!Array.isArray(incomingBookings) || incomingBookings.length === 0) return;

    const now = Date.now();
    const isInsideStartupGracePeriod = now < startupSilenceUntilMsRef.current;

    // First load or during initial startup grace period:
    // Mark all existing bookings as seen and save to localStorage so we NEVER notify for past bookings
    if (isInitialBookingsLoad.current || isInsideStartupGracePeriod) {
      incomingBookings.forEach((b: any) => {
        if (b.bookingRef) notifiedKeysRef.current.add(String(b.bookingRef).trim().toUpperCase());
        if (b.id) notifiedKeysRef.current.add(String(b.id).trim());
      });
      isInitialBookingsLoad.current = false;
      try {
        const keysArray = Array.from(notifiedKeysRef.current).slice(-500);
        localStorage.setItem('mosphere_notified_bookings', JSON.stringify(keysArray));
      } catch (e) {
        // ignore
      }
      return;
    }

    const newArrivals: any[] = [];
    const todayColombo = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(new Date());

    for (const b of incomingBookings) {
      const refKey = b.bookingRef ? String(b.bookingRef).trim().toUpperCase() : null;
      const idKey = b.id ? String(b.id).trim() : null;

      // 1. Skip if already seen or notified
      if (refKey && (notifiedKeysRef.current.has(refKey) || sentAlertRefsRef.current.has(refKey))) continue;
      if (idKey && (notifiedKeysRef.current.has(idKey) || sentAlertRefsRef.current.has(idKey))) continue;

      // Mark immediately to prevent duplicate alerts
      if (refKey) notifiedKeysRef.current.add(refKey);
      if (idKey) notifiedKeysRef.current.add(idKey);

      // 2. Strict timestamp verification: must have createdAt
      if (!b.createdAt) continue;
      const createdMs = new Date(b.createdAt).getTime();
      if (isNaN(createdMs)) continue;

      // 3. Skip bookings created before this admin session started or during startup
      if (createdMs <= sessionStartMsRef.current + 6000) continue;

      // 4. Skip stale bookings created more than 5 minutes ago
      if (now - createdMs > 5 * 60 * 1000) continue;

      // 5. Skip appointments on past dates
      if (b.date && b.date < todayColombo) continue;

      // 6. Skip cancelled or completed appointments
      if (b.status === 'cancelled' || b.status === 'completed') continue;

      newArrivals.push(b);
    }

    if (newArrivals.length > 0) {
      // Mark all new arrivals as alerted immediately
      newArrivals.forEach((b: any) => {
        if (b.bookingRef) sentAlertRefsRef.current.add(String(b.bookingRef).trim().toUpperCase());
        if (b.id) sentAlertRefsRef.current.add(String(b.id).trim());
      });

      // Persist notified keys to localStorage
      try {
        const keysArray = Array.from(notifiedKeysRef.current).slice(-500);
        localStorage.setItem('mosphere_notified_bookings', JSON.stringify(keysArray));
      } catch (e) {
        // ignore
      }

      // If admin tab is already active and visible on screen, play audio chime and update UI without showing an intrusive OS banner
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        playNotificationChime();
        return;
      }

      if (newArrivals.length === 1) {
        const b = newArrivals[0];
        const refKey = b.bookingRef ? String(b.bookingRef).trim().toUpperCase() : String(b.id || 'N/A');
        sendLockScreenNotification({
          title: `💈 New Booking: ${b.customerName || 'Client'}`,
          body: `✂️ ${b.serviceName || 'Salon Service'}\n📅 ${b.date} at ${b.startTime || ''}\n💰 LKR ${Number(b.price || 0).toLocaleString()} • Ref: ${refKey}\n📞 ${b.phone || ''}`,
          tag: `booking-${refKey}`,
          url: '/admin',
          playChime: true,
        });
      } else {
        // Multiple simultaneous bookings: trigger a single consolidated alert with fixed tag
        const lead = newArrivals[0];
        sendLockScreenNotification({
          title: `💈 ${newArrivals.length} New Bookings Received!`,
          body: `Latest: ${lead.customerName || 'Client'} - ${lead.serviceName || 'Service'}\nTap to view all incoming appointments in the portal.`,
          tag: 'mosphere-bulk-bookings',
          url: '/admin',
          playChime: true,
        });
      }
    }
  }

  async function handleEnableNotifications() {
    setNotificationTesting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationStatus('granted');

        // Subscribe to OS Push Service (Google FCM / Apple APNs / Mozilla)
        // This ensures lock screen notifications work EVEN WHEN the browser/tab is closed!
        const pushResult = await subscribeToLockScreenPush();

        sendLockScreenNotification({
          title: '💈 Mosphere Lock Screen Alerts Active!',
          body: pushResult.success
            ? '✅ Device registered for background lock screen push alerts! You will receive notifications even when this browser tab is closed.'
            : 'Lock screen alerts enabled for active sessions.',
          tag: 'mosphere-enabled',
          url: '/admin',
          playChime: true,
        });
      } else {
        const current = getNotificationPermissionStatus();
        setNotificationStatus(current);
        if (current === 'denied') {
          alert('Notifications are blocked in your browser settings. Please allow notifications for this site to receive lock screen alerts.');
        }
      }
    } finally {
      setNotificationTesting(false);
    }
  }

  async function handleTestNotification() {
    setNotificationTesting(true);
    try {
      if (notificationStatus !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          alert('Please grant notification permission when prompted by your browser.');
          setNotificationTesting(false);
          return;
        }
        setNotificationStatus('granted');
      }

      // Ensure push subscription is active
      await subscribeToLockScreenPush();

      // Send a single, clean test notification with fixed tag to prevent stacking
      await sendLockScreenNotification({
        title: '💈 Lock Screen Alert Test Successful!',
        body: 'Lock your phone or desktop right now! This alert appears directly on your lock screen with audio chime and vibration.',
        tag: 'mosphere-test-alert',
        url: '/admin',
        playChime: true,
      });
    } finally {
      setTimeout(() => setNotificationTesting(false), 800);
    }
  }

  // Check existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mosphere_admin_token');
    if (savedToken) {
      setToken(savedToken);
      verifySession(savedToken);
    }
  }, []);

  // Real-time live synchronization and periodic background sync for admin data
  useEffect(() => {
    if (!token) return;

    // 1. Initial Load
    loadAllData(token);

    // 2. Periodic 30-second background sync for non-Firestore endpoints (Firestore provides instant push)
    const interval = setInterval(() => {
      loadAllData(token);
    }, 30000);

    // 3. Cloud Firestore Real-time push listeners
    const unsubBookings = subscribeToBookings((liveBookings) => {
      if (liveBookings && liveBookings.length > 0) {
        checkAndNotifyNewBookings(liveBookings);
        setBookings((prev) => {
          const liveIds = new Set(liveBookings.map((b) => b.id));
          const remaining = prev.filter((p) => !liveIds.has(p.id));
          return [...liveBookings, ...remaining];
        });
      }
    });

    const unsubGallery = subscribeToGallery((livePhotos) => {
      if (livePhotos && livePhotos.length > 0) {
        setGallery((prev) => {
          const liveIds = new Set(livePhotos.map((p) => p.id));
          const remaining = prev.filter((p) => !liveIds.has(p.id));
          return [...livePhotos, ...remaining];
        });
      }
    });

    return () => {
      clearInterval(interval);
      unsubBookings();
      unsubGallery();
    };
  }, [token]);

  async function verifySession(tok: string) {
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        loadAllData(tok);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response (e.g. 500 HTML from platform)
      }
      if (res.ok && data?.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('mosphere_admin_token', data.token);
        loadAllData(data.token);
      } else {
        setLoginError(data?.error || `Authentication failed (Status ${res.status})`);
      }
    } catch {
      setLoginError('Server connection error. Please ensure the backend is active.');
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('mosphere_admin_token');
    setToken(null);
    setUser(null);
  }

  async function loadAllData(tok = token) {
    if (!tok) return;
    const h = { Authorization: `Bearer ${tok}` };

    // Stats
    fetch('/api/admin/stats', { headers: h }).then(r => r.json()).then(d => d.success && setStats(d.stats));
    // Bookings
    fetchBookings(tok);
    // Services
    fetch('/api/services?all=true&t=' + Date.now(), { headers: h }).then(r => r.json()).then(d => d.success && setServices(d.services));
    // Business Hours
    fetch('/api/admin/business-hours', { headers: h }).then(r => r.json()).then(d => d.success && setBusinessHours(d.hours));
    // Blocked Dates
    fetch('/api/admin/blocked-dates', { headers: h }).then(r => r.json()).then(d => d.success && setBlockedDates(d.blockedDates));
    // Gallery
    fetch('/api/admin/gallery', { headers: h }).then(r => r.json()).then(d => d.success && setGallery(d.images));
    // GCal
    fetch('/api/admin/calendar/status', { headers: h }).then(r => r.json()).then(d => d.success && setGcalStatus(d.diagnostic));
  }

  async function fetchBookings(tok = token) {
    if (!tok) return;
    const p = new URLSearchParams();
    if (filterDate) p.append('date', filterDate);
    if (filterStatus && filterStatus !== 'all') p.append('status', filterStatus);
    if (filterSearch) p.append('search', filterSearch);

    try {
      const res = await fetch(`/api/admin/bookings?${p.toString()}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings((prev) => {
          const apiList = data.bookings;
          const apiIds = new Set(apiList.map((b: any) => b.id || b.bookingRef));
          const nonDuplicatePrev = prev.filter((p: any) => !apiIds.has(p.id) && !apiIds.has(p.bookingRef));
          return [...apiList, ...nonDuplicatePrev];
        });
      }
    } catch (fetchErr) {
      console.warn('Notice: Background booking fetch notice:', fetchErr);
    }
  }

  // Appointment Actions
  async function handleStatusChange(bookingId: string, newStatus: string) {
    if (!token) return;
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      fetchBookings();
      loadAllData();
    }
  }

  async function handleCancel(bookingId: string) {
    if (!token) return;
    const reason = prompt('Cancellation reason:', 'Guest requested cancellation');
    if (reason === null) return;

    const res = await fetch(`/api/admin/bookings/${bookingId}?reason=${encodeURIComponent(reason)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchBookings();
      loadAllData();
    }
  }

  // Reschedule
  async function openReschedule(b: any) {
    setRescheduleModal(b);
    setRescheduleDate(b.date);
    setRescheduleSlot('');
    fetchRescheduleSlots(b.date, b.serviceId);
  }

  async function fetchRescheduleSlots(date: string, sId: string) {
    const res = await fetch(`/api/availability?date=${date}&serviceId=${sId}`);
    const data = await res.json();
    if (data.success) {
      setRescheduleSlotsList(data.slots || []);
    }
  }

  async function submitReschedule() {
    if (!rescheduleModal || !rescheduleDate || !rescheduleSlot || !token) return;
    const res = await fetch(`/api/admin/bookings/${rescheduleModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action: 'reschedule',
        newDate: rescheduleDate,
        newStartTime: rescheduleSlot,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setRescheduleModal(null);
      fetchBookings();
    } else {
      alert(data.error || 'Failed to reschedule');
    }
  }

  // Walk-in booking slot check
  useEffect(() => {
    if (walkinService && walkinDate) {
      fetch(`/api/availability?date=${walkinDate}&serviceId=${walkinService}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setWalkinSlotsList(d.slots || []);
        });
    }
  }, [walkinService, walkinDate]);

  async function submitWalkin(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !walkinService || !walkinDate || !walkinSlot || !walkinName || !walkinPhone) return;

    const res = await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        serviceId: walkinService,
        date: walkinDate,
        startTime: walkinSlot,
        customerName: walkinName,
        phone: walkinPhone,
        notes: walkinNotes,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setWalkinModal(false);
      setWalkinName('');
      setWalkinPhone('');
      setWalkinNotes('');
      fetchBookings();
      loadAllData();
    } else {
      alert(data.error || 'Failed to book');
    }
  }

  // Service Save
  async function submitService(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSrvUploading(true);

    try {
      let finalImageUrl = srvImage.trim();
      if (srvImageFile) {
        finalImageUrl = await uploadImageFile(srvImageFile, true);
      }

      const isEdit = Boolean(serviceModal?.id);
      const url = isEdit ? `/api/services/${serviceModal.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: srvName,
          duration: srvDuration,
          price: srvPrice,
          category: srvCategory,
          description: srvDesc,
          image: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setServiceModal(null);
        setSrvImage('');
        setSrvImageFile(null);
        setSrvImagePreview('');
        // Immediately update local state so changes reflect instantly in UI
        if (isEdit && serviceModal?.id) {
          setServices((prev) =>
            prev.map((s) =>
              s.id === serviceModal.id
                ? { ...s, name: srvName, duration: srvDuration, price: srvPrice, category: srvCategory, description: srvDesc, image: finalImageUrl }
                : s
            )
          );
        } else if (data.service) {
          setServices((prev) => [...prev, data.service]);
        }
        loadAllData();
      } else {
        alert(data.error || 'Failed to save service.');
      }
    } catch (err: any) {
      alert('Network error saving service: ' + err.message);
    } finally {
      setSrvUploading(false);
    }
  }

  // Delete service
  async function deleteService(id: string) {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAllData();
  }

  // Update business hours
  async function saveBusinessHours() {
    if (!token) return;
    await fetch('/api/admin/business-hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hours: businessHours }),
    });
    alert('Business hours updated.');
  }

  // Add Blocked Date
  async function submitBlockedDate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !blkDate) return;
    await fetch('/api/admin/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        date: blkDate,
        startTime: blkStart || null,
        endTime: blkEnd || null,
        reason: blkReason,
      }),
    });
    setBlockedModal(false);
    setBlkDate('');
    setBlkStart('');
    setBlkEnd('');
    setBlkReason('');
    loadAllData();
  }

  // Delete Blocked Date
  async function deleteBlockedDate(id: string) {
    await fetch(`/api/admin/blocked-dates?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAllData();
  }

  // Add Gallery Image with Device Upload & Firebase Storage Support
  async function submitGallery(e: React.FormEvent) {
    e.preventDefault();
    if (!token || (!galUrl.trim() && !galFile)) return;

    try {
      let finalImageUrl = galUrl.trim();
      if (galFile) {
        finalImageUrl = await uploadImageFile(galFile);
      }

      if (!finalImageUrl) {
        alert('Could not upload image. Please try again.');
        return;
      }

      await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          title: galTitle.trim() || 'Mosphere Hair Artistry',
          category: galCat,
          aspectRatio: galRatio,
          location: galLocation,
        }),
      });

      setGalleryModal(false);
      setGalUrl('');
      setGalTitle('');
      setGalFile(null);
      setGalPreview('');
      loadAllData();
    } catch (err: any) {
      alert('Error adding gallery image: ' + (err.message || 'Please try again'));
    }
  }

  async function deleteGallery(id: string) {
    if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;

    // 1. Optimistic instant UI update
    setGallery((prev) => prev.filter((item) => item.id !== id && item.imageUrl !== id));

    // 2. Direct Cloud Firestore deletion
    try {
      await deleteGalleryPhotoFromFirestore(id);
    } catch (fsErr) {
      console.warn('Client Firestore delete notice:', fsErr);
    }

    // 3. API delete (SQLite + Firestore fallback)
    try {
      await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (apiErr) {
      console.warn('API delete notice:', apiErr);
    }

    // 4. Resync all data
    loadAllData();
  }

  // =========================================================
  // RENDER: LOGIN FORM IF NOT AUTHENTICATED
  // =========================================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#050508] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-[#07070A] to-[#040406] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Ambient background glow elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-mosphere-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-gradient-to-b from-[#12121A]/90 to-[#0A0A0E]/95 backdrop-blur-2xl border border-mosphere-gold/30 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.06)] text-center overflow-hidden">
          {/* Subtle top gold accent line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold to-transparent" />

          <div className="w-16 h-16 rounded-2xl border border-mosphere-gold/50 flex items-center justify-center mx-auto mb-5 bg-black/60 p-2.5 overflow-hidden shadow-goldGlow relative group">
            <div className="absolute inset-0 bg-mosphere-gold/10 rounded-2xl blur group-hover:bg-mosphere-gold/20 transition-colors" />
            <img
              src="/images/mosphere-emblem-gold.png"
              alt="Mosphere"
              className="w-full h-full object-contain filter brightness-110 relative z-10"
            />
          </div>

          <span className="text-[10px] font-mono tracking-[0.25em] text-mosphere-gold uppercase block mb-1">
            HAUTE BEAUTY & GROOMING
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white mb-2">
            MOSPHERE CONCIERGE
          </h2>
          <p className="text-xs text-white/50 mb-7 leading-relaxed">
            Staff & Appointments Management Suite
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter concierge username"
                className="w-full bg-[#08080C]/80 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-white/20 focus:outline-none focus:border-mosphere-gold focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#08080C]/80 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-white/20 focus:outline-none focus:border-mosphere-gold focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl text-xs font-semibold tracking-widest text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase mt-3 active:scale-[0.98] hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Concierge</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <Link href="/" className="hover:text-mosphere-gold transition-colors flex items-center gap-1">
              <span>← Customer Website</span>
            </Link>
            <span className="font-mono text-[10px] text-white/30">v2.0 • Secured</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: ADMIN DASHBOARD
  // =========================================================
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarIcon },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'hours', label: 'Opening Hours', icon: Clock },
    { id: 'blocked', label: 'Blocked Dates', icon: Ban },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'calendar', label: 'Google Calendar', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex selection:bg-mosphere-gold/20 selection:text-mosphere-gold">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#0A0A0E] border-r border-white/10 flex flex-col justify-between p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-mosphere-gold/40 flex items-center justify-center bg-black/80 p-2 shadow-goldGlow">
                    <img
                      src="/images/mosphere-emblem-gold.png"
                      alt="Mosphere"
                      className="w-full h-full object-contain filter brightness-110"
                    />
                  </div>
                  <div>
                    <div className="font-serif text-base font-semibold tracking-wider text-white">MOSPHERE</div>
                    <div className="text-[9px] text-mosphere-gold uppercase tracking-widest font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Concierge Portal</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live sync indicators in mobile drawer */}
              <div className="py-3.5 space-y-2 border-b border-white/5">
                <div className="text-[11px] px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-mono text-[10px]">Firebase Realtime Sync: Live</span>
                </div>
                {gcalStatus && (
                  <div className={`text-[11px] px-3 py-1.5 rounded-full border flex items-center gap-2 ${
                    gcalStatus.status === 'connected'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span className="font-mono text-[10px]">GCal: {gcalStatus.status === 'connected' ? 'Connected' : 'Simulation'}</span>
                  </div>
                )}
              </div>

              <nav className="py-4 space-y-1.5">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = tab === item.id;
                  const bookingCount = item.id === 'bookings' ? (stats?.todayCount || 0) : 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium tracking-wider uppercase transition-all ${
                        isActive
                          ? 'border-l-2 border-mosphere-gold bg-gradient-to-r from-mosphere-gold/15 via-mosphere-gold/5 to-transparent text-mosphere-gold font-semibold shadow-inner'
                          : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-mosphere-gold' : 'text-white/50'}`} />
                        <span>{item.label}</span>
                      </div>
                      {bookingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-mosphere-gold/20 border border-mosphere-gold/40 text-mosphere-gold">
                          {bookingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-mosphere-gold transition-colors rounded-xl hover:bg-white/5"
              >
                <Home className="w-4 h-4 text-mosphere-gold/70" />
                <span>Customer Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 transition-colors rounded-xl hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-gradient-to-b from-[#0C0C12] via-[#09090D] to-[#07070A] border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex z-20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl border border-mosphere-gold/40 flex items-center justify-center bg-black/80 p-2 shadow-goldGlow">
              <img
                src="/images/mosphere-emblem-gold.png"
                alt="Mosphere"
                className="w-full h-full object-contain filter brightness-110"
              />
            </div>
            <div>
              <div className="font-serif text-base font-semibold tracking-wider text-white">MOSPHERE</div>
              <div className="text-[9px] text-mosphere-gold uppercase tracking-widest font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Concierge Lead</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = tab === item.id;
              const bookingCount = item.id === 'bookings' ? (stats?.todayCount || 0) : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium tracking-wider uppercase transition-all group ${
                    isActive
                      ? 'border-l-[3px] border-mosphere-gold bg-gradient-to-r from-mosphere-gold/15 via-mosphere-gold/5 to-transparent text-mosphere-gold font-semibold shadow-inner'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-mosphere-gold' : 'text-white/40'}`} />
                    <span>{item.label}</span>
                  </div>
                  {bookingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-mosphere-gold/20 border border-mosphere-gold/40 text-mosphere-gold">
                      {bookingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {/* Staff Online Widget */}
          <div className="mx-3 mb-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mosphere-gold/30 to-black border border-mosphere-gold/40 flex items-center justify-center font-serif text-xs text-mosphere-gold font-bold shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">Colombo Concierge</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Operations</span>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-white/10 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:text-mosphere-gold transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              <Home className="w-4 h-4 text-mosphere-gold/70" />
              <span>Customer Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors rounded-lg hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-x-hidden min-w-0 bg-[#07070A]">
        
        {/* Topbar */}
        <header className="h-16 bg-[#0B0B10]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button & Brand */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="md:hidden p-2 -ml-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <img
                src="/images/mosphere-emblem-gold.png"
                alt="Mosphere"
                className="w-6 h-6 object-contain"
              />
              <span className="font-serif font-semibold text-sm tracking-wider text-white">MOSPHERE</span>
            </div>

            {/* Desktop Brand / Status labels */}
            <div className="hidden md:flex items-center gap-3 min-w-0">
              <span className="text-xs uppercase tracking-widest text-mosphere-gold font-medium truncate">
                Staff Portal • {salonConfig.address}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Firebase Sync: Live</span>
              </span>
              {gcalStatus && (
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${
                  gcalStatus.status === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>GCal: {gcalStatus.status === 'connected' ? 'Connected' : 'Simulation'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Lock Screen Notification Controls */}
            {notificationStatus === 'granted' ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={notificationTesting}
                  title="Send a test alert to your lock screen right now"
                  className="px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-mono font-medium border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Lock Screen Alerts: ON</span>
                  <span className="lg:hidden">Alerts ON</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                    {notificationTesting ? 'Testing...' : 'Test'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnableNotifications}
                title="Enable sound and lock screen alerts on this device for new bookings"
                className="px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border border-mosphere-gold/50 bg-mosphere-gold/15 text-mosphere-gold hover:bg-mosphere-gold hover:text-black transition-all flex items-center gap-1.5 shadow-goldGlow animate-pulse"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Turn On Lock Screen Alerts</span>
                <span className="sm:hidden">Alerts</span>
              </button>
            )}

            <button
              onClick={() => {
                if (token) loadAllData(token);
              }}
              title="Refresh Bookings & Data"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-mosphere-gold" />
              <span className="hidden sm:inline text-[11px] tracking-wider uppercase font-medium">Refresh</span>
            </button>

            <button
              onClick={() => {
                if (services.length > 0) setWalkinService(services[0].id);
                setWalkinModal(true);
              }}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase flex items-center gap-1.5 active:scale-95 hover:brightness-110 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Walk-In</span>
              <span className="sm:hidden">Walk-In</span>
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto pb-24 md:pb-8">

          {/* ==========================================
               TAB 1: DASHBOARD OVERVIEW
               ========================================== */}
          {tab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Header with Date Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Concierge Overview</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-mosphere-gold/15 border border-mosphere-gold/30 text-mosphere-gold font-semibold">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-white/50">Today&apos;s scheduled arrivals, guest requests, and salon performance.</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-mono text-xs text-mosphere-gold font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-white/40 block font-mono">Colombo Local Time</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Today's Bookings */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#13131D]/90 to-[#0A0A0F]/90 border border-white/10 hover:border-mosphere-gold/40 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-medium">Today&apos;s Bookings</span>
                    <div className="w-8 h-8 rounded-xl bg-mosphere-gold/15 border border-mosphere-gold/30 flex items-center justify-center text-mosphere-gold">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">{stats?.todayCount || 0}</div>
                  <span className="text-[11px] text-mosphere-gold font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-mosphere-gold animate-pulse" />
                    <span>Expected Arrivals</span>
                  </span>
                </div>

                {/* 2. Today's Revenue */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#13131D]/90 to-[#0A0A0F]/90 border border-white/10 hover:border-mosphere-gold/40 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-medium">Today&apos;s Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-mosphere-gold/15 border border-mosphere-gold/30 flex items-center justify-center text-mosphere-gold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-mosphere-goldLight truncate">
                    LKR {(stats?.todayRevenue || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-white/40 mt-1 block">Scheduled today</span>
                </div>

                {/* 3. Upcoming */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#13131D]/90 to-[#0A0A0F]/90 border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-medium">Upcoming (30 Days)</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">{stats?.upcomingCount || 0}</div>
                  <span className="text-[11px] text-white/40 mt-1 block">Confirmed reservations</span>
                </div>

                {/* 4. Total Completed */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#13131D]/90 to-[#0A0A0F]/90 border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-medium">Total Completed</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 tracking-tight">{stats?.completedCount || 0}</div>
                  <span className="text-[11px] text-white/40 mt-1 block truncate">LKR {(stats?.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Lock Screen Notification Concierge Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#12111A] via-[#16141F] to-[#0E0D14] border border-mosphere-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-mosphere-gold/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start sm:items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mosphere-gold/20 to-black/60 border border-mosphere-gold/40 flex items-center justify-center shrink-0 shadow-goldGlow">
                    <BellRing className="w-6 h-6 text-mosphere-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-serif text-base sm:text-lg font-medium text-white tracking-wide">Device Lock Screen Alerts</h4>
                      <span className={`text-[10px] font-mono px-3 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        notificationStatus === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {notificationStatus === 'granted' ? '● Active on this Device' : '● Setup Required'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1.5 leading-relaxed max-w-2xl font-light">
                      Phone එක lock කර හෝ browser එක background එකේ තිබුණද, customer කෙනෙක් appointment එකක් book කළ සැනින් lock screen එකට sound සහ vibration සමඟ instant alert එකක් ලැබෙයි.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto relative z-10">
                  {notificationStatus !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleEnableNotifications}
                      className="w-full md:w-auto px-5 py-3 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark hover:brightness-110 transition-all uppercase shadow-goldGlow flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Bell className="w-3.5 h-3.5 text-black" />
                      <span>Enable on this Device</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTestNotification}
                      disabled={notificationTesting}
                      className="w-full md:w-auto px-5 py-2.5 rounded-full text-xs font-mono font-medium tracking-wider text-mosphere-gold border border-mosphere-gold/40 bg-mosphere-gold/10 hover:bg-mosphere-gold/20 transition-all uppercase flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-mosphere-gold" />
                      <span>{notificationTesting ? 'Testing Alert...' : 'Test Lock Screen Alert'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Recent / Today Appointments */}
              <div className="bg-gradient-to-b from-[#13131D]/80 to-[#0A0A0F]/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-serif text-base sm:text-lg font-medium text-white tracking-wide">Recent Appointments</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-white/50 border border-white/10">
                      Live Queue
                    </span>
                  </div>
                  <button
                    onClick={() => setTab('bookings')}
                    className="text-xs text-mosphere-gold hover:text-mosphere-goldLight transition-colors font-medium flex items-center gap-1 group"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Mobile Cards View (< md) */}
                <div className="block md:hidden space-y-3">
                  {bookings.slice(0, 5).length === 0 ? (
                    <div className="text-center py-8 text-xs text-white/40">No recent appointments found.</div>
                  ) : (
                    bookings.slice(0, 5).map((b) => {
                      const badge = getStatusBadge(b.status);
                      return (
                        <div key={b.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 hover:border-mosphere-gold/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mosphere-gold/25 to-black/60 border border-mosphere-gold/30 text-mosphere-gold font-serif text-xs font-bold flex items-center justify-center shrink-0">
                                {getInitials(b.customerName)}
                              </div>
                              <div>
                                <span className="font-mono text-xs text-mosphere-gold font-semibold block">{b.bookingRef}</span>
                                <span className="text-xs text-white/40">{b.date} • {b.startTime}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border flex items-center gap-1.5 ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          <div className="pt-2 border-t border-white/5">
                            <div className="text-sm font-medium text-white">{b.customerName}</div>
                            <div className="text-xs text-mosphere-gold font-light mt-0.5">{b.serviceName}</div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                            <div className="flex items-center gap-2">
                              {b.status !== 'completed' && b.status !== 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => openReschedule(b)}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white active:scale-95 text-[11px]"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(b.id, 'completed')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 active:scale-95 text-[11px] font-medium"
                                  >
                                    ✓ Done
                                  </button>
                                </>
                              )}
                            </div>
                            {b.phone && (
                              <a
                                href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 active:scale-95"
                                title="WhatsApp Guest"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-white/40 uppercase tracking-wider font-mono text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Ref</th>
                        <th className="py-3 px-4">Guest</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.slice(0, 5).map((b) => {
                        const badge = getStatusBadge(b.status);
                        return (
                          <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-3.5 px-4 font-mono text-mosphere-gold font-medium">{b.bookingRef}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mosphere-gold/25 to-black border border-mosphere-gold/30 text-mosphere-gold font-serif text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {getInitials(b.customerName)}
                                </div>
                                <span className="font-medium text-white">{b.customerName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-white/80 font-light">{b.serviceName}</td>
                            <td className="py-3.5 px-4 text-white/70 font-mono text-[11px]">{b.date} • {b.startTime}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border inline-flex items-center gap-1.5 ${badge.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                <span>{badge.label}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                {b.status !== 'completed' && b.status !== 'cancelled' && (
                                  <>
                                    <button
                                      onClick={() => openReschedule(b)}
                                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                      title="Reschedule"
                                    >
                                      Reschedule
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(b.id, 'completed')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors font-medium"
                                      title="Complete"
                                    >
                                      ✓ Done
                                    </button>
                                  </>
                                )}
                                {b.phone && (
                                  <a
                                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/15 rounded-lg border border-emerald-500/20 transition-colors"
                                    title="WhatsApp Guest"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 2: BOOKINGS LIST & FILTERS
               ========================================== */}
          {tab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Guest Reservations</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                      {bookings.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-white/50">Filter, search, reschedule, or manage customer reservations and arrivals.</p>
                </div>
                <button
                  onClick={() => {
                    if (services.length > 0) setWalkinService(services[0].id);
                    setWalkinModal(true);
                  }}
                  className="self-start sm:self-auto px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Walk-In</span>
                </button>
              </div>

              {/* Quick Date Shortcuts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 mr-1 shrink-0">Quick Filter:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterDate('');
                    setTimeout(() => fetchBookings(), 100);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all shrink-0 ${
                    !filterDate
                      ? 'bg-mosphere-gold text-black font-bold shadow-md'
                      : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  All Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFilterDate(today);
                    setTimeout(() => fetchBookings(), 100);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all shrink-0 ${
                    filterDate === new Date().toISOString().split('T')[0]
                      ? 'bg-mosphere-gold text-black font-bold shadow-md'
                      : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  Today ({stats?.todayCount || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                    setFilterDate(tomorrow);
                    setTimeout(() => fetchBookings(), 100);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all shrink-0 ${
                    filterDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                      ? 'bg-mosphere-gold text-black font-bold shadow-md'
                      : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-[#13131D]/80 to-[#0A0A0F]/90 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 sm:gap-4 items-end">
                <div className="w-full sm:w-auto">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1.5">Reservation Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setTimeout(() => fetchBookings(), 100);
                    }}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all font-mono"
                  />
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1.5">Status Filter</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setTimeout(() => fetchBookings(), 100);
                    }}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="no-show">No-Show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="w-full lg:flex-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1.5">Search Reservation</label>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => {
                      setFilterSearch(e.target.value);
                      setTimeout(() => fetchBookings(), 300);
                    }}
                    placeholder="Search by guest name, phone, ref, service..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                  />
                </div>

                <div className="w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setFilterDate('');
                      setFilterStatus('all');
                      setFilterSearch('');
                      setTimeout(() => fetchBookings(), 100);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/70 hover:text-white text-center active:scale-95 transition-all font-mono"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Mobile Appointment Cards (< md) */}
              <div className="block md:hidden space-y-3">
                {bookings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-white/40 bg-[#121218]/80 rounded-2xl border border-white/10">
                    No appointments found matching your criteria.
                  </div>
                ) : (
                  bookings.map((b) => {
                    const badge = getStatusBadge(b.status);
                    return (
                      <div key={b.id} className="p-4 rounded-2xl bg-gradient-to-b from-[#13131D]/90 to-[#0A0A0F]/90 border border-white/10 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-mosphere-gold/25 to-black border border-mosphere-gold/30 text-mosphere-gold font-serif text-xs font-bold flex items-center justify-center shrink-0">
                              {getInitials(b.customerName)}
                            </div>
                            <div>
                              <span className="font-mono text-xs text-mosphere-gold font-bold block">{b.bookingRef}</span>
                              <span className="text-xs text-white/50">{b.date} • {b.startTime}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border flex items-center gap-1.5 ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <div className="text-base font-serif font-medium text-white">{b.customerName}</div>
                          <div className="text-xs text-mosphere-gold font-light mt-0.5">{b.serviceName}</div>
                          {b.notes && (
                            <div className="text-[11px] text-white/50 bg-black/40 rounded-lg p-2.5 mt-2 italic border border-white/5 font-light">
                              &ldquo;{b.notes}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Guest Quick Contact Row */}
                        <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
                          {b.phone && (
                            <>
                              <a
                                href={`tel:${b.phone.replace(/[^0-9]/g, '')}`}
                                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/80 text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                <Phone className="w-3.5 h-3.5 text-mosphere-gold" />
                                <span className="font-mono text-[11px]">{b.phone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition-all"
                                title="WhatsApp Guest"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {b.status !== 'completed' && b.status !== 'cancelled' && (
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
                            <button
                              onClick={() => openReschedule(b)}
                              className="py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center gap-1 active:scale-95 transition-all text-[11px]"
                            >
                              <Clock3 className="w-3.5 h-3.5" />
                              <span>Reschedule</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'completed')}
                              className="py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1 active:scale-95 transition-all text-[11px] font-medium"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </button>
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-1 active:scale-95 transition-all text-[11px]"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Bookings Table (>= md) */}
              <div className="hidden md:block bg-gradient-to-b from-[#13131D]/80 to-[#0A0A0F]/90 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-white/40 uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Ref</th>
                      <th className="py-3.5 px-4">Guest</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Notes</th>
                      <th className="py-3.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((b) => {
                      const badge = getStatusBadge(b.status);
                      return (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-3.5 px-4 font-mono text-mosphere-gold font-medium">{b.bookingRef}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mosphere-gold/25 to-black border border-mosphere-gold/30 text-mosphere-gold font-serif text-xs font-bold flex items-center justify-center shrink-0">
                                {getInitials(b.customerName)}
                              </div>
                              <span className="font-medium text-white">{b.customerName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-white/70 font-mono text-[11px]">{b.phone}</td>
                          <td className="py-3.5 px-4 text-white/80 font-light">{b.serviceName}</td>
                          <td className="py-3.5 px-4 text-white/80 font-mono text-[11px]">{b.date} • {b.startTime}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border inline-flex items-center gap-1.5 ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-white/40 max-w-xs truncate italic">{b.notes || '—'}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {b.status !== 'completed' && b.status !== 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => openReschedule(b)}
                                    className="p-1.5 text-amber-300 hover:bg-amber-400/10 rounded-lg border border-amber-400/20 transition-colors"
                                    title="Reschedule Appointment"
                                  >
                                    <Clock3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(b.id, 'completed')}
                                    className="p-1.5 text-emerald-300 hover:bg-emerald-400/10 rounded-lg border border-emerald-400/20 transition-colors"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleCancel(b.id)}
                                    className="p-1.5 text-rose-300 hover:bg-rose-400/10 rounded-lg border border-rose-400/20 transition-colors"
                                    title="Cancel Appointment"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {b.phone && (
                                <a
                                  href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-400/15 rounded-lg border border-emerald-500/20 transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 3: SERVICES MANAGEMENT
               ========================================== */}
          {tab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Services & Menu</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                      {services.length} Active Services
                    </span>
                  </div>
                  <p className="text-xs text-white/50">Configure luxury treatments, durations in minutes, prices, and catalog categories.</p>
                </div>
                <button
                  onClick={() => {
                    setServiceModal({ id: '' });
                    setSrvName('');
                    setSrvDuration(60);
                    setSrvPrice(4500);
                    setSrvCategory('Hair');
                    setSrvDesc('');
                    setSrvImage('');
                    setSrvImageFile(null);
                    setSrvImagePreview('');
                    setSrvUploadMode('device');
                  }}
                  className="self-start sm:self-auto px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {services.map((s) => {
                  const serviceImg = s.image || getServiceImage(s);
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl bg-gradient-to-b from-[#13131D]/85 to-[#0A0A0F]/90 border border-white/10 hover:border-mosphere-gold/40 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                      {/* Service Photo Banner with Quick Photo Edit (1:1 Ratio) */}
                      <div className="relative aspect-square w-full overflow-hidden bg-black/60 border-b border-white/5">
                        <img
                          src={serviceImg}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#13131D] via-black/30 to-transparent" />

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-mosphere-gold bg-black/75 backdrop-blur-md border border-mosphere-gold/40 font-semibold shadow-md">
                            {s.category}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setServiceModal(s);
                              setSrvName(s.name);
                              setSrvDuration(s.duration);
                              setSrvPrice(s.price);
                              setSrvCategory(s.category);
                              setSrvDesc(s.description || '');
                              setSrvImage(s.image || '');
                              setSrvImageFile(null);
                              setSrvImagePreview(s.image || '');
                              setSrvUploadMode(s.image && !s.image.startsWith('data:') ? 'url' : 'device');
                            }}
                            className="px-2.5 py-1 rounded-full text-[10px] font-mono text-white/90 bg-black/80 hover:bg-mosphere-gold hover:text-black backdrop-blur-md border border-white/20 hover:border-mosphere-gold flex items-center gap-1 transition-all shadow-md cursor-pointer"
                            title="Change Service Photo"
                          >
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>Change Photo</span>
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 right-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-mosphere-gold" />
                            <span>{s.duration} mins</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-serif text-lg font-medium text-white mb-2 tracking-wide group-hover:text-mosphere-goldLight transition-colors">
                            {s.name}
                          </h3>
                          <p className="text-xs text-white/60 font-light leading-relaxed mb-5 line-clamp-3">
                            {s.description || 'Exclusive luxury salon service tailored to your styling preferences.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-white/40 block">Price</span>
                            <span className="font-serif text-lg font-bold text-mosphere-goldLight">LKR {s.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setServiceModal(s);
                                setSrvName(s.name);
                                setSrvDuration(s.duration);
                                setSrvPrice(s.price);
                                setSrvCategory(s.category);
                                setSrvDesc(s.description || '');
                                setSrvImage(s.image || '');
                                setSrvImageFile(null);
                                setSrvImagePreview(s.image || '');
                                setSrvUploadMode(s.image && !s.image.startsWith('data:') ? 'url' : 'device');
                              }}
                              className="p-2 text-white/70 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 active:scale-90 transition-all flex items-center gap-1.5 text-xs"
                              title="Edit Service & Photo"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-mosphere-gold" />
                              <span className="font-mono text-[10px]">Edit</span>
                            </button>
                            <button
                              onClick={() => deleteService(s.id)}
                              className="p-2 text-rose-400 hover:text-rose-300 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-90 transition-all"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 4: BUSINESS HOURS
               ========================================== */}
          {tab === 'hours' && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-2 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Operating Hours</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                    Colombo Studio
                  </span>
                </div>
                <p className="text-xs text-white/50">Configure weekly opening and closing schedules for customer booking slots.</p>
              </div>

              <div className="bg-gradient-to-b from-[#13131D]/85 to-[#0A0A0F]/90 rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-3">
                {businessHours.map((h, idx) => (
                  <div
                    key={h.day}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-black/40 rounded-xl border border-white/5 gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                      <span className="font-serif uppercase text-sm w-28 sm:w-32 text-white font-medium tracking-wider">
                        {h.dayName}
                      </span>
                      
                      <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(h.isClosed)}
                          onChange={(e) => {
                            const updated = [...businessHours];
                            updated[idx].isClosed = e.target.checked ? 1 : 0;
                            setBusinessHours(updated);
                          }}
                          className="w-4 h-4 rounded border-white/20 bg-black text-mosphere-gold focus:ring-0 accent-mosphere-gold"
                        />
                        <span className={h.isClosed ? 'text-rose-400 font-semibold' : 'text-white/60'}>
                          {h.isClosed ? 'Closed All Day' : 'Open'}
                        </span>
                      </label>
                    </div>

                    {!h.isClosed && (
                      <div className="flex items-center gap-2 text-xs w-full sm:w-auto font-mono">
                        <input
                          type="time"
                          value={h.openingTime}
                          onChange={(e) => {
                            const updated = [...businessHours];
                            updated[idx].openingTime = e.target.value;
                            setBusinessHours(updated);
                          }}
                          className="flex-1 sm:flex-initial bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-mosphere-gold/70"
                        />
                        <span className="text-white/40 font-mono text-[11px]">to</span>
                        <input
                          type="time"
                          value={h.closingTime}
                          onChange={(e) => {
                            const updated = [...businessHours];
                            updated[idx].closingTime = e.target.value;
                            setBusinessHours(updated);
                          }}
                          className="flex-1 sm:flex-initial bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-mosphere-gold/70"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={saveBusinessHours}
                    className="w-full sm:w-auto px-7 py-3 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Operating Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 5: BLOCKED DATES & VACATIONS
               ========================================== */}
          {tab === 'blocked' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Blocked Dates & Holidays</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                      {blockedDates.length} Blocked
                    </span>
                  </div>
                  <p className="text-xs text-white/50">Reserve salon closed days, Poya holidays, or specific staff break intervals.</p>
                </div>
                <button
                  onClick={() => setBlockedModal(true)}
                  className="self-start sm:self-auto px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Block Time / Date</span>
                </button>
              </div>

              <div className="bg-gradient-to-b from-[#13131D]/85 to-[#0A0A0F]/90 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl divide-y divide-white/5 overflow-hidden">
                {blockedDates.length === 0 ? (
                  <div className="p-10 text-center text-xs text-white/40">No dates currently blocked. Salon accepts all open calendar bookings.</div>
                ) : (
                  blockedDates.map((b) => (
                    <div key={b.id} className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-xs hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3.5 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                          <Ban className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm font-serif">{b.date}</div>
                          <div className="text-white/60 text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-mosphere-gold">
                              {b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : 'Full Day Closed'}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/50">{b.reason || 'No reason specified'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBlockedDate(b.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 shrink-0 active:scale-90 transition-all"
                        title="Remove Block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 6: GALLERY MANAGER
               ========================================== */}
          {tab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Portfolio Gallery</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                      {gallery.length} Images
                    </span>
                  </div>
                  <p className="text-xs text-white/50">Manage hair styling, beauty transformation, and salon photography showcase.</p>
                </div>
                <button
                  onClick={() => setGalleryModal(true)}
                  className="self-start sm:self-auto px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Image</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {gallery.map((g) => (
                  <div key={g.id} className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-mosphere-gold/50 transition-all aspect-square group bg-black/40 shadow-xl">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    
                    {/* Permanent Mobile Action Overlay */}
                    <div className="sm:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-2.5 flex items-end justify-between">
                      <div className="min-w-0 flex-1 pr-1.5">
                        <div className="text-[11px] font-medium text-white truncate font-serif">{g.title}</div>
                        <div className="text-[9px] text-mosphere-gold font-mono uppercase">{g.category}</div>
                      </div>
                      <button
                        onClick={() => deleteGallery(g.id)}
                        aria-label="Delete Image"
                        className="p-1.5 bg-rose-600/90 text-white rounded-lg shrink-0 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Desktop Hover Overlay */}
                    <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex-col justify-between">
                      <div className="self-end">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${g.location === 'negombo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-mosphere-gold/20 text-mosphere-gold border border-mosphere-gold/40'}`}>
                          {g.location === 'negombo' ? 'Negombo' : g.location === 'all' ? 'All Salons' : 'Colombo'}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <div className="text-xs font-serif font-medium text-white">{g.title}</div>
                          <div className="text-[10px] text-mosphere-gold font-mono uppercase mt-0.5">{g.category}</div>
                        </div>
                        <button
                          onClick={() => deleteGallery(g.id)}
                          className="p-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl active:scale-90 transition-all shadow-md"
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 7: GOOGLE CALENDAR DIAGNOSTIC
               ========================================== */}
          {tab === 'calendar' && (
            <div className="space-y-6 max-w-4xl">
              <div className="pb-2 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Google Calendar Integration</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                    gcalStatus?.status === 'connected'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  }`}>
                    {gcalStatus?.status === 'connected' ? '● Synchronized' : '● Standalone'}
                  </span>
                </div>
                <p className="text-xs text-white/50">Verify server-side real-time calendar appointments synchronization and API connectivity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-b from-[#13131D]/85 to-[#0A0A0F]/90 rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-xl">
                  <h3 className="font-serif text-base sm:text-lg font-medium text-white tracking-wide flex items-center gap-2">
                    <Globe className="w-4 h-4 text-mosphere-gold" />
                    <span>Connection Status</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-white/40 font-mono">Status</span>
                      <span className={`font-semibold uppercase font-mono text-[11px] ${gcalStatus?.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gcalStatus?.status || 'Checking...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-2 pb-2 border-b border-white/5">
                      <span className="text-white/40 shrink-0 font-mono">Calendar ID</span>
                      <span className="text-white font-mono break-all text-right text-[11px]">{gcalStatus?.calendarId || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-mono">Timezone</span>
                      <span className="text-mosphere-gold font-mono text-[11px]">Asia/Colombo (UTC+5:30)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => loadAllData()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Live Connection</span>
                  </button>
                </div>

                <div className="bg-gradient-to-b from-[#13131D]/85 to-[#0A0A0F]/90 rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3 text-xs text-white/70 shadow-xl backdrop-blur-xl">
                  <h3 className="font-serif text-base sm:text-lg font-medium text-white tracking-wide">Setup Instructions</h3>
                  <ol className="list-decimal pl-4 space-y-2 leading-relaxed font-light">
                    <li>Create a Google Cloud Service Account with domain-wide delegation.</li>
                    <li>Enable the Google Calendar API in Google Cloud Console.</li>
                    <li>Share your salon&apos;s Google Calendar with the Service Account email (Permission: &ldquo;Make changes to events&rdquo;).</li>
                    <li>Set <code className="text-mosphere-gold font-mono bg-black/50 px-1.5 py-0.5 rounded border border-white/10">GOOGLE_CALENDAR_ID</code> and <code className="text-mosphere-gold font-mono bg-black/50 px-1.5 py-0.5 rounded border border-white/10">GOOGLE_PRIVATE_KEY</code> in secrets.</li>
                  </ol>
                  <div className="pt-3 border-t border-white/5">
                    <a
                      href="/GOOGLE_CALENDAR_SETUP.md"
                      target="_blank"
                      className="text-mosphere-gold hover:text-mosphere-goldLight transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Read Full Setup Guide (.md)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Quick Bottom Dock for Phone Screens */}
      <nav
        aria-label="Admin Quick Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0E]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
      >
        <button
          onClick={() => setTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
            tab === 'dashboard' ? 'text-mosphere-gold font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setTab('bookings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
            tab === 'bookings' ? 'text-mosphere-gold font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Bookings</span>
        </button>

        {/* Quick Walk-In Button */}
        <button
          onClick={() => {
            if (services.length > 0) setWalkinService(services[0].id);
            setWalkinModal(true);
          }}
          className="flex flex-col items-center -mt-5 bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark text-black p-3 rounded-full shadow-goldGlow active:scale-90 transition-transform"
          title="New Walk-In"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>

        <button
          onClick={() => setTab('services')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
            tab === 'services' ? 'text-mosphere-gold font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Services</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium text-white/50 hover:text-white transition-all"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>

      {/* ==========================================
           MODAL 1: RESCHEDULE APPOINTMENT
           ========================================== */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-[#14141E] via-[#0E0E14] to-[#0A0A0E] border border-mosphere-gold/40 rounded-3xl p-6 sm:p-7 my-auto max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.12)] relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/60 to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-mosphere-gold" />
                <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide">Reschedule Reservation</h3>
              </div>
              <button
                onClick={() => setRescheduleModal(null)}
                aria-label="Close"
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/50 mb-5 font-light">
              Guest: <strong className="text-white font-medium">{rescheduleModal.customerName}</strong> ({rescheduleModal.serviceName})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    fetchRescheduleSlots(e.target.value, rescheduleModal.serviceId);
                  }}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Available Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                >
                  <option value="">Select an available slot</option>
                  {rescheduleSlotsList.map((s) => (
                    <option key={s.time} value={s.time}>
                      {s.formattedTime} - {s.formattedEndTime}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRescheduleModal(null)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/70 hover:text-white active:scale-95 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReschedule}
                  disabled={!rescheduleSlot}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase disabled:opacity-50 active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm & Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL 2: MANUAL WALK-IN BOOKING
           ========================================== */}
      {walkinModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-[#14141E] via-[#0E0E14] to-[#0A0A0E] border border-mosphere-gold/40 rounded-3xl p-6 sm:p-7 my-auto max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.12)] relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/60 to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-mosphere-gold" />
                <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide">New Walk-In Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setWalkinModal(false)}
                aria-label="Close"
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/50 mb-5 font-light">Direct desk booking for in-person walk-ins or phone guests.</p>

            <form onSubmit={submitWalkin} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Select Treatment</label>
                <select
                  value={walkinService}
                  onChange={(e) => setWalkinService(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all font-medium"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration}m - LKR {s.price.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={walkinDate}
                    onChange={(e) => setWalkinDate(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Time Slot</label>
                  <select
                    value={walkinSlot}
                    onChange={(e) => setWalkinSlot(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  >
                    <option value="">Select Time</option>
                    {walkinSlotsList.map((s) => (
                      <option key={s.time} value={s.time}>{s.formattedTime}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Guest Name</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Kasun Perera"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="077 729 1629"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setWalkinModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/70 hover:text-white active:scale-95 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!walkinSlot}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase disabled:opacity-50 active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL 3: ADD / EDIT SERVICE
           ========================================== */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-[#14141E] via-[#0E0E14] to-[#0A0A0E] border border-mosphere-gold/40 rounded-3xl p-6 sm:p-7 my-auto max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.12)] relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/60 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-mosphere-gold" />
                <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide">
                  {serviceModal.id ? 'Edit Service' : 'Add New Service'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setServiceModal(null)}
                aria-label="Close"
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitService} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Service Name</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="e.g. Signature Balayage Treatment"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Duration (Mins)</label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Price (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Category</label>
                <input
                  type="text"
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value)}
                  placeholder="Hair, Beauty, Treatment, Spa..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Describe treatment procedures, benefits, and products used..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white resize-none focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all font-light"
                />
              </div>

              {/* Service Photo Section */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-mosphere-gold font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Service Photo</span>
                  </label>
                  <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg border border-white/10 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setSrvUploadMode('device')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        srvUploadMode === 'device' ? 'bg-mosphere-gold text-black font-bold' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setSrvUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        srvUploadMode === 'url' ? 'bg-mosphere-gold text-black font-bold' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Preview Thumbnail if present (1:1 Ratio) */}
                {(srvImagePreview || srvImage) && (
                  <div className="relative aspect-square max-w-[220px] mx-auto rounded-2xl overflow-hidden border-2 border-mosphere-gold/40 bg-black flex items-center justify-center group shadow-xl">
                    <img
                      src={srvImagePreview || srvImage}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-black/80 text-mosphere-gold border border-mosphere-gold/30">
                        1:1 Square
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="admin-service-file-input"
                        className="cursor-pointer px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold font-mono uppercase hover:brightness-110 transition-all"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSrvImage('');
                          setSrvImageFile(null);
                          setSrvImagePreview('');
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold font-mono uppercase hover:bg-rose-600 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Device Upload Input */}
                {srvUploadMode === 'device' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="admin-service-file-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSrvImageFile(file);
                          compressImage(file, 800, 0.8, true)
                            .then((sq) => setSrvImagePreview(sq))
                            .catch(() => setSrvImagePreview(URL.createObjectURL(file)));
                        }
                      }}
                    />
                    {!srvImagePreview && !srvImage && (
                      <label
                        htmlFor="admin-service-file-input"
                        className="cursor-pointer border-2 border-dashed border-mosphere-gold/40 hover:border-mosphere-gold bg-black/40 hover:bg-mosphere-gold/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-mosphere-gold/15 border border-mosphere-gold/30 flex items-center justify-center text-mosphere-gold group-hover:scale-110 transition-transform">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-white tracking-wide">Upload Photo from Device</span>
                        <span className="text-[10px] text-mosphere-gold/80 font-mono">Auto-cropped to 1:1 Square • Max 150KB</span>
                      </label>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={srvImage}
                      onChange={(e) => {
                        setSrvImage(e.target.value);
                        setSrvImagePreview(e.target.value);
                        setSrvImageFile(null);
                      }}
                      placeholder="https://... or /images/colombo/..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/70 hover:text-white active:scale-95 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={srvUploading}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {srvUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing & Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Save Service</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL 4: ADD BLOCKED DATE
           ========================================== */}
      {blockedModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-[#14141E] via-[#0E0E14] to-[#0A0A0E] border border-mosphere-gold/40 rounded-3xl p-6 sm:p-7 my-auto max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.12)] relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/60 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-400" />
                <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide">Block Date / Time</h3>
              </div>
              <button
                type="button"
                onClick={() => setBlockedModal(false)}
                aria-label="Close"
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitBlockedDate} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Date to Block</label>
                <input
                  type="date"
                  required
                  value={blkDate}
                  onChange={(e) => setBlkDate(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Start Time (Optional)</label>
                  <input
                    type="time"
                    value={blkStart}
                    onChange={(e) => setBlkStart(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">End Time (Optional)</label>
                  <input
                    type="time"
                    value={blkEnd}
                    onChange={(e) => setBlkEnd(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Reason or Note</label>
                <input
                  type="text"
                  value={blkReason}
                  onChange={(e) => setBlkReason(e.target.value)}
                  placeholder="e.g. Poya Holiday, Salon Renovation, Private Booking..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBlockedModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/70 hover:text-white active:scale-95 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Block Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL 5: ADD GALLERY IMAGE
           ========================================== */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-[#14141E] via-[#0E0E14] to-[#0A0A0E] border border-mosphere-gold/40 rounded-3xl p-6 sm:p-7 my-auto max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.12)] relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-mosphere-gold/60 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-mosphere-gold" />
                <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide">Add Portfolio Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setGalleryModal(false)}
                aria-label="Close"
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitGallery} className="space-y-4">
              {/* Mode Selector */}
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setGalUploadMode('device')}
                  className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    galUploadMode === 'device'
                      ? 'bg-mosphere-gold text-black font-bold shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Device Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGalUploadMode('url')}
                  className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    galUploadMode === 'url'
                      ? 'bg-mosphere-gold text-black font-bold shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>

              {/* Mode 1: Device File Upload */}
              {galUploadMode === 'device' ? (
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-mosphere-gold mb-1.5 font-medium">
                    Select Image File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-gallery-file-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setGalFile(file);
                        setGalPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {!galPreview ? (
                    <label
                      htmlFor="admin-gallery-file-input"
                      className="cursor-pointer border-2 border-dashed border-mosphere-gold/40 hover:border-mosphere-gold bg-black/40 hover:bg-mosphere-gold/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-mosphere-gold/15 border border-mosphere-gold/30 flex items-center justify-center text-mosphere-gold group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-white tracking-wide">Choose from this Device</span>
                      <span className="text-[10px] text-white/40 font-mono">JPG, PNG, WEBP, HEIC</span>
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-mosphere-gold/40 bg-black aspect-video flex items-center justify-center group shadow-xl">
                      <img src={galPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label
                          htmlFor="admin-gallery-file-input"
                          className="cursor-pointer px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold font-mono uppercase"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setGalFile(null);
                            setGalPreview('');
                          }}
                          className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold font-mono uppercase"
                        >
                          Remove
                        </button>
                      </div>
                      {galFile && (
                        <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono text-white/80 border border-white/10">
                          {galFile.name} ({(galFile.size / 1024).toFixed(0)} KB)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Direct URL */
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Direct Image URL</label>
                  <input
                    type="url"
                    value={galUrl}
                    onChange={(e) => {
                      setGalUrl(e.target.value);
                      setGalPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all font-mono"
                  />
                  {galUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black shadow-lg">
                      <img src={galUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Photo Title</label>
                <input
                  type="text"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  placeholder="e.g. Precision Golden Balayage"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={galCat}
                    onChange={(e) => setGalCat(e.target.value)}
                    placeholder="Hair, Color, Styling..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">Aspect Ratio</label>
                  <select
                    value={galRatio}
                    onChange={(e) => setGalRatio(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 font-mono transition-all"
                  >
                    <option value="portrait">Portrait (Tall)</option>
                    <option value="landscape">Landscape (Wide)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-mosphere-gold mb-1.5 font-semibold">
                  Display Salon Location *
                </label>
                <select
                  value={galLocation}
                  onChange={(e) => setGalLocation(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-mosphere-gold/70 focus:ring-1 focus:ring-mosphere-gold/40 focus:outline-none transition-all"
                >
                  <option value="colombo">Colombo Studio (Nawala) Only</option>
                  <option value="negombo">Negombo Coastal Sanctuary Only</option>
                  <option value="all">Both Salons (All Locations)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setGalleryModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/70 hover:text-white active:scale-95 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish Image</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
