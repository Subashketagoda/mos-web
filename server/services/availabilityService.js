import { query } from '../db/index.js';
import { googleCalendarService } from './googleCalendar.js';
import { config } from '../config.js';

// Helper: Convert "HH:MM" (24h) to minutes from midnight
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert minutes from midnight to "HH:MM" (24h)
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper: Format "HH:MM" to "10:00 AM"
function formatTo12Hour(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

// Helper: Determine period of day
function getPeriodOfDay(timeStr) {
  const [h] = timeStr.split(':').map(Number);
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

class AvailabilityService {
  /**
   * Retrieves all business settings from DB
   */
  async getSettings() {
    const rows = await query.all('SELECT key, value FROM settings');
    const settings = {
      openTime: '10:00',
      closeTime: '20:00',
      bufferMinutes: 15,
      slotInterval: 15,
      closedDays: [],
      blockedDates: [],
      maxAdvanceDays: 30,
      salonName: config.salonName,
      salonPhone: config.salonPhone,
      salonWhatsApp: config.salonWhatsApp,
      salonAddress: config.salonAddress,
      currency: '₹'
    };

    for (const row of rows) {
      if (row.key === 'closedDays' || row.key === 'blockedDates') {
        try {
          settings[row.key] = JSON.parse(row.value);
        } catch {
          settings[row.key] = [];
        }
      } else if (['bufferMinutes', 'slotInterval', 'maxAdvanceDays'].includes(row.key)) {
        settings[row.key] = parseInt(row.value, 10);
      } else {
        settings[row.key] = row.value;
      }
    }

    return settings;
  }

  /**
   * Checks if a date is open for appointments
   */
  async checkDateStatus(dateStr, settings = null) {
    if (!settings) {
      settings = await this.getSettings();
    }

    const targetDate = new Date(`${dateStr}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Is in the past?
    if (targetDate < today) {
      return { isOpen: false, reason: 'Past date cannot be booked' };
    }

    // 2. Beyond max advance booking window?
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
    if (targetDate > maxDate) {
      return { isOpen: false, reason: `Appointments can only be booked up to ${settings.maxAdvanceDays} days in advance` };
    }

    // 3. Closed day of week? (0=Sun, 1=Mon, ...)
    const dayOfWeek = targetDate.getDay();
    if (settings.closedDays.includes(dayOfWeek)) {
      return { isOpen: false, reason: 'Salon is closed on this day of the week' };
    }

    // 4. Blocked / holiday date?
    if (settings.blockedDates.includes(dateStr)) {
      return { isOpen: false, reason: 'Salon is closed for a private event or holiday' };
    }

    return { isOpen: true, reason: null };
  }

  /**
   * Calculates all genuine available time slots for a given date and service duration.
   * Cross-references Google Calendar + Local Database + Business hours + Buffers.
   */
  async getAvailableSlots({ dateStr, serviceDuration, bufferTime = null }) {
    const settings = await this.getSettings();
    const duration = parseInt(serviceDuration, 10) || 45;
    const buffer = bufferTime !== null ? parseInt(bufferTime, 10) : settings.bufferMinutes;
    const slotInterval = settings.slotInterval || 15;

    // Check if the date is open
    const dateStatus = await this.checkDateStatus(dateStr, settings);
    if (!dateStatus.isOpen) {
      return {
        date: dateStr,
        isOpen: false,
        reason: dateStatus.reason,
        slots: [],
        totalAvailable: 0
      };
    }

    const openMin = timeToMinutes(settings.openTime);
    const closeMin = timeToMinutes(settings.closeTime);

    // 1. Fetch busy intervals from Local SQLite Database
    const dbBookings = await query.all(
      `SELECT startTime, endTime, duration, customerName, serviceName 
       FROM bookings 
       WHERE date = ? AND status IN ('confirmed', 'pending', 'rescheduled')`,
      [dateStr]
    );

    const busyRanges = [];

    // Add local DB bookings to busy intervals (including buffer time after each booking)
    for (const b of dbBookings) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      busyRanges.push({
        startMin: bStart,
        endMin: bEnd + buffer, // buffer after appointment
        source: 'local_booking',
        title: `${b.serviceName} (${b.customerName})`
      });
    }

    // 2. Fetch busy intervals from Google Calendar
    try {
      const gcalEvents = await googleCalendarService.getBusyIntervals(dateStr);
      for (const event of gcalEvents) {
        // Extract time from RFC3339 string (e.g. "2026-08-29T14:30:00+05:30")
        let eventStartMin = 0;
        let eventEndMin = 0;

        if (event.start.includes('T')) {
          const startTimePart = event.start.split('T')[1].substring(0, 5);
          eventStartMin = timeToMinutes(startTimePart);
        } else {
          // All-day event blocks the entire day
          eventStartMin = 0;
          eventEndMin = 1440;
        }

        if (event.end && event.end.includes('T')) {
          const endTimePart = event.end.split('T')[1].substring(0, 5);
          eventEndMin = timeToMinutes(endTimePart);
        } else if (eventEndMin === 0) {
          eventEndMin = 1440;
        }

        busyRanges.push({
          startMin: eventStartMin,
          endMin: eventEndMin + buffer,
          source: 'google_calendar',
          title: event.summary
        });
      }
    } catch (err) {
      console.warn('Could not fetch Google Calendar busy slots for slot generation:', err.message);
    }

    // 3. Filter past slots if the target date is today
    const now = new Date();
    const isToday = now.toISOString().split('T')[0] === dateStr;
    const currentMinsToday = now.getHours() * 60 + now.getMinutes() + 15; // Require at least 15 mins advance notice for same-day

    // 4. Generate all possible candidate slots from openTime to closeTime
    const slots = [];

    for (let candStart = openMin; candStart + duration <= closeMin; candStart += slotInterval) {
      const candEnd = candStart + duration;

      // If today, skip times that have already passed
      if (isToday && candStart < currentMinsToday) {
        continue;
      }

      // Check collision with any busy range:
      // Overlap exists if max(start1, start2) < min(end1, end2)
      // Candidate requires [candStart, candEnd + buffer] window
      const hasConflict = busyRanges.some(busy => {
        const overlapStart = Math.max(candStart, busy.startMin);
        const overlapEnd = Math.min(candEnd, busy.endMin);
        return overlapStart < overlapEnd;
      });

      if (!hasConflict) {
        const startTimeStr = minutesToTime(candStart);
        const endTimeStr = minutesToTime(candEnd);
        slots.push({
          time: startTimeStr,
          formattedTime: formatTo12Hour(startTimeStr),
          endTime: endTimeStr,
          formattedEndTime: formatTo12Hour(endTimeStr),
          period: getPeriodOfDay(startTimeStr),
          durationMinutes: duration,
          available: true
        });
      }
    }

    // Group into periods for UI convenience
    const grouped = {
      morning: slots.filter(s => s.period === 'Morning'),
      afternoon: slots.filter(s => s.period === 'Afternoon'),
      evening: slots.filter(s => s.period === 'Evening')
    };

    return {
      date: dateStr,
      isOpen: true,
      reason: null,
      serviceDuration: duration,
      bufferMinutes: buffer,
      totalAvailable: slots.length,
      slots,
      grouped
    };
  }

  /**
   * Validates if a specific time slot is strictly available right now
   * (Used right before booking insertion to prevent race conditions).
   */
  async isSlotAvailable(dateStr, startTimeStr, durationMinutes) {
    const startMin = timeToMinutes(startTimeStr);
    const endMin = startMin + durationMinutes;
    const settings = await this.getSettings();
    const buffer = settings.bufferMinutes;

    const openMin = timeToMinutes(settings.openTime);
    const closeMin = timeToMinutes(settings.closeTime);

    // Business hours boundary check
    if (startMin < openMin || endMin > closeMin) {
      return { available: false, reason: 'Appointment time falls outside business hours.' };
    }

    // Date status check
    const dateStatus = await this.checkDateStatus(dateStr, settings);
    if (!dateStatus.isOpen) {
      return { available: false, reason: dateStatus.reason };
    }

    // Past time check if today
    const now = new Date();
    const isToday = now.toISOString().split('T')[0] === dateStr;
    const currentMinsToday = now.getHours() * 60 + now.getMinutes();
    if (isToday && startMin < currentMinsToday) {
      return { available: false, reason: 'This time slot has already passed.' };
    }

    // 1. Check local DB conflicts
    const conflictingBookings = await query.all(
      `SELECT id, customerName, serviceName, startTime, endTime 
       FROM bookings 
       WHERE date = ? AND status IN ('confirmed', 'pending', 'rescheduled')`,
      [dateStr]
    );

    for (const b of conflictingBookings) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime) + buffer;
      if (Math.max(startMin, bStart) < Math.min(endMin, bEnd)) {
        return {
          available: false,
          reason: `Slot conflicts with an existing booking (${b.serviceName}).`
        };
      }
    }

    // 2. Check Google Calendar events in real-time
    const gcalEvents = await googleCalendarService.getBusyIntervals(dateStr);
    for (const event of gcalEvents) {
      let gStart = 0;
      let gEnd = 0;
      if (event.start.includes('T')) {
        gStart = timeToMinutes(event.start.split('T')[1].substring(0, 5));
      } else {
        gStart = 0;
        gEnd = 1440;
      }

      if (event.end && event.end.includes('T')) {
        gEnd = timeToMinutes(event.end.split('T')[1].substring(0, 5));
      } else if (gEnd === 0) {
        gEnd = 1440;
      }

      if (Math.max(startMin, gStart) < Math.min(endMin, gEnd + buffer)) {
        return {
          available: false,
          reason: `Slot conflicts with a scheduled Google Calendar event: ${event.summary || 'Reserved'}.`
        };
      }
    }

    return { available: true };
  }
}

export const availabilityService = new AvailabilityService();
