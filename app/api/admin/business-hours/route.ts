import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';

// GET /api/admin/business-hours
export async function GET(req: NextRequest) {
  await initDatabase();
  try {
    const hours = await query.all('SELECT * FROM business_hours ORDER BY day ASC');
    return NextResponse.json({ success: true, hours });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/business-hours - Update hours
export async function PUT(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  try {
    const { hours } = await req.json();
    if (!Array.isArray(hours)) {
      return NextResponse.json({ success: false, error: 'Hours array expected.' }, { status: 400 });
    }

    for (const h of hours) {
      await query.run(
        `UPDATE business_hours 
         SET openingTime = ?, closingTime = ?, isClosed = ? 
         WHERE day = ?`,
        [h.openingTime || '10:00', h.closingTime || '20:00', h.isClosed ? 1 : 0, h.day]
      );
    }

    const updated = await query.all('SELECT * FROM business_hours ORDER BY day ASC');
    return NextResponse.json({ success: true, hours: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
