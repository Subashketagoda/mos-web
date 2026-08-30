import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/bookingService';

// POST /api/bookings - Customer confirms booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, date, startTime, customerName, phone, email, notes, location } = body;

    if (!serviceId || !date || !startTime || !customerName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields: service, date, time, name, and phone are mandatory.' },
        { status: 400 }
      );
    }

    const result = await bookingService.createBooking({
      serviceId,
      date,
      startTime,
      customerName,
      phone,
      email,
      notes,
      location: location || 'colombo'
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    const isConflict = err.message.includes('unavailable') ||
                       err.message.includes('occupied') ||
                       err.message.includes('conflicts') ||
                       err.message.includes('reserved by another') ||
                       err.message.includes('just booked');

    return NextResponse.json(
      { success: false, error: err.message },
      { status: isConflict ? 409 : 400 }
    );
  }
}
