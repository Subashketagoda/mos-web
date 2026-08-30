import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { bookingService } from '@/lib/bookingService';

// PUT /api/admin/bookings/[id] - Reschedule or update status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  try {
    const body = await req.json();
    const { action, newDate, newStartTime, status } = body;

    if (action === 'reschedule') {
      if (!newDate || !newStartTime) {
        return NextResponse.json(
          { success: false, error: 'New date and new start time are required for rescheduling.' },
          { status: 400 }
        );
      }
      const result = await bookingService.rescheduleBooking(id, { newDate, newStartTime });
      return NextResponse.json(result);
    } else if (status) {
      const allowed = ['pending', 'confirmed', 'completed', 'no-show', 'cancelled', 'rescheduled'];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status: ${status}` },
          { status: 400 }
        );
      }
      const result = await bookingService.updateStatus(id, status);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'No valid action or status provided.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// DELETE /api/admin/bookings/[id] - Cancel appointment & remove from Google Calendar
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reason = searchParams.get('reason') || 'Cancelled by concierge';

  try {
    const result = await bookingService.cancelBooking(id, reason);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
