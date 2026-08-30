import { query, initDatabase } from './db';
import { googleCalendarService } from './googleCalendar';
import { salonConfig } from './config';

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTo12Hour(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function getPeriodOfDay(timeStr: string): 'Morning' | 'Afternoon' | 'Evening' {
  const [h] = timeStr.split(':').map(Number);
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export interface AvailableSlot {
  time: string; // "10:00"
  formattedTime: string; // "10:00 AM"
  endTime: string; // "11:00"
  formattedEndTime: string; // "11:00 AM"
  period: 'Morning' | 'Afternoon' | 'Evening';
  durationMinutes: number;
  available: boolean;
}

export class AvailabilityService {
  async getAvailableSlots({
    dateStr,
    serviceDuration = 60,
    bufferMinutes = 15,
    slotInterval = 15
  }: {
    dateStr: string;
    serviceDuration?: number;
    bufferMinutes?: number;
    slotInterval?: number;
  }) {
    await initDatabase();

    const targetDate = new Date(`${dateStr}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Past date check
    if (targetDate < today) {
      return { date: dateStr, isOpen: false, reason: 'Appointments cannot be scheduled in the past.', slots: [], totalAvailable: 0 };
    }

    // 2. Day of week & Business Hours
    const dayOfWeek = targetDate.getDay();
    const dayHours = await query.get(
      'SELECT * FROM business_hours WHERE day = ?',
      [dayOfWeek]
    );

    if (!dayHours || dayHours.isClosed) {
      return { date: dateStr, isOpen: false, reason: `Mosphere is closed on ${dayHours?.dayName || 'this day'}.`, slots: [], totalAvailable: 0 };
    }

    // 3. Blocked Dates / Holidays check
    const blockedEntries = await query.all(
      'SELECT * FROM blocked_dates WHERE date = ?',
      [dateStr]
    );

    // If full-day blocked
    const fullDayBlocked = blockedEntries.find(b => !b.startTime && !b.endTime);
    if (fullDayBlocked) {
      return { date: dateStr, isOpen: false, reason: fullDayBlocked.reason || 'Salon is closed for a private event or holiday.', slots: [], totalAvailable: 0 };
    }

    const openMin = timeToMinutes(dayHours.openingTime || '10:00');
    const closeMin = timeToMinutes(dayHours.closingTime || '20:00');
    const duration = serviceDuration;

    // 4. Busy Intervals from Database Bookings
    const dbBookings = await query.all(
      `SELECT startTime, endTime, customerName, serviceName 
       FROM bookings 
       WHERE date = ? AND status IN ('confirmed', 'pending', 'rescheduled')`,
      [dateStr]
    );

    const busyRanges: Array<{ startMin: number; endMin: number; source: string; title?: string }> = [];

    for (const b of dbBookings) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      busyRanges.push({
        startMin: bStart,
        endMin: bEnd + bufferMinutes,
        source: 'local_booking',
        title: `${b.serviceName} (${b.customerName})`
      });
    }

    // Add partial-day blocked time ranges
    for (const b of blockedEntries) {
      if (b.startTime && b.endTime) {
        busyRanges.push({
          startMin: timeToMinutes(b.startTime),
          endMin: timeToMinutes(b.endTime),
          source: 'blocked_time',
          title: b.reason || 'Blocked Period'
        });
      }
    }

    // 5. Busy Intervals from Google Calendar
    try {
      const gcalEvents = await googleCalendarService.getBusyIntervals(dateStr);
      for (const event of gcalEvents) {
        let gStart = 0;
        let gEnd = 1440;

        if (event.start?.includes('T')) {
          gStart = timeToMinutes(event.start.split('T')[1].substring(0, 5));
        }
        if (event.end?.includes('T')) {
          gEnd = timeToMinutes(event.end.split('T')[1].substring(0, 5));
        }

        busyRanges.push({
          startMin: gStart,
          endMin: gEnd + bufferMinutes,
          source: 'google_calendar',
          title: event.summary
        });
      }
    } catch (err: any) {
      console.warn('Google Calendar availability check warning:', err.message);
    }

    // 6. Current local time check if booking for today
    const now = new Date();
    const isToday = now.toISOString().split('T')[0] === dateStr;
    const currentMinsToday = now.getHours() * 60 + now.getMinutes() + 15; // 15 min minimum advance notice

    // 7. Calculate Candidate Slots
    const slots: AvailableSlot[] = [];

    for (let candStart = openMin; candStart + duration <= closeMin; candStart += slotInterval) {
      const candEnd = candStart + duration;

      if (isToday && candStart < currentMinsToday) {
        continue;
      }

      // Check overlap: max(start1, start2) < min(end1, end2)
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

    return {
      date: dateStr,
      isOpen: true,
      reason: null,
      serviceDuration: duration,
      bufferMinutes,
      totalAvailable: slots.length,
      slots,
      grouped: {
        morning: slots.filter(s => s.period === 'Morning'),
        afternoon: slots.filter(s => s.period === 'Afternoon'),
        evening: slots.filter(s => s.period === 'Evening')
      }
    };
  }

  async isSlotAvailable(dateStr: string, startTimeStr: string, durationMinutes: number): Promise<{ available: boolean; reason?: string }> {
    const slots = await this.getAvailableSlots({ dateStr, serviceDuration: durationMinutes });
    if (!slots.isOpen) {
      return { available: false, reason: slots.reason || 'Date is closed for appointments.' };
    }

    const exists = slots.slots.some(s => s.time === startTimeStr);
    if (!exists) {
      return { available: false, reason: 'The selected time slot is occupied or conflicts with an existing schedule.' };
    }

    return { available: true };
  }
}

export const availabilityService = new AvailabilityService();
