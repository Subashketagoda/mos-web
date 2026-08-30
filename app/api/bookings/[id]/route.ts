import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';

// GET /api/bookings/[id] - Lookup by bookingId or bookingRef
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await initDatabase();

  try {
    const booking = await query.get(
      `SELECT id, bookingRef, customerName, phone, email, serviceName, date, startTime, endTime, duration, price, status, notes, createdAt
       FROM bookings
       WHERE id = ? OR bookingRef = ?`,
      [id, id]
    );

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
