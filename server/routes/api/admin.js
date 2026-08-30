import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db/index.js';
import { requireAdminAuth } from '../../middleware/auth.js';
import { config } from '../../config.js';
import { googleCalendarService } from '../../services/googleCalendar.js';
import { bookingService } from '../../services/bookingService.js';
import { availabilityService } from '../../services/availabilityService.js';

const router = express.Router();

// POST /api/admin/login - Authenticate admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const user = await query.get('SELECT * FROM admin_users WHERE username = ?', [username.trim()]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/me - Verify current admin session
router.get('/me', requireAdminAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// GET /api/admin/stats - Overview metrics
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayBookings = await query.all(
      `SELECT COUNT(*) as count, SUM(price) as revenue FROM bookings WHERE date = ? AND status != 'cancelled'`,
      [today]
    );

    const upcomingBookings = await query.all(
      `SELECT COUNT(*) as count FROM bookings WHERE date >= ? AND status IN ('confirmed', 'rescheduled')`,
      [today]
    );

    const totalCompleted = await query.all(
      `SELECT COUNT(*) as count, SUM(price) as revenue FROM bookings WHERE status = 'completed'`
    );

    const totalActiveServices = await query.all(
      `SELECT COUNT(*) as count FROM services WHERE isActive = 1`
    );

    const statusBreakdown = await query.all(
      `SELECT status, COUNT(*) as count FROM bookings GROUP BY status`
    );

    res.json({
      success: true,
      stats: {
        todayCount: todayBookings[0]?.count || 0,
        todayRevenue: todayBookings[0]?.revenue || 0,
        upcomingCount: upcomingBookings[0]?.count || 0,
        completedCount: totalCompleted[0]?.count || 0,
        totalRevenue: totalCompleted[0]?.revenue || 0,
        activeServicesCount: totalActiveServices[0]?.count || 0,
        statusBreakdown: statusBreakdown.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {})
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/appointments - List bookings with filters
router.get('/appointments', requireAdminAuth, async (req, res) => {
  try {
    const { date, status, search, limit = 100, offset = 0 } = req.query;
    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (customerName LIKE ? OR phone LIKE ? OR bookingRef LIKE ? OR serviceName LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY date DESC, startTime DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const bookings = await query.all(sql, params);
    const totalCount = await query.all('SELECT COUNT(*) as count FROM bookings');

    res.json({
      success: true,
      bookings,
      total: totalCount[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/appointments - Manual walk-in / concierge booking
router.post('/appointments', requireAdminAuth, async (req, res) => {
  try {
    const { serviceId, date, startTime, customerName, phone, email, notes } = req.body;
    const result = await bookingService.createBooking({
      serviceId,
      date,
      startTime,
      customerName,
      phone,
      email,
      notes: notes ? `[Admin Walk-in] ${notes}` : '[Admin Walk-in]'
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/appointments/:id/reschedule - Reschedule appointment with Google Calendar sync
router.put('/appointments/:id/reschedule', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime } = req.body;

    if (!newDate || !newStartTime) {
      return res.status(400).json({ success: false, error: 'New date and new start time are required.' });
    }

    const result = await bookingService.rescheduleBooking(id, { newDate, newStartTime });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/appointments/:id/status - Update appointment status (e.g. completed)
router.put('/appointments/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    if (status === 'completed') {
      const result = await bookingService.completeBooking(id);
      return res.json(result);
    } else if (status === 'cancelled') {
      const result = await bookingService.cancelBooking(id, req.body.reason || 'Admin cancelled');
      return res.json(result);
    }

    const now = new Date().toISOString();
    await query.run('UPDATE bookings SET status = ?, updatedAt = ? WHERE id = ?', [status, now, id]);
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/appointments/:id - Cancel and remove from Google Calendar
router.delete('/appointments/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.query;
    const result = await bookingService.cancelBooking(id, reason || 'Cancelled by admin');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/settings - Retrieve salon settings & business hours
router.get('/settings', requireAdminAuth, async (req, res) => {
  try {
    const settings = await availabilityService.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/settings - Update business hours & salon settings
router.put('/settings', requireAdminAuth, async (req, res) => {
  try {
    const {
      openTime,
      closeTime,
      bufferMinutes,
      slotInterval,
      closedDays,
      blockedDates,
      maxAdvanceDays,
      salonName,
      salonPhone,
      salonWhatsApp,
      salonEmail,
      salonAddress
    } = req.body;

    const now = new Date().toISOString();
    const updates = {
      openTime,
      closeTime,
      bufferMinutes: bufferMinutes !== undefined ? String(bufferMinutes) : undefined,
      slotInterval: slotInterval !== undefined ? String(slotInterval) : undefined,
      closedDays: closedDays !== undefined ? JSON.stringify(closedDays) : undefined,
      blockedDates: blockedDates !== undefined ? JSON.stringify(blockedDates) : undefined,
      maxAdvanceDays: maxAdvanceDays !== undefined ? String(maxAdvanceDays) : undefined,
      salonName,
      salonPhone,
      salonWhatsApp,
      salonEmail,
      salonAddress
    };

    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) {
        await query.run(
          'INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)',
          [k, v, now]
        );
      }
    }

    const newSettings = await availabilityService.getSettings();
    res.json({ success: true, settings: newSettings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/calendar/status - Test and diagnose Google Calendar API connection live
router.get('/calendar/status', requireAdminAuth, async (req, res) => {
  try {
    const status = await googleCalendarService.testConnection();
    res.json({ success: true, diagnostic: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
