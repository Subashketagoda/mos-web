'use client';

import React, { useState, useEffect } from 'react';
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
  Upload
} from 'lucide-react';
import { salonConfig } from '@/lib/config';
import { subscribeToBookings, subscribeToGallery, uploadImageFile } from '@/lib/firebaseService';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'bookings' | 'services' | 'hours' | 'blocked' | 'gallery' | 'calendar'>('dashboard');

  // Auth Form State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminPassword123');
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

    // 2. Continuous 3-second live sync interval for all mobile & remote bookings
    const interval = setInterval(() => {
      loadAllData(token);
    }, 3000);

    // 3. Cloud Firestore Real-time push listeners
    const unsubBookings = subscribeToBookings((liveBookings) => {
      if (liveBookings && liveBookings.length > 0) {
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
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('mosphere_admin_token', data.token);
        loadAllData(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Server connection error');
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
    fetch('/api/services?all=true', { headers: h }).then(r => r.json()).then(d => d.success && setServices(d.services));
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

    const res = await fetch(`/api/admin/bookings?${p.toString()}`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const data = await res.json();
    if (data.success) setBookings(data.bookings);
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
      }),
    });

    if (res.ok) {
      setServiceModal(null);
      loadAllData();
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
    await fetch(`/api/admin/gallery?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAllData();
  }

  // =========================================================
  // RENDER: LOGIN FORM IF NOT AUTHENTICATED
  // =========================================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0F0F14] border border-mosphere-gold/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full border border-mosphere-gold/50 flex items-center justify-center mx-auto mb-4 bg-black/60 p-2 overflow-hidden shadow-goldGlow">
            <img
              src="/images/mosphere-emblem-gold.png"
              alt="Mosphere"
              className="w-full h-full object-contain filter brightness-110"
            />
          </div>
          <h2 className="font-serif text-2xl font-medium text-white mb-1">MOSPHERE CONCIERGE</h2>
          <p className="text-xs text-white/50 mb-6">Staff & Calendar Management Portal</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mosphere-gold"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mosphere-gold"
              />
            </div>

            {loginError && <div className="text-xs text-red-400">{loginError}</div>}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase mt-2"
            >
              {loginLoading ? 'Authenticating...' : 'Access Portal'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link href="/" className="text-xs text-white/40 hover:text-mosphere-gold">
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: ADMIN DASHBOARD
  // =========================================================
  return (
    <div className="min-h-screen bg-[#070709] text-white flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D0D12] border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-mosphere-gold/50 flex items-center justify-center bg-black/60 p-1.5 overflow-hidden">
              <img
                src="/images/mosphere-emblem-gold.png"
                alt="Mosphere"
                className="w-full h-full object-contain filter brightness-110"
              />
            </div>
            <div>
              <div className="font-serif text-base font-semibold tracking-wider">MOSPHERE</div>
              <div className="text-[9px] text-mosphere-gold uppercase tracking-widest font-medium">GRAB LIFE • Concierge</div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'bookings', label: 'Bookings', icon: CalendarIcon },
              { id: 'services', label: 'Services', icon: Scissors },
              { id: 'hours', label: 'Opening Hours', icon: Clock },
              { id: 'blocked', label: 'Blocked Dates', icon: Ban },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'calendar', label: 'Google Calendar', icon: Globe },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'bg-mosphere-gold/15 text-mosphere-gold border border-mosphere-gold/30 font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-white/60 hover:text-mosphere-gold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Customer Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-[#0E0E14] border-b border-white/10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest text-mosphere-gold font-medium">
              Staff Portal • {salonConfig.address}
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Firebase Realtime Sync: Live</span>
            </span>
            {gcalStatus && (
              <span className={`text-[11px] px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                gcalStatus.status === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>Google Calendar: {gcalStatus.status === 'connected' ? 'Connected' : 'Simulation Mode'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (token) loadAllData(token);
              }}
              title="Refresh Bookings & Data"
              className="px-3.5 py-2 rounded-full text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-mosphere-gold" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                if (services.length > 0) setWalkinService(services[0].id);
                setWalkinModal(true);
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Walk-in Booking</span>
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-8 flex-1 overflow-y-auto">

          {/* ==========================================
               TAB 1: DASHBOARD OVERVIEW
               ========================================== */}
          {tab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-light text-white mb-1">Concierge Dashboard</h2>
                <p className="text-xs text-white/50">Today&apos;s scheduled arrivals and salon performance metrics.</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-xl bg-[#121218] border border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Today&apos;s Bookings</span>
                  <div className="text-3xl font-serif font-bold text-white">{stats?.todayCount || 0}</div>
                  <span className="text-xs text-mosphere-gold mt-1 block">Expected Arrivals</span>
                </div>
                <div className="p-6 rounded-xl bg-[#121218] border border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Today&apos;s Booked Revenue</span>
                  <div className="text-3xl font-serif font-bold text-mosphere-goldLight">LKR {(stats?.todayRevenue || 0).toLocaleString()}</div>
                  <span className="text-xs text-white/40 mt-1 block">Expected today</span>
                </div>
                <div className="p-6 rounded-xl bg-[#121218] border border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Upcoming (30 Days)</span>
                  <div className="text-3xl font-serif font-bold text-white">{stats?.upcomingCount || 0}</div>
                  <span className="text-xs text-white/40 mt-1 block">Confirmed bookings</span>
                </div>
                <div className="p-6 rounded-xl bg-[#121218] border border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Total Completed</span>
                  <div className="text-3xl font-serif font-bold text-emerald-400">{stats?.completedCount || 0}</div>
                  <span className="text-xs text-white/40 mt-1 block">LKR {(stats?.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Recent / Today Appointments Table */}
              <div className="bg-[#121218] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-medium text-white">Recent Appointments</h3>
                  <button onClick={() => setTab('bookings')} className="text-xs text-mosphere-gold hover:underline">
                    View All →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-white/40 uppercase tracking-wider">
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
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-4 font-mono text-mosphere-gold">{b.bookingRef}</td>
                          <td className="py-3.5 px-4 font-medium text-white">{b.customerName}</td>
                          <td className="py-3.5 px-4 text-white/80">{b.serviceName}</td>
                          <td className="py-3.5 px-4 text-white/70">{b.date} at {b.startTime}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                              b.status === 'rescheduled' ? 'bg-amber-500/10 text-amber-400' :
                              b.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => openReschedule(b)}
                              className="text-xs text-white/60 hover:text-white mr-3"
                              title="Reschedule"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'completed')}
                              className="text-xs text-emerald-400 hover:text-emerald-300"
                              title="Complete"
                            >
                              ✓ Done
                            </button>
                          </td>
                        </tr>
                      ))}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-light text-white mb-1">Appointment Management</h2>
                  <p className="text-xs text-white/50">Filter, search, reschedule, or cancel customer reservations.</p>
                </div>
                <button
                  onClick={() => {
                    if (services.length > 0) setWalkinService(services[0].id);
                    setWalkinModal(true);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase"
                >
                  + Add Walk-In
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="p-4 bg-[#121218] rounded-xl border border-white/10 flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setTimeout(() => fetchBookings(), 100);
                    }}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setTimeout(() => fetchBookings(), 100);
                    }}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="no-show">No-Show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Search</label>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => {
                      setFilterSearch(e.target.value);
                      setTimeout(() => fetchBookings(), 300);
                    }}
                    placeholder="Search by name, phone, ref, service..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30"
                  />
                </div>

                <div className="self-end">
                  <button
                    onClick={() => {
                      setFilterDate('');
                      setFilterStatus('all');
                      setFilterSearch('');
                      setTimeout(() => fetchBookings(), 100);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-[#121218] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/30 text-white/40 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ref</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono text-mosphere-gold">{b.bookingRef}</td>
                        <td className="py-3 px-4 font-medium text-white">{b.customerName}</td>
                        <td className="py-3 px-4 text-white/70">{b.phone}</td>
                        <td className="py-3 px-4 text-white/80">{b.serviceName}</td>
                        <td className="py-3 px-4 text-white/80">{b.date} at {b.startTime}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                            b.status === 'rescheduled' ? 'bg-amber-500/10 text-amber-400' :
                            b.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                            b.status === 'no-show' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/40 max-w-xs truncate">{b.notes || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {b.status !== 'completed' && b.status !== 'cancelled' && (
                              <>
                                <button
                                  onClick={() => openReschedule(b)}
                                  className="p-1 text-amber-400 hover:bg-amber-400/10 rounded"
                                  title="Reschedule"
                                >
                                  <Clock3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(b.id, 'completed')}
                                  className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded"
                                  title="Mark Completed"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleCancel(b.id)}
                                  className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                                  title="Cancel Appointment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-light text-white mb-1">Services & Menu</h2>
                  <p className="text-xs text-white/50">Configure services, duration in minutes, prices, and active catalog status.</p>
                </div>
                <button
                  onClick={() => {
                    setServiceModal({ id: '' });
                    setSrvName('');
                    setSrvDuration(60);
                    setSrvPrice(4500);
                    setSrvCategory('Hair');
                    setSrvDesc('');
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase"
                >
                  + Add Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <div key={s.id} className="p-6 rounded-xl bg-[#121218] border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-mosphere-gold font-medium">
                          {s.category}
                        </span>
                        <span className="text-xs text-white/50">{s.duration} mins</span>
                      </div>
                      <h3 className="font-serif text-lg font-medium text-white mb-2">{s.name}</h3>
                      <p className="text-xs text-white/60 font-light leading-relaxed mb-4">{s.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="font-serif font-bold text-mosphere-cream">LKR {s.price.toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setServiceModal(s);
                            setSrvName(s.name);
                            setSrvDuration(s.duration);
                            setSrvPrice(s.price);
                            setSrvCategory(s.category);
                            setSrvDesc(s.description || '');
                          }}
                          className="p-1.5 text-white/60 hover:text-white rounded bg-white/5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteService(s.id)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"
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
               TAB 4: BUSINESS HOURS
               ========================================== */}
          {tab === 'hours' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif text-3xl font-light text-white mb-1">Business Operating Hours</h2>
                <p className="text-xs text-white/50">Set weekly opening and closing hours for the Colombo salon.</p>
              </div>

              <div className="bg-[#121218] rounded-xl border border-white/10 p-6 space-y-4">
                {businessHours.map((h, idx) => (
                  <div key={h.day} className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                    <span className="font-serif uppercase text-sm w-32">{h.dayName}</span>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 text-white/70">
                        <input
                          type="checkbox"
                          checked={Boolean(h.isClosed)}
                          onChange={(e) => {
                            const updated = [...businessHours];
                            updated[idx].isClosed = e.target.checked ? 1 : 0;
                            setBusinessHours(updated);
                          }}
                        />
                        <span>Closed</span>
                      </label>

                      {!h.isClosed && (
                        <>
                          <input
                            type="time"
                            value={h.openingTime}
                            onChange={(e) => {
                              const updated = [...businessHours];
                              updated[idx].openingTime = e.target.value;
                              setBusinessHours(updated);
                            }}
                            className="bg-black border border-white/10 rounded px-2 py-1 text-white"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={h.closingTime}
                            onChange={(e) => {
                              const updated = [...businessHours];
                              updated[idx].closingTime = e.target.value;
                              setBusinessHours(updated);
                            }}
                            className="bg-black border border-white/10 rounded px-2 py-1 text-white"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={saveBusinessHours}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase mt-4"
                >
                  Save Business Hours
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
               TAB 5: BLOCKED DATES & VACATIONS
               ========================================== */}
          {tab === 'blocked' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-light text-white mb-1">Blocked Dates & Holidays</h2>
                  <p className="text-xs text-white/50">Block full days or specific time intervals (e.g. 2:00 PM - 5:00 PM).</p>
                </div>
                <button
                  onClick={() => setBlockedModal(true)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase"
                >
                  + Block Time / Date
                </button>
              </div>

              <div className="bg-[#121218] rounded-xl border border-white/10 divide-y divide-white/5">
                {blockedDates.length === 0 ? (
                  <div className="p-8 text-center text-xs text-white/40">No dates currently blocked.</div>
                ) : (
                  blockedDates.map((b) => (
                    <div key={b.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-white">{b.date}</div>
                        <div className="text-white/50">
                          {b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : 'Full Day Closed'} • {b.reason}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBlockedDate(b.id)}
                        className="p-1 text-red-400 hover:bg-red-400/10 rounded"
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-light text-white mb-1">Studio Portfolio Gallery</h2>
                  <p className="text-xs text-white/50">Add or remove images displayed in the website gallery.</p>
                </div>
                <button
                  onClick={() => setGalleryModal(true)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase"
                >
                  + Add Image
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((g) => (
                  <div key={g.id} className="relative rounded-xl overflow-hidden border border-white/10 aspect-square group">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-medium text-white">{g.title}</div>
                        <div className="text-[10px] text-mosphere-gold">{g.category}</div>
                      </div>
                      <button
                        onClick={() => deleteGallery(g.id)}
                        className="p-1.5 bg-red-600 rounded text-white self-end"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              <div>
                <h2 className="font-serif text-3xl font-light text-white mb-1">Google Calendar API Integration</h2>
                <p className="text-xs text-white/50">Verify real-time server-side synchronization and credentials.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121218] rounded-xl border border-white/10 p-6 space-y-4">
                  <h3 className="font-serif text-lg font-medium text-white">Connection Status</h3>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Status</span>
                      <span className={`font-semibold uppercase ${gcalStatus?.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gcalStatus?.status || 'Checking...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Calendar ID</span>
                      <span className="text-white font-mono">{gcalStatus?.calendarId || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Timezone</span>
                      <span className="text-white font-mono">Asia/Colombo</span>
                    </div>
                  </div>

                  <button
                    onClick={() => loadAllData()}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold to-mosphere-goldLight shadow-goldGlow uppercase"
                  >
                    Test Live Connection
                  </button>
                </div>

                <div className="bg-[#121218] rounded-xl border border-white/10 p-6 space-y-3 text-xs text-white/70">
                  <h3 className="font-serif text-lg font-medium text-white">Setup Instructions</h3>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Create a Google Cloud Service Account.</li>
                    <li>Enable the Google Calendar API.</li>
                    <li>Share your Google Calendar with the Service Account email (Permission: &ldquo;Make changes to events&rdquo;).</li>
                    <li>Set <code className="text-mosphere-gold">GOOGLE_CALENDAR_ID</code> and <code className="text-mosphere-gold">GOOGLE_PRIVATE_KEY</code> in <code className="text-mosphere-gold">.env</code>.</li>
                  </ol>
                  <div className="pt-2">
                    <a
                      href="/GOOGLE_CALENDAR_SETUP.md"
                      target="_blank"
                      className="text-mosphere-gold hover:underline"
                    >
                      Read Full Setup Guide (.md) →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
           MODAL: RESCHEDULE APPOINTMENT
           ========================================== */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F14] border border-mosphere-gold/40 rounded-2xl p-6">
            <h3 className="font-serif text-xl text-white mb-2">Reschedule Appointment</h3>
            <p className="text-xs text-white/50 mb-4">
              Guest: <strong className="text-white">{rescheduleModal.customerName}</strong> ({rescheduleModal.serviceName})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    fetchRescheduleSlots(e.target.value, rescheduleModal.serviceId);
                  }}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1">Available Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">Select a time slot</option>
                  {rescheduleSlotsList.map((s) => (
                    <option key={s.time} value={s.time}>
                      {s.formattedTime} - {s.formattedEndTime}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setRescheduleModal(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReschedule}
                  disabled={!rescheduleSlot}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-black bg-mosphere-gold shadow-goldGlow uppercase"
                >
                  Confirm & Sync Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: MANUAL WALK-IN BOOKING
           ========================================== */}
      {walkinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F14] border border-mosphere-gold/40 rounded-2xl p-6">
            <h3 className="font-serif text-xl text-white mb-2">New Walk-In Appointment</h3>
            <p className="text-xs text-white/50 mb-4">Book direct for walk-in or phone reservations.</p>

            <form onSubmit={submitWalkin} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Service</label>
                <select
                  value={walkinService}
                  onChange={(e) => setWalkinService(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration}m - LKR {s.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Date</label>
                  <input
                    type="date"
                    value={walkinDate}
                    onChange={(e) => setWalkinDate(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Time Slot</label>
                  <select
                    value={walkinSlot}
                    onChange={(e) => setWalkinSlot(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select Time</option>
                    {walkinSlotsList.map((s) => (
                      <option key={s.time} value={s.time}>{s.formattedTime}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="Guest Name"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="077 729 1629"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setWalkinModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!walkinSlot}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-black bg-mosphere-gold shadow-goldGlow uppercase"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: ADD / EDIT SERVICE
           ========================================== */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F14] border border-mosphere-gold/40 rounded-2xl p-6">
            <h3 className="font-serif text-xl text-white mb-4">
              {serviceModal.id ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={submitService} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="e.g. Signature Haircut"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Category</label>
                <input
                  type="text"
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value)}
                  placeholder="Hair, Beauty, Treatment..."
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold text-black bg-mosphere-gold shadow-goldGlow uppercase"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: ADD BLOCKED DATE
           ========================================== */}
      {blockedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F14] border border-mosphere-gold/40 rounded-2xl p-6">
            <h3 className="font-serif text-xl text-white mb-4">Block Date or Time Range</h3>

            <form onSubmit={submitBlockedDate} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={blkDate}
                  onChange={(e) => setBlkDate(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Start Time (Optional)</label>
                  <input
                    type="time"
                    value={blkStart}
                    onChange={(e) => setBlkStart(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">End Time (Optional)</label>
                  <input
                    type="time"
                    value={blkEnd}
                    onChange={(e) => setBlkEnd(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Reason</label>
                <input
                  type="text"
                  value={blkReason}
                  onChange={(e) => setBlkReason(e.target.value)}
                  placeholder="e.g. Poya Holiday, Private Event..."
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBlockedModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold text-black bg-mosphere-gold shadow-goldGlow uppercase"
                >
                  Add Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: ADD GALLERY IMAGE
           ========================================== */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F14] border border-mosphere-gold/40 rounded-2xl p-6">
            <h3 className="font-serif text-xl text-white mb-4">Add Gallery Image</h3>

            <form onSubmit={submitGallery} className="space-y-4">
              {/* Mode Selector */}
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setGalUploadMode('device')}
                  className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    galUploadMode === 'device'
                      ? 'bg-mosphere-gold text-black font-bold shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGalUploadMode('url')}
                  className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
                  <label className="block text-[10px] uppercase tracking-wider text-mosphere-gold mb-1.5">
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
                      className="cursor-pointer border-2 border-dashed border-mosphere-gold/40 hover:border-mosphere-gold bg-black/40 hover:bg-mosphere-gold/5 rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all group"
                    >
                      <Upload className="w-6 h-6 text-mosphere-gold group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-white">Click to choose image</span>
                      <span className="text-[10px] text-white/40 font-mono">JPG, PNG, WEBP, HEIC</span>
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-mosphere-gold/40 bg-black aspect-video flex items-center justify-center group">
                      <img src={galPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label
                          htmlFor="admin-gallery-file-input"
                          className="cursor-pointer px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-bold font-mono uppercase"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setGalFile(null);
                            setGalPreview('');
                          }}
                          className="px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold font-mono uppercase"
                        >
                          Remove
                        </button>
                      </div>
                      {galFile && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/80">
                          {galFile.name} ({(galFile.size / 1024).toFixed(0)} KB)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Direct URL */
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={galUrl}
                    onChange={(e) => {
                      setGalUrl(e.target.value);
                      setGalPreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  {galUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                      <img src={galUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Title</label>
                <input
                  type="text"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  placeholder="e.g. Precision Balayage"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Category</label>
                  <input
                    type="text"
                    value={galCat}
                    onChange={(e) => setGalCat(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1">Aspect Ratio</label>
                  <select
                    value={galRatio}
                    onChange={(e) => setGalRatio(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setGalleryModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold text-black bg-mosphere-gold shadow-goldGlow uppercase"
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
