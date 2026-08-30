import { v4 as uuidv4 } from 'uuid';
import { query, initDatabase } from './db';
import { googleCalendarService } from './googleCalendar';
import { availabilityService } from './availabilityService';
import { salonConfig } from './config';

const bookingLocks = new Set<string>();

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function generateBookingReference(dateStr: string): string {
  const year = dateStr.split('-')[0] || '2026';
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `MOS-${year}-${randomSuffix}`;
}

export class BookingService {
  async createBooking({
    serviceId,
    date,
    startTime,
    customerName,
    phone,
    email = '',
    notes = '',
    location = 'colombo'
  }: {
    serviceId: string;
    date: string;
    startTime: string;
    customerName: string;
    phone: string;
    email?: string;
    notes?: string;
    location?: string;
  }) {
    await initDatabase();

    // 1. Validation
    if (!serviceId || !date || !startTime || !customerName || !phone) {
      throw new Error('All required fields (service, date, time, name, phone) must be provided.');
    }

    const trimmedName = customerName.trim();
    const trimmedPhone = phone.trim();
    const branchLabel = location.toLowerCase().includes('negombo') ? 'NEGOMBO' : 'COLOMBO / NAWALA';
    const trimmedNotes = `[${branchLabel}] ` + (notes || '').trim();
    const trimmedEmail = (email || '').trim();

    if (trimmedName.length < 2) {
      throw new Error('Please enter a valid customer name.');
    }

    if (trimmedPhone.length < 7) {
      throw new Error('Please enter a valid Sri Lankan contact number (e.g. 077 729 1629).');
    }

    // 2. Fetch service
    const service = await query.get('SELECT * FROM services WHERE id = ? AND active = 1', [serviceId]);
    if (!service) {
      throw new Error('The selected service is currently unavailable or inactive.');
    }

    const duration = service.duration;
    const price = service.price;
    const serviceName = service.name;
    const endTime = calculateEndTime(startTime, duration);

    // 3. Concurrency Lock
    const lockKey = `${date}_${startTime}`;
    if (bookingLocks.has(lockKey)) {
      throw new Error('This time slot is currently being reserved by another guest. Please choose another time.');
    }

    bookingLocks.add(lockKey);

    try {
      // 4. Atomic availability re-check
      const availabilityCheck = await availabilityService.isSlotAvailable(date, startTime, duration);
      if (!availabilityCheck.available) {
        throw new Error(availabilityCheck.reason || 'This slot was just booked. Please select another time.');
      }

      // 5. Generate Reference & ID
      const bookingId = uuidv4();
      const bookingRef = generateBookingReference(date);
      const now = new Date().toISOString();

      // 6. Create Google Calendar Event (Server-Side)
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

      // 7. Store in Database
      await query.run(
        `INSERT INTO bookings (
          id, bookingRef, customerName, phone, email,
          serviceId, serviceName, date, startTime, endTime,
          duration, price, status, notes, googleCalendarEventId,
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
          trimmedNotes,
          googleCalendarEventId,
          now,
          now
        ]
      );

      // 8. Update or Register Customer in directory
      const existingCustomer = await query.get('SELECT * FROM customers WHERE phone = ?', [trimmedPhone]);
      if (existingCustomer) {
        await query.run(
          `UPDATE customers SET totalBookings = totalBookings + 1, updatedAt = ? WHERE id = ?`,
          [now, existingCustomer.id]
        );
      } else {
        await query.run(
          `INSERT INTO customers (id, name, phone, email, totalBookings, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 1, ?, ?)`,
          [uuidv4(), trimmedName, trimmedPhone, trimmedEmail, now, now]
        );
      }

      // 9. Generate Customer Links
      const addToGoogleCalendarUrl = this.generateGoogleCalendarLink({
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
          addToGoogleCalendarUrl,
          whatsappUrl,
          createdAt: now
        }
      };
    } finally {
      bookingLocks.delete(lockKey);
    }
  }

  async rescheduleBooking(bookingId: string, { newDate, newStartTime }: { newDate: string; newStartTime: string }) {
    await initDatabase();
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) throw new Error('Appointment not found.');
    if (booking.status === 'cancelled') throw new Error('Cannot reschedule a cancelled appointment.');

    const duration = booking.duration;
    const newEndTime = calculateEndTime(newStartTime, duration);

    const check = await availabilityService.isSlotAvailable(newDate, newStartTime, duration);
    if (!check.available) {
      throw new Error(check.reason || 'Selected new time slot is unavailable.');
    }

    const now = new Date().toISOString();

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

    await query.run(
      `UPDATE bookings 
       SET date = ?, startTime = ?, endTime = ?, status = 'rescheduled', updatedAt = ?
       WHERE id = ?`,
      [newDate, newStartTime, newEndTime, now, bookingId]
    );

    return { success: true, message: 'Appointment successfully rescheduled.' };
  }

  async cancelBooking(bookingId: string, reason: string = 'Cancelled by concierge') {
    await initDatabase();
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) throw new Error('Appointment not found.');

    const now = new Date().toISOString();

    if (booking.googleCalendarEventId) {
      await googleCalendarService.deleteEvent(booking.googleCalendarEventId);
    }

    await query.run(
      `UPDATE bookings 
       SET status = 'cancelled', updatedAt = ?, notes = notes || ?
       WHERE id = ?`,
      [now, `\n[Cancelled on ${new Date().toLocaleDateString()}: ${reason}]`, bookingId]
    );

    return { success: true, message: 'Appointment cancelled and removed from Google Calendar.' };
  }

  async updateStatus(bookingId: string, status: string) {
    await initDatabase();
    const now = new Date().toISOString();
    await query.run(
      `UPDATE bookings SET status = ?, updatedAt = ? WHERE id = ?`,
      [status, now, bookingId]
    );
    return { success: true, status };
  }

  generateGoogleCalendarLink({
    serviceName,
    date,
    startTime,
    endTime,
    duration,
    price,
    notes,
    bookingRef
  }: any) {
    const title = `Mosphere — ${serviceName}`;
    const cleanDate = date.replace(/-/g, '');
    const cleanStart = startTime.replace(':', '');
    const cleanEnd = endTime.replace(':', '');
    const datesParam = `${cleanDate}T${cleanStart}00/${cleanDate}T${cleanEnd}00`;
    
    const details = [
      `Mosphere Salon Colombo`,
      `Service: ${serviceName} (${duration} min - LKR ${price})`,
      `Ref: ${bookingRef}`,
      notes ? `Notes: ${notes}` : null,
      `Address: ${salonConfig.address}`,
      `Phone: ${salonConfig.phone}`
    ].filter(Boolean).join('\n');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${datesParam}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(salonConfig.address)}`;
  }

  generateWhatsAppUrl({ customerName, serviceName, date, startTime, bookingRef }: any) {
    const text = `Hello Mosphere, I have confirmed my appointment for *${serviceName}* on *${date}* at *${startTime}* (Reference: *${bookingRef}*). Guest: *${customerName}*. Looking forward to my visit!`;
    return `https://wa.me/${salonConfig.whatsapp}?text=${encodeURIComponent(text)}`;
  }
}

export const bookingService = new BookingService();
