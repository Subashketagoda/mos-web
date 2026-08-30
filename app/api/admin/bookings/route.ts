import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { bookingService } from '@/lib/bookingService';

// GET /api/admin/bookings - List appointments with filters
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const serviceId = searchParams.get('serviceId');

  try {
    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params: any[] = [];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (serviceId) {
      sql += ' AND serviceId = ?';
      params.push(serviceId);
    }
    if (search) {
      sql += ' AND (customerName LIKE ? OR phone LIKE ? OR bookingRef LIKE ? OR serviceName LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY date DESC, startTime DESC';
    const bookings = await query.all(sql, params);

    return NextResponse.json({ success: true, bookings });
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
