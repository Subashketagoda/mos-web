'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { salonConfig } from '@/lib/config';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface AvailableSlot {
  time: string;
  formattedTime: string;
  endTime: string;
  formattedEndTime: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  durationMinutes: number;
}

interface BookingSectionProps {
  initialSelectedService?: Service | null;
  initialLocation?: 'colombo' | 'negombo';
}

export default function BookingSection({ initialSelectedService, initialLocation = 'colombo' }: BookingSectionProps) {
  // Wizard Steps: 1 = Service, 2 = Date, 3 = Time, 4 = Details, 5 = Confirmed
  const [step, setStep] = useState(1);
  const [activeLocation, setActiveLocation] = useState<'colombo' | 'negombo'>(initialLocation);
  
  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
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

  // Sync external selected service from ServicesSection
  useEffect(() => {
    if (initialSelectedService) {
      setSelectedService(initialSelectedService);
      setStep(2);
    }
  }, [initialSelectedService]);

  // Load active services
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success && data.services) {
          setServices(data.services);
          if (!selectedService && data.services.length > 0) {
            setSelectedService(data.services[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
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
    if (!selectedDate || !selectedService) return;

    async function loadSlots() {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}&serviceId=${selectedService!.id}`);
        const data = await res.json();
        if (data.success && data.isOpen && data.slots?.length > 0) {
          setAvailableSlots(data.slots);
          // Auto-select first slot if none selected
          setSelectedSlot(data.slots[0]);
        } else {
          setAvailableSlots([]);
          setSelectedSlot(null);
          setSlotsError(data.reason || 'No available slots for this date.');
        }
      } catch (err) {
        setSlotsError('Unable to connect to Google Calendar. Please check connection.');
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

  // Submit Booking
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

      if (res.status === 201 && data.success) {
        setConfirmedBooking(data.booking);
        setStep(5);
      } else {
        // Race condition / double booking
        setBookingError(data.error || 'This time slot was just booked. Please select another time.');
        if (res.status === 409) {
          setStep(3); // return to slot selection
        }
      }
    } catch (err: any) {
      setBookingError('Something went wrong. Please try again.');
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

  return (
    <section id="booking" className="py-24 sm:py-32 relative bg-[#09090B] border-t border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-mosphere-gold font-semibold">07</span>
              <span className="text-white/20">/</span>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
                RESERVATIONS & CONCIERGE
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight">
              RESERVE YOUR <span className="italic text-mosphere-goldLight">EXPERIENCE</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/50 font-light max-w-sm">
            Live Google Calendar synchronization. Select your bespoke ritual, choose your preferred slot, and receive instant confirmation.
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <a
            href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`}
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-mosphere-gold" />
            <span>CALL NOW</span>
          </a>

          <a
            href={`https://wa.me/${salonConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all uppercase flex items-center gap-2"
          >
            <span>WHATSAPP</span>
          </a>

          <a
            href={salonConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center gap-2"
          >
            <span>INSTAGRAM</span>
          </a>

          <a
            href={salonConfig.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mosphere-gold/40 transition-all uppercase flex items-center gap-2"
          >
            <span>GET DIRECTIONS</span>
          </a>
        </div>

        {/* Booking Card & Wizard */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
          
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {services.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedService(s)}
                        className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-mosphere-gold/10 border-mosphere-gold shadow-goldGlow'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-mosphere-gold font-medium">
                              {s.category}
                            </span>
                            <span className="text-xs text-white/50">{s.duration} mins</span>
                          </div>
                          <h4 className="font-serif text-lg text-white font-medium mb-1">{s.name}</h4>
                          <p className="text-xs text-white/60 font-light leading-relaxed mb-4">{s.description}</p>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-sm font-serif font-semibold text-mosphere-cream">
                            LKR {s.price.toLocaleString()}
                          </span>
                          <span className={`text-xs font-semibold uppercase ${isSelected ? 'text-mosphere-gold' : 'text-white/40'}`}>
                            {isSelected ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
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
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-mosphere-gold block">{selectedService.name}</span>
                      <span className="text-xs text-white/50">{selectedService.duration} min • LKR {selectedService.price.toLocaleString()}</span>
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
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 uppercase"
                  >
                    ← Back to Services
                  </button>
                  <button
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
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 uppercase"
                  >
                    ← Back to Date
                  </button>
                  <button
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
                    <div className="bg-black/60 rounded-xl border border-mosphere-gold/30 p-6">
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
                          <span className="font-medium text-white text-right">422A Nawala Rd, Colombo</span>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-baseline">
                          <span className="text-sm uppercase tracking-wider text-white font-semibold">Total (Pay at Salon)</span>
                          <span className="text-xl font-serif font-bold text-mosphere-cream">
                            LKR {selectedService?.price.toLocaleString()}
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
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-mosphere-gold/10 border border-mosphere-gold/40 text-xs font-semibold text-mosphere-gold mb-8">
                  <span>Booking Reference:</span>
                  <span className="font-mono tracking-wider">{confirmedBooking.bookingRef}</span>
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
                  <div className="flex justify-between pt-1">
                    <span className="text-white/40">Total Amount</span>
                    <span className="text-base font-serif font-bold text-mosphere-cream">
                      LKR {confirmedBooking.price.toLocaleString()}
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
                    href={`https://wa.me/${salonConfig.whatsapp}?text=${encodeURIComponent(
                      `Hello Mosphere, I have confirmed booking ${confirmedBooking.bookingRef} for ${confirmedBooking.serviceName} on ${confirmedBooking.date} at ${confirmedBooking.startTime}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full text-xs font-semibold tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all uppercase flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WHATSAPP US</span>
                  </a>

                  <a
                    href={`tel:${salonConfig.phone.replace(/[^0-9]/g, '')}`}
                    className="px-5 py-3 rounded-full text-xs font-semibold tracking-wider text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all uppercase flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 text-mosphere-gold" />
                    <span>CALL MOSPHERE</span>
                  </a>

                  <button
                    onClick={downloadIcs}
                    className="px-5 py-3 rounded-full text-xs font-medium tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all uppercase flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD .ICS</span>
                  </button>
                </div>

                <div>
                  <button
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
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
