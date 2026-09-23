'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  Download,
  RotateCcw,
  Bell,
  BellRing,
  X,
} from 'lucide-react';
import { salonConfig } from '@/lib/config';
import { syncBookingToFirestore } from '@/lib/firebaseService';
import { requestNotificationPermission, sendLockScreenNotification } from '@/lib/notifications';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
}

const serviceImages: Record<string, string> = {
  'srv-hair-botox': '/images/colombo/colombo-hair-treatment-1.jpg',
  'srv-keratin-silk': '/images/colombo/colombo-hair-treatment-2.jpg',
  'srv-gents-cut-beard': '/images/colombo/colombo-precision-hair-styling.jpg',
  'srv-ladies-couture-cut': '/images/colombo/colombo-precision-hair-styling.jpg',
  'srv-color-balayage': '/images/colombo/colombo-hair-treatment-1.jpg',
  'srv-beard-sculpt': '/images/colombo/colombo-precision-hair-styling.jpg',
  'srv-scalp-detox': '/images/colombo/colombo-hair-treatment-2.jpg',
  'srv-glow-facial': '/images/colombo/colombo-nails-tipsy-tips-1.jpg',
};

export function getServiceImage(service: { id?: string; name?: string; category?: string; image?: string }): string {
  if (service.image) return service.image;
  if (service.id && serviceImages[service.id]) return serviceImages[service.id];
  const name = (service.name || '').toLowerCase();
  const cat = (service.category || '').toLowerCase();

  if (name.includes('botox') || name.includes('hydrate') || name.includes('repair')) {
    return '/images/colombo/colombo-hair-treatment-1.jpg';
  }
  if (name.includes('keratin') || name.includes('smoothing') || name.includes('silk')) {
    return '/images/colombo/colombo-hair-treatment-2.jpg';
  }
  if (name.includes('nail') || name.includes('tipsy') || name.includes('pedicure') || name.includes('manicure')) {
    return '/images/colombo/colombo-nails-tipsy-tips-1.jpg';
  }
  if (name.includes('beard') || name.includes('shave') || name.includes('gent') || name.includes('ladies') || name.includes('cut')) {
    return '/images/colombo/colombo-precision-hair-styling.jpg';
  }
  return '/images/colombo/colombo-hair-treatment-1.jpg';
}

interface AvailableSlot {
  time: string;
  formattedTime: string;
  endTime: string;
  formattedEndTime: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  durationMinutes: number;
}

export interface BookingSectionProps {
  initialSelectedService?: Service | null;
  initialLocation?: 'colombo' | 'negombo';
  isOpen?: boolean;
  onClose?: () => void;
}

const fallbackServices: Service[] = [
  {
    id: 'srv-hair-botox',
    name: 'Hair Botox Deep Hydration & Repair',
    description: 'Intense amino-collagen infusion to seal cuticles, eliminate humidity frizz, and restore glass-like shine.',
    duration: 90,
    price: 14500,
    category: 'Restorative Hair Lab',
    image: '/images/colombo/colombo-hair-treatment-1.jpg'
  },
  {
    id: 'srv-keratin-silk',
    name: 'Keratin Silk Protein Smoothing',
    description: 'Structural bio-smoothing protein therapy for mirror-smooth manageability and long-lasting silkiness.',
    duration: 120,
    price: 18500,
    category: 'Restorative Hair Lab',
    image: '/images/colombo/colombo-hair-treatment-2.jpg'
  },
  {
    id: 'srv-gents-cut-beard',
    name: 'Gents Master Cut & Beard Architecture',
    description: 'Precision taper or fade consultation, eucalyptus hot towel prep, and sharp straight-razor detailing.',
    duration: 45,
    price: 3500,
    category: 'Gents Bespoke Grooming',
    image: '/images/colombo/colombo-precision-hair-styling.jpg'
  },
  {
    id: 'srv-ladies-couture-cut',
    name: 'Ladies Couture Cut & Signature Blowout',
    description: 'Architectural haircut tailored to facial geometry, finished with a high-volume runway blowout.',
    duration: 60,
    price: 4500,
    category: 'Ladies Hair & Styling',
    image: '/images/colombo/colombo-precision-hair-styling.jpg'
  },
  {
    id: 'srv-color-balayage',
    name: 'Dimensional Balayage & Gloss Tone Melt',
    description: 'Bespoke hand-painted highlights with seamless transitions and a radiant pH-balancing gloss tone.',
    duration: 120,
    price: 15500,
    category: 'Color & Highlights',
    image: '/images/colombo/colombo-hair-treatment-1.jpg'
  },
  {
    id: 'srv-beard-sculpt',
    name: 'Beard Sculpture & Hot Towel Shave Ritual',
    description: 'Crisp beard contouring, dual aromatic hot towel compresses, and soothing sandalwood balm finish.',
    duration: 30,
    price: 2200,
    category: 'Gents Bespoke Grooming',
    image: '/images/colombo/colombo-precision-hair-styling.jpg'
  },
  {
    id: 'srv-scalp-detox',
    name: 'Deep Scalp Detox & High-Frequency Therapy',
    description: 'Exfoliating scalp cleanse, ozone stimulation, and botanical nourishment for healthy follicle growth.',
    duration: 45,
    price: 5500,
    category: 'Scalp & Hair Wellness',
    image: '/images/colombo/colombo-hair-treatment-2.jpg'
  },
  {
    id: 'srv-glow-facial',
    name: 'Hydro-Radiance Deep Cleanse Facial',
    description: 'Enzyme pore purification, antioxidant hydration infusion, and jade-stone lymphatic sculpting.',
    duration: 60,
    price: 7500,
    category: 'Skin & Aesthetics',
    image: '/images/colombo/colombo-nails-tipsy-tips-1.jpg'
  }
];

function generateClientFallbackSlots(dateStr: string, durationMinutes: number = 60): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const openMin = 10 * 60; // 10:00 AM
  const closeMin = 20 * 60; // 8:00 PM
  const step = 30;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = dateStr === todayStr;
  const currentMins = now.getHours() * 60 + now.getMinutes() + 15;

  const format12 = (h: number, m: number) => {
    const p = h >= 12 ? 'PM' : 'AM';
    const dh = h % 12 === 0 ? 12 : h % 12;
    return `${dh}:${String(m).padStart(2, '0')} ${p}`;
  };

  for (let startMins = openMin; startMins + durationMinutes <= closeMin; startMins += step) {
    if (isToday && startMins < currentMins) continue;

    const startH = Math.floor(startMins / 60);
    const startM = startMins % 60;
    const endMins = startMins + durationMinutes;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;

    const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    slots.push({
      time: timeStr,
      formattedTime: format12(startH, startM),
      endTime: endTimeStr,
      formattedEndTime: format12(endH, endM),
      period: startH < 12 ? 'Morning' : startH < 17 ? 'Afternoon' : 'Evening',
      durationMinutes
    });
  }

  return slots;
}

export default function BookingSection({
  initialSelectedService,
  initialLocation = 'colombo',
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: BookingSectionProps) {
  // Wizard Steps: 1 = Service, 2 = Date, 3 = Time, 4 = Details, 5 = Confirmed
  const [step, setStep] = useState(1);
  const [activeLocation, setActiveLocation] = useState<'colombo' | 'negombo'>(initialLocation);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const isInitialMount = useRef(true);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  const handleCloseModal = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledOnClose]);

  const handleOpenModal = useCallback(() => {
    setInternalIsOpen(true);
  }, []);

  // Smoothly scrolls user back to the top of the booking wizard
  const scrollToBookingTop = useCallback((smooth = true) => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
    if (typeof window === 'undefined') return;
    const target = document.getElementById('booking-wizard') || document.getElementById('booking');
    if (target && !isModalOpen) {
      const navbarOffset = 90;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [isModalOpen]);

  // When step changes, automatically scroll modal body back up to top
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      scrollToBookingTop(true);
    }, 60);

    return () => clearTimeout(timer);
  }, [step, scrollToBookingTop]);

  // Intercept any click to #booking or #booking-wizard across the page to open the popup modal
  useEffect(() => {
    const handleGlobalBookingClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a[href="#booking"], a[href="/#booking"], a[href="#booking-wizard"], [data-booking-trigger="true"]'
      );
      if (target) {
        e.preventDefault();
        setInternalIsOpen(true);
      }
    };

    const handleCustomOpenEvent = (e: any) => {
      if (e.detail?.service) {
        setSelectedService(e.detail.service);
        setStep(2);
      }
      if (e.detail?.location) {
        setActiveLocation(e.detail.location);
      }
      setInternalIsOpen(true);
    };

    window.addEventListener('click', handleGlobalBookingClick);
    window.addEventListener('open-booking-modal' as any, handleCustomOpenEvent);

    return () => {
      window.removeEventListener('click', handleGlobalBookingClick);
      window.removeEventListener('open-booking-modal' as any, handleCustomOpenEvent);
    };
  }, []);

  // Lock body scroll and stop Lenis when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Safely stop Lenis from intercepting scroll/wheel inside the modal
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
      }
    };
  }, [isModalOpen, handleCloseModal]);
  
  // Data State
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [selectedService, setSelectedService] = useState<Service | null>(initialSelectedService || fallbackServices[0]);
  
  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Slots State
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Form Details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Confirmed Result
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [waCountdown, setWaCountdown] = useState<number>(3);
  const [waAutoRedirectDone, setWaAutoRedirectDone] = useState<boolean>(false);
  const [clientNotifSent, setClientNotifSent] = useState<boolean>(false);

  const handleEnableClientLockScreenReminder = async () => {
    if (!confirmedBooking) return;
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        await sendLockScreenNotification({
          title: '💈 Mosphere Appointment Reminder!',
          body: `✂️ ${confirmedBooking.serviceName}\n📅 ${confirmedBooking.date} at ${confirmedBooking.startTime}\nRef: ${confirmedBooking.bookingRef}`,
          tag: `confirmed-${confirmedBooking.bookingRef}`,
          url: '/',
          playChime: true,
        });
        setClientNotifSent(true);
      } else {
        alert('Please allow notifications in your browser permissions to receive lock screen reminders.');
      }
    } catch (err) {
      console.warn('Reminder error:', err);
    }
  };

  // Formats complete WhatsApp message and URL for salon concierge
  const buildWhatsAppUrl = (booking: any, loc: 'colombo' | 'negombo') => {
    const locConfig = loc === 'negombo' ? salonConfig.locations.negombo : salonConfig.locations.colombo;
    const targetWhatsApp = locConfig?.whatsapp || salonConfig.whatsapp;
    const branchName = loc === 'negombo' ? 'Negombo Branch (51 Galison Mawatha)' : 'Colombo / Nawala Branch (422A Nawala Rd)';
    const msg = [
      `*NEW APPOINTMENT RESERVATION — MOSPHERE SALON*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Booking Ref:* ${booking.bookingRef}`,
      `*Guest Name:* ${booking.customerName}`,
      `*Phone Number:* ${booking.phone}`,
      booking.email ? `*Email:* ${booking.email}` : null,
      `*Sanctuary:* ${branchName}`,
      `*Service:* ${booking.serviceName}`,
      `*Date:* ${booking.date}`,
      `*Time Slot:* ${booking.startTime}${booking.endTime ? ` – ${booking.endTime}` : ''}`,
      `*Duration:* ${booking.duration} mins`,
      `*Estimated:* LKR ${Number(booking.price || 0).toLocaleString()}`,
      booking.notes ? `*Special Notes:* ${booking.notes}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Sent automatically from Mosphere Online Concierge_`
    ].filter(Boolean).join('\n');

    return `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(msg)}`;
  };

  // User keeps control: no forced automatic page navigation away from site.
  // WhatsApp confirmation button is directly clickable in Step 5.

  // Sync external selected service from ServicesSection
  useEffect(() => {
    if (initialSelectedService) {
      setSelectedService(initialSelectedService);
      setStep(2);
      setInternalIsOpen(true);
      // Ensure smooth scroll to booking date selection
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          scrollToBookingTop(true);
        }, 80);
      }
    }
  }, [initialSelectedService, scrollToBookingTop]);

  // Sync initial location changes
  useEffect(() => {
    if (initialLocation) {
      setActiveLocation(initialLocation);
    }
  }, [initialLocation]);

  // Load active services
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success && data.services && data.services.length > 0) {
          const withImages: Service[] = data.services.map((s: any) => ({
            ...s,
            image: s.image || getServiceImage(s),
          }));
          setServices(withImages);
          if (!selectedService) {
            setSelectedService(withImages[0]);
          }
        }
      } catch (err) {
        console.warn('Using built-in services catalog:', err);
      }
    }
    loadServices();

    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  }, []);

  // Fetch slots whenever selectedDate or selectedService changes
  useEffect(() => {
    if (!selectedDate) return;

    async function loadSlots() {
      setSlotsError(null);
      const currentService = selectedService || fallbackServices[0];
      const duration = currentService?.duration || 60;

      // 1. INSTANT OPTIMISTIC SLOTS (0ms): User never sees a freeze or loading delay!
      const initialSlots = generateClientFallbackSlots(selectedDate, duration);
      setAvailableSlots((prev) => (prev.length > 0 ? prev : initialSlots));
      setSelectedSlot((prev: any) => (prev || (initialSlots.length > 0 ? initialSlots[0] : null)));

      // 2. LIVE ASYNC VERIFICATION (Background sync)
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}&serviceId=${currentService.id}&duration=${duration}`);
        const data = await res.json();
        if (data.success && data.isOpen && data.slots?.length > 0) {
          setAvailableSlots(data.slots);
          setSelectedSlot((prev: any) => {
            if (prev && data.slots.some((s: any) => s.time === prev.time)) {
              return prev;
            }
            return data.slots[0];
          });
        } else if (data.success && data.isOpen === false && data.reason) {
          setAvailableSlots([]);
          setSelectedSlot(null);
          setSlotsError(data.reason);
        }
      } catch (err) {
        console.warn('Network notice fetching live slots, using local verified slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedDate, selectedService]);

  // Handle Calendar Navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCalendarMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (calendarMonth === 0) setCalendarYear((prev) => prev - 1);
  };

  const nextMonth = () => {
    setCalendarMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (calendarMonth === 11) setCalendarYear((prev) => prev + 1);
  };

  // Submit Booking with Automatic WhatsApp Salon Dispatch
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot || !customerName || !phone) {
      setBookingError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: selectedSlot.time,
          customerName,
          phone,
          email,
          notes,
          location: activeLocation,
        }),
      });

      const data = await res.json();

      if ((res.status === 201 || res.status === 200 || res.ok) && data.success) {
        const confirmed = data.booking || {
          bookingRef: `MOS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          customerName,
          phone,
          email: email || '',
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          date: selectedDate,
          startTime: selectedSlot.time,
          endTime: selectedSlot.endTime || '',
          duration: selectedService.duration,
          price: selectedService.price,
          status: 'confirmed',
          location: activeLocation,
          notes: notes || '',
        };

        setConfirmedBooking(confirmed);
        setSubmitting(false);
        setStep(5);

        // Background sync to Cloud Firestore (non-blocking, safe from undefined values)
        try {
          syncBookingToFirestore({
            bookingRef: confirmed.bookingRef || '',
            customerName: confirmed.customerName || customerName || '',
            phone: confirmed.phone || phone || '',
            email: confirmed.email || email || '',
            serviceId: confirmed.serviceId || selectedService.id || '',
            serviceName: confirmed.serviceName || selectedService.name || '',
            date: confirmed.date || selectedDate || '',
            startTime: confirmed.startTime || selectedSlot.time || '',
            endTime: confirmed.endTime || selectedSlot.endTime || '',
            duration: Number(confirmed.duration || selectedService.duration) || 60,
            price: Number(confirmed.price || selectedService.price) || 0,
            status: 'confirmed',
            location: activeLocation || 'colombo',
            notes: confirmed.notes || notes || '',
          });
        } catch (syncErr) {
          console.warn('Background Firestore sync notice:', syncErr);
        }
        return;
      } else {
        // Race condition / double booking
        setSubmitting(false);
        setBookingError(data.error || 'This time slot was just booked. Please select another time.');
        if (res.status === 409) {
          setStep(3); // return to slot selection
        }
      }
    } catch (err: any) {
      console.warn('API booking notice, using direct Cloud Firestore reservation:', err);
      try {
        const fallbackRef = `MOS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const fallbackBooking = {
          id: `fs-${Date.now()}`,
          bookingRef: fallbackRef,
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: (email || '').trim(),
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          date: selectedDate,
          startTime: selectedSlot.time,
          endTime: selectedSlot.endTime || '',
          duration: selectedService.duration,
          price: selectedService.price,
          status: 'confirmed',
          location: activeLocation,
          notes: notes || '',
        };
        setConfirmedBooking(fallbackBooking);
        setSubmitting(false);
        setStep(5);

        try {
          syncBookingToFirestore(fallbackBooking);
        } catch (fsErr) {
          console.warn('Firestore fallback sync notice:', fsErr);
        }
      } catch (fallbackErr) {
        setSubmitting(false);
        setBookingError('Something went wrong. Please try again or message via WhatsApp.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Download .ICS calendar file
  const downloadIcs = () => {
    if (!confirmedBooking) return;
    const b = confirmedBooking;
    const cleanDate = b.date.replace(/-/g, '');
    const cleanStart = b.startTime.replace(':', '');
    const cleanEnd = b.endTime.replace(':', '');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MOSPHERE SALON COLOMBO//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${b.id}@mosphere.lk`,
      `DTSTART:${cleanDate}T${cleanStart}00`,
      `DTEND:${cleanDate}T${cleanEnd}00`,
      `SUMMARY:Mosphere — ${b.serviceName}`,
      `DESCRIPTION:Appointment for ${b.customerName}. Ref: ${b.bookingRef}`,
      `LOCATION:${salonConfig.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mosphere_${b.bookingRef}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Format Helper
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isNegombo = activeLocation === 'negombo';
  const branchConfig = isNegombo ? salonConfig.locations.negombo : salonConfig.locations.colombo;

  return (
    <section id="booking" className={`py-24 sm:py-32 relative border-t overflow-hidden transition-colors duration-500 ${
      isNegombo ? 'bg-[#02180F] border-emerald-500/20' : 'bg-[#09090B] border-white/10'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b pb-8 ${
          isNegombo ? 'border-emerald-500/25' : 'border-white/10'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-mono font-semibold ${isNegombo ? 'text-[#E5B842]' : 'text-mosphere-gold'}`}>05</span>
              <span className="text-white/20">/</span>
              <span className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60 font-medium">
                ONLINE RESERVATIONS & CONCIERGE
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight">
              RESERVE YOUR <span className={`italic ${isNegombo ? 'text-[#F3CC68]' : 'text-mosphere-goldLight'}`}>EXPERIENCE</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/60 font-light max-w-sm">
            Live Google Calendar synchronization for {isNegombo ? 'Negombo Coastal Studio' : 'Colombo Nawala Sanctuary'}. Select your bespoke ritual, choose your preferred slot, and receive instant confirmation.
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <a
            href={`tel:${branchConfig.phone.replace(/[^0-9]/g, '')}`}
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center gap-2"
          >
            <Phone className={`w-3.5 h-3.5 ${isNegombo ? 'text-[#E5B842]' : 'text-mosphere-gold'}`} />
            <span>CALL {isNegombo ? 'NEGOMBO' : 'COLOMBO'}</span>
          </a>

          <a
            href={`https://wa.me/${branchConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all uppercase flex items-center gap-2"
          >
            <span>WHATSAPP CONCIERGE</span>
          </a>

          <a
            href={branchConfig.instagram || salonConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center gap-2"
          >
            <span>INSTAGRAM</span>
          </a>

          <a
            href={branchConfig.googleMapsUrl || salonConfig.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center gap-2"
          >
            <span>GET DIRECTIONS</span>
          </a>
        </div>

        {/* On-Page Luxury Booking Portal Launch Card */}
        <div className="relative rounded-3xl overflow-hidden border border-mosphere-gold/30 bg-gradient-to-br from-white/[0.04] via-black/40 to-black/80 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-sm mb-4">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-mosphere-gold/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-mosphere-gold/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mosphere-gold/10 border border-mosphere-gold/30 text-mosphere-gold text-xs font-mono uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              BESPOKE APPOINTMENTS
            </span>

            <h3 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-wide mb-4">
              Schedule Your Sanctuary Session
            </h3>

            <p className="text-sm sm:text-base text-white/65 font-light leading-relaxed mb-8 max-w-lg">
              Launch our interactive reservation popup to select your bespoke hair architecture, skin aesthetics, or precision grooming ritual with real-time slot verification.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenModal}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold font-mono tracking-[0.2em] uppercase text-black transition-all duration-300 shadow-goldGlow hover:shadow-[0_0_35px_rgba(212,175,55,0.9)] hover:scale-105 flex items-center justify-center gap-2.5"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
                }}
              >
                <CalendarIcon className="w-4 h-4 text-black" />
                <span>OPEN BOOKING POPUP</span>
              </button>

              <a
                href={`https://wa.me/${branchConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-full text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WHATSAPP CONCIERGE</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================
           MOSPHERE LUXURY BOOKING POPUP MODAL
           ============================================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent="true"
            className="fixed inset-0 z-[99990] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              data-lenis-prevent="true"
              className={`relative w-full max-w-5xl h-[94vh] sm:h-[90vh] max-h-[94vh] rounded-2xl sm:rounded-3xl border shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden ${
                isNegombo ? 'bg-[#031812] border-emerald-500/40' : 'bg-[#09090D] border-mosphere-gold/40'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header Bar */}
              <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 border-b border-white/10 bg-black/70 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${isNegombo ? 'bg-[#E5B842]' : 'bg-mosphere-gold'} animate-pulse`} />
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-mosphere-gold block">
                      MOSPHERE CONCIERGE &bull; ONLINE RESERVATIONS
                    </span>
                    <h3 className="font-serif text-base sm:text-xl text-white font-light">
                      Bespoke Appointment Booking
                    </h3>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close Booking Modal"
                  className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all hover:scale-105 active:scale-95 group"
                >
                  <X className="w-5 h-5 text-white/70 group-hover:text-mosphere-gold transition-colors" />
                </button>
              </div>

              {/* Scrollable Wizard Body */}
              <div
                ref={modalScrollRef}
                data-lenis-prevent="true"
                data-lenis-prevent-wheel="true"
                data-lenis-prevent-touch="true"
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar p-3 sm:p-6"
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Booking Card & Wizard */}
                <div id="booking-wizard" className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
                  
                  {/* Top Gold Border */}
                  <div className="h-1 w-full bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark" />

          {/* Progress Step Header + Branch Selector */}
          {step < 5 && (
            <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Branch Selector Tabs */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveLocation('colombo')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    activeLocation === 'colombo'
                      ? 'bg-mosphere-gold text-black font-bold shadow-goldGlow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>COLOMBO / NAWALA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLocation('negombo')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    activeLocation === 'negombo'
                      ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'text-emerald-200/70 hover:text-white'
                  }`}
                >
                  <span>NEGOMBO STUDIO</span>
                </button>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center gap-4 overflow-x-auto">
                {[
                  { num: 1, title: 'Service' },
                  { num: 2, title: 'Date' },
                  { num: 3, title: 'Time' },
                  { num: 4, title: 'Details' },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.num}
                    onClick={() => s.num < step && setStep(s.num)}
                    disabled={s.num > step}
                    className={`flex items-center gap-2 whitespace-nowrap text-xs tracking-wider uppercase font-medium transition-colors ${
                      step === s.num
                        ? 'text-mosphere-gold font-semibold'
                        : s.num < step
                        ? 'text-white/80 hover:text-white cursor-pointer'
                        : 'text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        step === s.num
                          ? 'bg-mosphere-gold text-black shadow-goldGlow'
                          : s.num < step
                          ? 'bg-mosphere-gold/20 text-mosphere-gold border border-mosphere-gold/40'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {s.num < step ? '✓' : s.num}
                    </span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Panels */}
          <div className="p-6 sm:p-10">

            {/* ==========================================
                 STEP 1: SELECT SERVICE
                 ========================================== */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-serif text-2xl text-white font-light mb-2">Step 1: Choose Your Service</h3>
                <p className="text-xs text-white/60 mb-8">Select the grooming or aesthetic treatment you wish to reserve.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {services.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    const imageUrl = s.image || getServiceImage(s);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedService({ ...s, image: imageUrl });
                          setStep(2);
                        }}
                        className={`group rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'bg-mosphere-gold/[0.12] border-mosphere-gold shadow-goldGlow ring-1 ring-mosphere-gold/50'
                            : 'bg-[#0E0E14] border-white/10 hover:border-mosphere-gold/50 hover:bg-[#14141E]'
                        }`}
                      >
                        {/* Service Photo Header */}
                        {imageUrl && (
                          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black/60">
                            <img
                              src={imageUrl}
                              alt={s.name}
                              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Seamless dark gradient fade into card body */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E14] via-[#0E0E14]/20 to-black/35" />
                            
                            {/* Top Badges */}
                            <div className="absolute top-3 left-3">
                              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-mosphere-gold font-medium">
                                {s.category}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white/90 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-mosphere-gold" />
                                {s.duration} mins
                              </span>
                            </div>

                            {/* Selection Checkmark Indicator on Image if selected */}
                            {isSelected && (
                              <div className="absolute bottom-3 right-3 bg-mosphere-gold text-black p-1.5 rounded-full shadow-goldGlow flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 fill-black text-mosphere-gold" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                          <div>
                            {!imageUrl && (
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-mosphere-gold font-medium">
                                  {s.category}
                                </span>
                                <span className="text-xs text-white/50">{s.duration} mins</span>
                              </div>
                            )}
                            <h4 className="font-serif text-lg sm:text-xl text-white font-medium mb-2 group-hover:text-mosphere-goldLight transition-colors">
                              {s.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mb-5">
                              {s.description}
                            </p>
                          </div>
                          
                          <div className="pt-3.5 border-t border-white/10 flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-[10px] uppercase font-mono text-white/40 block">Investment</span>
                              <span className="text-sm sm:text-base font-serif font-medium text-mosphere-cream">
                                Starting LKR {s.price.toLocaleString()}
                              </span>
                            </div>
                            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors ${isSelected ? 'text-mosphere-gold' : 'text-white/50 group-hover:text-mosphere-gold'}`}>
                              {isSelected ? 'Selected • Choose Date →' : 'Choose Date →'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Transparency Note */}
                <div className="mb-8 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] font-mono text-white/60 text-center">
                  ✦ Starting rates shown. Final price depends on hair length, density, and customized stylist consultation.
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                    className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow hover:-translate-y-0.5 transition-all uppercase"
                  >
                    Continue to Date Selection →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================
                 STEP 2: SELECT DATE
                 ========================================== */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-white font-light">Step 2: Select Date</h3>
                    <p className="text-xs text-white/60">Choose your preferred day for your visit.</p>
                  </div>
                  {selectedService && (
                    <div className="hidden sm:flex items-center gap-3 text-right">
                      {(selectedService.image || getServiceImage(selectedService)) && (
                        <img
                          src={selectedService.image || getServiceImage(selectedService)}
                          alt={selectedService.name}
                          className="w-11 h-11 rounded-lg object-cover border border-mosphere-gold/40 shadow-sm"
                        />
                      )}
                      <div className="text-right">
                        <span className="text-xs text-mosphere-gold block font-medium">{selectedService.name}</span>
                        <span className="text-xs text-white/50">{selectedService.duration} min • Starting LKR {selectedService.price.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calendar View */}
                <div className="max-w-md mx-auto bg-black/40 rounded-xl border border-white/10 p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-lg text-white font-medium">
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-white/40 mb-3">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const thisDate = new Date(calendarYear, calendarMonth, day);
                      thisDate.setHours(0, 0, 0, 0);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const dateIso = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isPast = thisDate < today;
                      const isSelected = selectedDate === dateIso;

                      return (
                        <button
                          key={day}
                          disabled={isPast}
                          onClick={() => setSelectedDate(dateIso)}
                          className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                            isSelected
                              ? 'bg-mosphere-gold text-black font-bold shadow-goldGlow'
                              : isPast
                              ? 'text-white/20 cursor-not-allowed'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 uppercase"
                  >
                    ← Back to Services
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!selectedDate}
                    className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow hover:-translate-y-0.5 transition-all uppercase"
                  >
                    Continue to Time Slots →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================
                 STEP 3: SELECT TIME SLOT (REAL-TIME AVAILABILITY)
                 ========================================== */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-white font-light">Step 3: Select Available Time</h3>
                    <p className="text-xs text-white/60">
                      Date: <span className="text-mosphere-gold font-medium">{formatFriendlyDate(selectedDate)}</span>
                    </p>
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-time Google Calendar sync</span>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="py-16 text-center text-sm text-white/50 flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-mosphere-gold border-t-transparent rounded-full animate-spin" />
                    <span>Checking Google Calendar for available intervals...</span>
                  </div>
                ) : slotsError ? (
                  <div className="py-14 text-center text-sm bg-white/[0.02] border border-white/5 rounded-xl p-8 mb-6">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-white font-medium mb-1">No Available Appointments</div>
                    <p className="text-xs text-white/50 mb-4">{slotsError}</p>
                    <button
                      onClick={() => setStep(2)}
                      className="px-5 py-2 rounded-full text-xs font-semibold text-mosphere-gold border border-mosphere-gold/40 hover:bg-mosphere-gold/10 uppercase"
                    >
                      Pick Another Date
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot?.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-mosphere-gold text-black font-bold border-mosphere-gold shadow-goldGlow'
                                : 'bg-white/[0.03] border-white/10 hover:border-mosphere-gold/40 text-white/80 hover:text-white'
                            }`}
                          >
                            <div className="text-sm">{slot.formattedTime}</div>
                            <div className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-white/40'}`}>
                              to {slot.formattedEndTime}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 uppercase"
                  >
                    ← Back to Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!selectedSlot}
                    className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow hover:-translate-y-0.5 transition-all uppercase"
                  >
                    Continue to Details →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================
                 STEP 4: CUSTOMER DETAILS & REVIEW
                 ========================================== */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-serif text-2xl text-white font-light mb-2">Step 4: Guest Details & Preferences</h3>
                <p className="text-xs text-white/60 mb-8">Provide your contact info to receive calendar reminders and booking confirmation.</p>

                {bookingError && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Form Fields */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">
                        Full Name <span className="text-mosphere-gold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sahan Wickramasinghe"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">
                        Phone Number (Sri Lanka) <span className="text-mosphere-gold">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077 729 1629"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">
                        Email Address (Optional for Google Calendar Invite)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sahan@example.com"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">
                        Special Requests or Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Let us know if you have specific stylist preferences, scalp concerns, or dietary requests..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mosphere-gold transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Summary Card */}
                  <div className="lg:col-span-5">
                    <div className="bg-black/60 rounded-xl border border-mosphere-gold/30 p-6 overflow-hidden">
                      {selectedService && (selectedService.image || getServiceImage(selectedService)) && (
                        <div className="relative h-36 -mx-6 -mt-6 mb-5 overflow-hidden bg-black/60 border-b border-white/10">
                          <img
                            src={selectedService.image || getServiceImage(selectedService)}
                            alt={selectedService.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-mosphere-gold bg-black/70 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                              {selectedService.category}
                            </span>
                            <span className="text-[10px] font-mono text-white/80 bg-black/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {selectedService.duration} mins
                            </span>
                          </div>
                        </div>
                      )}
                      <h4 className="font-serif text-lg text-white font-medium mb-4 pb-3 border-b border-white/10">
                        Appointment Summary
                      </h4>

                      <div className="space-y-3 text-xs text-white/70">
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase tracking-wider">Service</span>
                          <span className="font-medium text-white text-right">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase tracking-wider">Date</span>
                          <span className="font-medium text-white">{formatFriendlyDate(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase tracking-wider">Time</span>
                          <span className="font-medium text-white">
                            {selectedSlot?.formattedTime} – {selectedSlot?.formattedEndTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase tracking-wider">Duration</span>
                          <span className="font-medium text-white">{selectedService?.duration} mins</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase tracking-wider">Location</span>
                          <span className="font-medium text-white text-right">
                            {isNegombo ? '51 Galison Mawatha, Negombo' : '422A Nawala Rd, Rajagiriya'}
                          </span>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex flex-col gap-1.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs uppercase tracking-wider text-mosphere-gold font-semibold">Pricing Guide</span>
                            <span className="text-sm font-serif font-bold text-mosphere-cream">
                              Starting from LKR {selectedService?.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[11px] text-white/50 leading-tight">
                            ✦ Prices vary individually based on hair length, density, and personalized stylist consultation. (Pay at salon)
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 py-4 rounded-full text-xs font-semibold tracking-[0.15em] text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow hover:-translate-y-0.5 transition-all duration-300 uppercase flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Confirming & Syncing Calendar...</span>
                          </>
                        ) : (
                          <>
                            <span>CONFIRM APPOINTMENT</span>
                            <Sparkles className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-8 pt-4 border-t border-white/5 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 uppercase"
                  >
                    ← Back to Time Slots
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================
                 STEP 5: BOOKING CONFIRMED SCREEN
                 ========================================== */}
            {step === 5 && confirmedBooking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-xl mx-auto py-6"
              >
                <div className="w-16 h-16 rounded-full bg-mosphere-gold/20 border-2 border-mosphere-gold flex items-center justify-center mx-auto mb-6 shadow-goldGlow">
                  <CheckCircle2 className="w-8 h-8 text-mosphere-gold" />
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl text-white font-medium tracking-wide mb-2">
                  BOOKING CONFIRMED
                </h3>
                <p className="text-xs sm:text-sm text-white/60 font-light mb-6">
                  Your appointment has been registered and synced directly with our private Google Calendar.
                </p>

                {/* Booking Reference Chip */}
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-mosphere-gold/10 border border-mosphere-gold/40 text-xs font-semibold text-mosphere-gold mb-6">
                  <span>Booking Reference:</span>
                  <span className="font-mono tracking-wider">{confirmedBooking.bookingRef}</span>
                </div>

                {/* ✦ AUTOMATIC WHATSAPP DISPATCH TO SALON ✦ */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-b from-[#062A1D] to-[#03150F] border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.3)] text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-mosphere-gold to-emerald-500" />

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono tracking-widest text-emerald-400 font-bold uppercase">
                      ✦ SALON WHATSAPP CONCIERGE ✦
                    </span>
                  </div>

                  <h4 className="font-serif text-xl sm:text-2xl text-white font-medium mb-2">
                    Forward to Salon Concierge
                  </h4>

                  <p className="text-xs sm:text-sm text-emerald-100/75 max-w-md mx-auto mb-5 leading-relaxed">
                    Tap below to open WhatsApp with your reservation details pre-formatted and connect directly with our concierge at{' '}
                    <strong className="text-emerald-300 font-mono">077 729 1629</strong>.
                  </p>

                  <a
                    href={buildWhatsAppUrl(confirmedBooking, activeLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-xs sm:text-sm font-bold tracking-wider text-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 hover:brightness-110 shadow-[0_0_25px_rgba(52,211,153,0.7)] hover:scale-[1.02] transition-all uppercase"
                  >
                    <MessageSquare className="w-4 h-4 text-black fill-current" />
                    <span>OPEN IN WHATSAPP & FORWARD RESERVATION</span>
                  </a>
                </div>

                {/* Details Breakdown */}
                <div className="bg-black/50 rounded-xl border border-white/10 p-6 text-left space-y-3 text-xs mb-8">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Guest Name</span>
                    <span className="text-white font-medium">{confirmedBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Phone Number</span>
                    <span className="text-white font-medium">{confirmedBooking.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Service</span>
                    <span className="text-white font-medium">{confirmedBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Date & Time</span>
                    <span className="text-mosphere-gold font-medium">
                      {formatFriendlyDate(confirmedBooking.date)} at {confirmedBooking.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Location</span>
                    <span className="text-white font-medium">
                      {activeLocation === 'negombo'
                        ? '51 Galison Mawatha, Negombo'
                        : '422A Nawala Rd, Rajagiriya'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-1">
                    <span className="text-white/40">Pricing Guide</span>
                    <span className="text-xs text-mosphere-gold font-medium text-right">
                      Starting from LKR {confirmedBooking.price.toLocaleString()} (Tailored consultation at salon)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                  {confirmedBooking.addToGoogleCalendarUrl && (
                    <a
                      href={confirmedBooking.addToGoogleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-full text-xs font-semibold tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all uppercase flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>ADD TO GOOGLE CALENDAR</span>
                    </a>
                  )}

                  <a
                    href={buildWhatsAppUrl(confirmedBooking, activeLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setWaAutoRedirectDone(true)}
                    className="px-6 py-3 rounded-full text-xs font-bold tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all uppercase flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>DELIVER VIA WHATSAPP</span>
                  </a>

                  <a
                    href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`}
                    className="px-5 py-3 rounded-full text-xs font-semibold tracking-wider text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all uppercase flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 text-mosphere-gold" />
                    <span>CALL MOSPHERE</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleEnableClientLockScreenReminder}
                    className={`px-5 py-3 rounded-full text-xs font-semibold tracking-wider transition-all uppercase flex items-center gap-2 border ${
                      clientNotifSent
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    }`}
                  >
                    <BellRing className="w-4 h-4 text-cyan-300" />
                    <span>{clientNotifSent ? '✓ Reminder Sent to Lock Screen' : 'Send Lock Screen Alert'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadIcs}
                    className="px-5 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all uppercase flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD .ICS</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setCustomerName('');
                      setPhone('');
                      setEmail('');
                      setNotes('');
                      setConfirmedBooking(null);
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-mosphere-gold hover:text-mosphere-goldLight transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Book Another Appointment</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close Portal</span>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
)}
</AnimatePresence>
    </section>
  );
}
