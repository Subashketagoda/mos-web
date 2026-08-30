import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/admin/blocked-dates
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  try {
    const blockedDates = await query.all('SELECT * FROM blocked_dates ORDER BY date ASC');
    return NextResponse.json({ success: true, blockedDates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/blocked-dates - Add blocked date or time range
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  try {
    const { date, startTime, endTime, reason } = await req.json();
    if (!date) {
      return NextResponse.json({ success: false, error: 'Date (YYYY-MM-DD) is required.' }, { status: 400 });
    }

    const id = `blk-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    await query.run(
      `INSERT INTO blocked_dates (id, date, startTime, endTime, reason, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, date, startTime || null, endTime || null, reason || 'Private Event / Unavailable', now]
    );

    const created = await query.get('SELECT * FROM blocked_dates WHERE id = ?', [id]);
    return NextResponse.json({ success: true, blockedDate: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/blocked-dates?id=...
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID parameter required.' }, { status: 400 });
  }

  try {
    await query.run('DELETE FROM blocked_dates WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Blocked date removed.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
