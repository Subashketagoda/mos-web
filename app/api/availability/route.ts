import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { availabilityService } from '@/lib/availabilityService';

// GET /api/availability?date=YYYY-MM-DD&serviceId=...&duration=...
export async function GET(req: NextRequest) {
  await initDatabase();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  const durationParam = searchParams.get('duration');

  if (!date) {
    return NextResponse.json(
      { success: false, error: 'Query parameter "date" (YYYY-MM-DD) is required.' },
      { status: 400 }
    );
  }

  try {
    let serviceDuration = 60;
    if (durationParam) {
      serviceDuration = parseInt(durationParam, 10);
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

    return NextResponse.json({ success: true, ...availability });
  } catch (err: any) {
    console.error('Error fetching availability:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
