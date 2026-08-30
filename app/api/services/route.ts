import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/services - Public active services or admin all services
export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('all') === 'true';

    const sql = includeInactive
      ? 'SELECT * FROM services ORDER BY sortOrder ASC, name ASC'
      : 'SELECT * FROM services WHERE COALESCE(active, isActive, 1) = 1 ORDER BY sortOrder ASC, name ASC';

    const services = await query.all(sql);
    return NextResponse.json({ success: true, services });
  } catch (err: any) {
    console.error('Error fetching services:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/services - Admin add service
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await initDatabase();
    const body = await req.json();
    const { name, description, duration, price, category, sortOrder } = body;

    if (!name || !duration || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, duration (mins), and price (LKR) are required.' },
        { status: 400 }
      );
    }

    const id = `srv-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    await query.run(
      `INSERT INTO services (id, name, description, duration, price, category, active, isActive, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [id, name.trim(), (description || '').trim(), parseInt(duration, 10), parseFloat(price), category || 'Hair', parseInt(sortOrder || 0, 10), now, now]
    );

    const created = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    return NextResponse.json({ success: true, service: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
