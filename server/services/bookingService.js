import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { googleCalendarService } from './googleCalendar.js';
import { availabilityService } from './availabilityService.js';
import { config } from '../config.js';

// Simple in-memory locking mechanism to serialize booking creation and prevent race condition double-bookings
const bookingLocks = new Set();

// Helper: Calculate end time from start time and duration
function calculateEndTime(startTime, durationMinutes) {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

// Helper: Generate unique human-readable booking reference
function generateBookingReference(dateStr) {
  const cleanDate = dateStr.replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MOS-${cleanDate}-${randomSuffix}`;
}

class BookingService {
  /**
   * Creates a new customer appointment with concurrency control and Google Calendar sync
   */
  async createBooking({
    serviceId,
    date,
    startTime,
    customerName,
    phone,
    email = '',
    notes = ''
  }) {
    // 1. Basic validation
    if (!serviceId || !date || !startTime || !customerName || !phone) {
      throw new Error('All required fields (service, date, time, customer name, phone) must be provided.');
    }

    // Sanitize and trim
    const trimmedName = customerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedNotes = (notes || '').trim();
    const trimmedEmail = (email || '').trim();

    if (trimmedName.length < 2) {
      throw new Error('Please enter a valid customer name.');
    }

    if (trimmedPhone.length < 7) {
      throw new Error('Please enter a valid phone number.');
    }

    // 2. Fetch service details from DB
    const service = await query.get('SELECT * FROM services WHERE id = ? AND isActive = 1', [serviceId]);
    if (!service) {
      throw new Error('The selected service is not available or inactive.');
    }

    const duration = service.duration;
    const price = service.price;
    const serviceName = service.name;
    const endTime = calculateEndTime(startTime, duration);

    // 3. Acquire lock for this date + time window to prevent race-condition double bookings
    const lockKey = `${date}_${startTime}`;
    if (bookingLocks.has(lockKey)) {
      throw new Error('This time slot is currently being processed by another customer. Please choose another time.');
    }

    bookingLocks.add(lockKey);

    try {
      // 4. Atomic availability check (Google Calendar + Local DB)
      const availabilityCheck = await availabilityService.isSlotAvailable(date, startTime, duration);
      if (!availabilityCheck.available) {
        throw new Error(availabilityCheck.reason || 'This slot is no longer available. Please select another time.');
      }

      // 5. Generate booking ID and human-friendly Reference
      const bookingId = uuidv4();
      const bookingRef = generateBookingReference(date);
      const now = new Date().toISOString();

      // 6. Create Google Calendar Event
      const gcalResult = await googleCalendarService.createEvent({
        customerName: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        serviceName,
        duration,
        price,
        date,
        startTime,
        endTime,
        notes: trimmedNotes,
        bookingRef
      });

      const googleCalendarEventId = gcalResult ? gcalResult.eventId : null;

      // 7. Store booking record in SQLite Database
      await query.run(
        `INSERT INTO bookings (
          id, bookingRef, customerName, phone, email, 
          serviceId, serviceName, date, startTime, endTime, 
          duration, price, status, googleCalendarEventId, notes, 
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)`,
        [
          bookingId,
          bookingRef,
          trimmedName,
          trimmedPhone,
          trimmedEmail,
          serviceId,
          serviceName,
          date,
          startTime,
          endTime,
          duration,
          price,
          googleCalendarEventId,
          trimmedNotes,
          now,
          now
        ]
      );

      // 8. Generate Google Calendar direct link & WhatsApp text for client convenience
      const addToGoogleCalendarUrl = this.generateGoogleCalendarWebUrl({
        customerName: trimmedName,
        serviceName,
        date,
        startTime,
        endTime,
        duration,
        price,
        notes: trimmedNotes,
        bookingRef
      });

      const whatsappUrl = this.generateWhatsAppUrl({
        customerName: trimmedName,
        serviceName,
        date,
        startTime,
        bookingRef
      });

      return {
        success: true,
        booking: {
          id: bookingId,
          bookingRef,
          customerName: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          serviceId,
          serviceName,
          date,
          startTime,
          endTime,
          duration,
          price,
          status: 'confirmed',
          notes: trimmedNotes,
          googleCalendarEventId,
          googleCalendarSyncMode: gcalResult?.mode || 'none',
          addToGoogleCalendarUrl,
          whatsappUrl,
          createdAt: now
        }
      };
    } finally {
      // Release lock
      bookingLocks.delete(lockKey);
    }
  }

  /**
   * Reschedules an existing appointment to a new date and time
   */
  async rescheduleBooking(bookingId, { newDate, newStartTime }) {
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      throw new Error('Appointment not found.');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Cannot reschedule a cancelled appointment.');
    }

    const duration = booking.duration;
    const newEndTime = calculateEndTime(newStartTime, duration);

    // Verify slot availability on the new date
    const availabilityCheck = await availabilityService.isSlotAvailable(newDate, newStartTime, duration);
    if (!availabilityCheck.available) {
      throw new Error(availabilityCheck.reason || 'Requested new time slot is unavailable.');
    }

    const now = new Date().toISOString();

    // Update Google Calendar event
    if (booking.googleCalendarEventId) {
      await googleCalendarService.updateEvent(booking.googleCalendarEventId, {
        customerName: booking.customerName,
        phone: booking.phone,
        serviceName: booking.serviceName,
        duration,
        price: booking.price,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        notes: booking.notes,
        bookingRef: booking.bookingRef
      });
    }

    // Update SQLite record
    await query.run(
      `UPDATE bookings 
       SET date = ?, startTime = ?, endTime = ?, status = 'rescheduled', updatedAt = ?
       WHERE id = ?`,
      [newDate, newStartTime, newEndTime, now, bookingId]
    );

    return {
      success: true,
      message: 'Appointment successfully rescheduled.',
      updatedBooking: {
        ...booking,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'rescheduled',
        updatedAt: now
      }
    };
  }

  /**
   * Cancels an appointment and removes or synchronizes with Google Calendar
   */
  async cancelBooking(bookingId, reason = 'Cancelled by administrator') {
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      throw new Error('Appointment not found.');
    }

    const now = new Date().toISOString();

    // Delete or update Google Calendar event
    if (booking.googleCalendarEventId) {
      await googleCalendarService.deleteEvent(booking.googleCalendarEventId);
    }

    await query.run(
      `UPDATE bookings 
       SET status = 'cancelled', updatedAt = ?, notes = notes || ? 
       WHERE id = ?`,
      [now, `\n[Cancelled on ${new Date().toLocaleDateString()}: ${reason}]`, bookingId]
    );

    return {
      success: true,
      message: 'Appointment successfully cancelled and removed from calendar.',
      bookingId
    };
  }

  /**
   * Marks an appointment as completed
   */
  async completeBooking(bookingId) {
    const now = new Date().toISOString();
    await query.run(
      `UPDATE bookings SET status = 'completed', updatedAt = ? WHERE id = ?`,
      [now, bookingId]
    );
    return { success: true, bookingId };
  }

  /**
   * Generates direct Google Calendar Web Link for client's own calendar
   */
  generateGoogleCalendarWebUrl({ customerName, serviceName, date, startTime, endTime, duration, price, notes, bookingRef }) {
    const title = `Mosphere Appointment - ${serviceName}`;
    const cleanDate = date.replace(/-/g, '');
    const cleanStart = startTime.replace(':', '');
    const cleanEnd = endTime.replace(':', '');
    const datesParam = `${cleanDate}T${cleanStart}00/${cleanDate}T${cleanEnd}00`;
    
    const details = [
      `Mosphere Luxury Appointment`,
      `Service: ${serviceName} (${duration} mins - ₹${price})`,
      `Customer: ${customerName}`,
      `Ref: ${bookingRef}`,
      notes ? `Notes: ${notes}` : null,
      `Location: ${config.salonName}, ${config.salonAddress}`,
      `Concierge: ${config.salonPhone}`
    ].filter(Boolean).join('\n');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${datesParam}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(config.salonAddress)}`;
  }

  /**
   * Generates direct WhatsApp Message link for instant customer service
   */
  generateWhatsAppUrl({ customerName, serviceName, date, startTime, bookingRef }) {
    const phone = config.salonWhatsApp.replace(/[^0-9]/g, '');
    const text = `Hello Mosphere, I have confirmed my booking for *${serviceName}* on *${date}* at *${startTime}* (Reference: *${bookingRef}*). Customer Name: *${customerName}*. Looking forward to my visit!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
}

export const bookingService = new BookingService();
