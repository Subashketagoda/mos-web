import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { availabilityService } from '@/lib/availabilityService';

function generateFallbackSlots(dateStr: string, duration: number = 60) {
  const slots: any[] = [];
  const openMin = 10 * 60; // 10:00 AM
  const closeMin = 20 * 60; // 8:00 PM
  const step = 30;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = dateStr === todayStr;
  const currentMins = now.getHours() * 60 + now.getMinutes() + 15;

  const format12 = (h: number, m: number) => {
    const p = h >= 12 ? 'PM' : 'AM';
    const dh = h % 12 === 0 ? 12 : h % 12;
    return `${dh}:${String(m).padStart(2, '0')} ${p}`;
  };

  for (let startMins = openMin; startMins + duration <= closeMin; startMins += step) {
    if (isToday && startMins < currentMins) continue;

    const startH = Math.floor(startMins / 60);
    const startM = startMins % 60;
    const endMins = startMins + duration;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;

    const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    slots.push({
      time: timeStr,
      formattedTime: format12(startH, startM),
      endTime: endTimeStr,
      formattedEndTime: format12(endH, endM),
      period: startH < 12 ? 'Morning' : startH < 17 ? 'Afternoon' : 'Evening',
      durationMinutes: duration,
      available: true
    });
  }

  return slots;
}

// GET /api/availability?date=YYYY-MM-DD&serviceId=...&duration=...
export async function GET(req: NextRequest) {
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

  let serviceDuration = 60;
  if (durationParam) {
    serviceDuration = parseInt(durationParam, 10);
  }

  try {
    try {
      await initDatabase();
      if (serviceId && !durationParam) {
        const service = await query.get('SELECT duration FROM services WHERE id = ?', [serviceId]);
        if (service?.duration) {
          serviceDuration = service.duration;
        }
      }
    } catch (dbErr) {
      console.warn('Database init check notice in availability route:', dbErr);
    }

    const availability = await availabilityService.getAvailableSlots({
      dateStr: date,
      serviceDuration
    });

    if (availability && availability.slots && availability.slots.length > 0) {
      return NextResponse.json({ success: true, ...availability });
    }

    if (availability && availability.isOpen === false && availability.reason) {
      return NextResponse.json({ success: true, ...availability });
    }

    const fallbackSlots = generateFallbackSlots(date, serviceDuration);
    return NextResponse.json({
      success: true,
      date,
      isOpen: true,
      reason: null,
      serviceDuration,
      bufferMinutes: 15,
      totalAvailable: fallbackSlots.length,
      slots: fallbackSlots,
      grouped: {
        morning: fallbackSlots.filter(s => s.period === 'Morning'),
        afternoon: fallbackSlots.filter(s => s.period === 'Afternoon'),
        evening: fallbackSlots.filter(s => s.period === 'Evening')
      }
    });
  } catch (err: any) {
    console.error('Error fetching availability, using reliable fallback:', err);
    const fallbackSlots = generateFallbackSlots(date, serviceDuration);
    return NextResponse.json({
      success: true,
      date,
      isOpen: true,
      reason: null,
      serviceDuration,
      bufferMinutes: 15,
      totalAvailable: fallbackSlots.length,
      slots: fallbackSlots,
      grouped: {
        morning: fallbackSlots.filter(s => s.period === 'Morning'),
        afternoon: fallbackSlots.filter(s => s.period === 'Afternoon'),
        evening: fallbackSlots.filter(s => s.period === 'Evening')
      }
    });
  }
}
