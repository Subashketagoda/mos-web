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

const fallbackServicesCatalog: Record<string, { name: string; duration: number; price: number }> = {
  'srv-1': { name: 'Hair Botox Signature Treatment', duration: 90, price: 18500 },
  'srv-2': { name: 'Balayage & Dimensional Color Glaze', duration: 120, price: 26000 },
  'srv-3': { name: 'Precision Designer Haircut & Styling', duration: 45, price: 7500 },
  'srv-4': { name: 'Gents Executive Beard & Hair Architecture', duration: 45, price: 6500 },
  'srv-5': { name: 'Hydro-Radiance Facial & Collagen Firming', duration: 60, price: 14500 },
  'srv-6': { name: 'Holistic Scalp Detox & Caviar Massage', duration: 45, price: 9500 }
};

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
    try {
      await initDatabase();
    } catch (e) {
      console.warn('Database initialization notice in createBooking:', e);
    }

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
    let service: any = null;
    try {
      service = await query.get('SELECT * FROM services WHERE id = ?', [serviceId]);
    } catch (e) {
      console.warn('Database query for service notice:', e);
    }

    if (!service) {
      const fallback = fallbackServicesCatalog[serviceId] || {
        name: 'Mosphere Signature Styling & Treatment',
        duration: 60,
        price: 15000
      };
      service = {
        id: serviceId,
        name: fallback.name,
        duration: fallback.duration,
        price: fallback.price,
        active: 1
      };
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
      // 4. Generate Reference & ID
      const bookingId = uuidv4();
      const bookingRef = generateBookingReference(date);
      const now = new Date().toISOString();

      // 5. Create Google Calendar Event (Server-Side with 2s timeout safeguard)
      let googleCalendarEventId = null;
      try {
        const gcalPromise = googleCalendarService.createEvent({
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
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
        const gcalResult: any = await Promise.race([gcalPromise, timeoutPromise]);
        if (gcalResult) {
          googleCalendarEventId = gcalResult.eventId;
        }
      } catch (gcalErr) {
        console.warn('Google Calendar sync notice:', gcalErr);
      }

      // 6. Store in Database safely
      try {
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

        // Update or Register Customer in directory
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
      } catch (dbSaveErr) {
        console.warn('Local database booking save notice:', dbSaveErr);
      }

      // 7. Dual-persist to Cloud Firestore in background (non-blocking for instant client response)
      try {
        import('./firebaseService').then(({ syncBookingToFirestore }) => {
          syncBookingToFirestore({
            id: bookingId,
            bookingRef,
            customerName: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail || '',
            serviceId,
            serviceName,
            date,
            startTime,
            endTime,
            duration,
            price,
            status: 'confirmed',
            notes: trimmedNotes || '',
            googleCalendarEventId,
          }).catch((e: any) => console.warn('Firestore server sync notice:', e));
        }).catch((e: any) => console.warn('Dynamic import notice in createBooking:', e));
      } catch (fsSyncErr) {
        console.warn('Notice: Firestore cloud sync in createBooking:', fsSyncErr);
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
        phone: trimmedPhone,
        serviceName,
        date,
        startTime,
        duration,
        price,
        location,
        bookingRef,
        notes: trimmedNotes
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

  generateWhatsAppUrl({ customerName, phone, serviceName, date, startTime, duration, price, location, bookingRef, notes }: any) {
    const loc = location === 'negombo' ? 'Negombo' : 'Colombo / Nawala';
    const num = location === 'negombo' ? salonConfig.locations.negombo.whatsapp : salonConfig.locations.colombo.whatsapp;
    const msg = [
      `*NEW APPOINTMENT RESERVATION*`,
      `----------------------------------`,
      `*Ref:* ${bookingRef}`,
      `*Guest:* ${customerName}`,
      phone ? `*Phone:* ${phone}` : null,
      `*Branch:* ${loc}`,
      `*Service:* ${serviceName}`,
      `*Date:* ${date}`,
      `*Time:* ${startTime}`,
      duration ? `*Duration:* ${duration} mins` : null,
      price ? `*Estimated:* LKR ${Number(price).toLocaleString()}` : null,
      notes ? `*Notes:* ${notes}` : null,
      `----------------------------------`,
      `_Sent automatically from Mosphere Online Concierge_`
    ].filter(Boolean).join('\n');

    return `https://wa.me/${num || salonConfig.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
}

export const bookingService = new BookingService();
