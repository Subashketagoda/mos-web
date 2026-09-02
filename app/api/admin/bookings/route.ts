import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { bookingService } from '@/lib/bookingService';
import { getBookingsFromFirestore } from '@/lib/firebaseService';

// GET /api/admin/bookings - List appointments with filters
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await initDatabase();
  } catch (e) {
    console.warn('Notice: DB init deferred in admin bookings GET:', e);
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const serviceId = searchParams.get('serviceId');

  try {
    let localBookings: any[] = [];
    try {
      let sql = 'SELECT * FROM bookings WHERE 1=1';
      const params: any[] = [];
      sql += ' ORDER BY date DESC, startTime DESC';
      localBookings = await query.all(sql, params);
    } catch (dbErr) {
      console.warn('Local DB query notice:', dbErr);
    }

    let firestoreBookings: any[] = [];
    try {
      firestoreBookings = await getBookingsFromFirestore();
    } catch (fsErr) {
      console.warn('Firestore query notice in admin bookings:', fsErr);
    }

    // Merge without duplicates (keyed by bookingRef or id)
    const map = new Map<string, any>();
    for (const b of localBookings) {
      const key = b.bookingRef || b.id;
      if (key) map.set(key, b);
    }
    for (const b of firestoreBookings) {
      const key = b.bookingRef || b.id;
      if (key) {
        // Firestore takes precedence for real-time status or adds missing items
        map.set(key, { ...(map.get(key) || {}), ...b });
      }
    }

    let allBookings = Array.from(map.values());

    // Apply filters
    if (date) {
      allBookings = allBookings.filter((b) => b.date === date);
    }
    if (status && status !== 'all') {
      allBookings = allBookings.filter((b) => b.status === status);
    }
    if (serviceId) {
      allBookings = allBookings.filter((b) => b.serviceId === serviceId);
    }
    if (search) {
      const lower = search.toLowerCase();
      allBookings = allBookings.filter((b) =>
        (b.customerName && b.customerName.toLowerCase().includes(lower)) ||
        (b.phone && b.phone.includes(lower)) ||
        (b.bookingRef && b.bookingRef.toLowerCase().includes(lower)) ||
        (b.serviceName && b.serviceName.toLowerCase().includes(lower))
      );
    }

    // Sort by date DESC, startTime DESC
    allBookings.sort((a, b) => {
      const cmp = (b.date || '').localeCompare(a.date || '');
      if (cmp !== 0) return cmp;
      return (b.startTime || '').localeCompare(a.startTime || '');
    });

    return NextResponse.json({ success: true, bookings: allBookings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/bookings - Manual walk-in / phone reservation
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { serviceId, date, startTime, customerName, phone, email, notes } = body;

    const result = await bookingService.createBooking({
      serviceId,
      date,
      startTime,
      customerName,
      phone,
      email,
      notes: notes ? `[Admin Walk-in] ${notes}` : '[Admin Walk-in]'
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
