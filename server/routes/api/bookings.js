import express from 'express';
import { query } from '../../db/index.js';
import { availabilityService } from '../../services/availabilityService.js';
import { bookingService } from '../../services/bookingService.js';

const router = express.Router();

// GET /api/availability - Get available slots for a given date and service
router.get('/availability', async (req, res) => {
  try {
    const { date, serviceId, duration } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Query parameter "date" (YYYY-MM-DD) is required.' });
    }

    let serviceDuration = 45;
    if (duration) {
      serviceDuration = parseInt(duration, 10);
    } else if (serviceId) {
      const service = await query.get('SELECT duration FROM services WHERE id = ?', [serviceId]);
      if (service) {
        serviceDuration = service.duration;
      }
    }

    const availability = await availabilityService.getAvailableSlots({
      dateStr: date,
      serviceDuration
    });

    res.json({ success: true, ...availability });
  } catch (err) {
    console.error('❌ Error getting availability:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings - Create new appointment booking
router.post('/bookings', async (req, res) => {
  try {
    const { serviceId, date, startTime, customerName, phone, email, notes } = req.body;

    if (!serviceId || !date || !startTime || !customerName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required booking fields: serviceId, date, startTime, customerName, and phone are required.'
      });
    }

    const result = await bookingService.createBooking({
      serviceId,
      date,
      startTime,
      customerName,
      phone,
      email,
      notes
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Booking creation error:', err.message);
    const isConflict = err.message.includes('unavailable') || 
                       err.message.includes('conflicts') || 
                       err.message.includes('processed by another customer');
    
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: err.message
    });
  }
});

// GET /api/bookings/ref/:bookingRef - Retrieve booking details by reference code
router.get('/bookings/ref/:bookingRef', async (req, res) => {
  try {
    const { bookingRef } = req.params;
    const booking = await query.get(
      `SELECT id, bookingRef, customerName, phone, email, serviceName, date, startTime, endTime, duration, price, status, notes, createdAt
       FROM bookings 
       WHERE bookingRef = ?`,
      [bookingRef]
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reference not found.' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
