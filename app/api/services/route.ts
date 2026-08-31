import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const defaultFallbackServices = [
  {
    id: 'srv-1',
    name: 'Hair Botox Signature Treatment',
    description: 'Deep restorative protein infusion with hyaluronic acid and caviar extract for luminous, frizz-free glass hair.',
    duration: 90,
    price: 18500,
    category: 'Hair Botox'
  },
  {
    id: 'srv-2',
    name: 'Balayage & Dimensional Color Glaze',
    description: 'Custom hand-painted French balayage with high-gloss toning glaze and bond protection.',
    duration: 120,
    price: 26000,
    category: 'Hair Coloring'
  },
  {
    id: 'srv-3',
    name: 'Precision Designer Haircut & Styling',
    description: 'Tailored architectural haircut, scalp shampoo, hot towel massage, and luxury blowout styling.',
    duration: 45,
    price: 7500,
    category: 'Hair Design'
  },
  {
    id: 'srv-4',
    name: 'Gents Executive Beard & Hair Architecture',
    description: 'Master razor fade, precision beard sculpting, botanical steam therapy, and charcoal face mask.',
    duration: 45,
    price: 6500,
    category: 'Gents Grooming'
  },
  {
    id: 'srv-5',
    name: 'Hydro-Radiance Facial & Collagen Firming',
    description: 'Advanced ultrasonic exfoliation, marine collagen infusion, and lymphatic drainage massage.',
    duration: 60,
    price: 14500,
    category: 'Aesthetic Wellness'
  },
  {
    id: 'srv-6',
    name: 'Holistic Scalp Detox & Caviar Massage',
    description: 'Deep follicle detoxifying exfoliation, warm Ayurvedic herb oil massage, and infrared scalp stimulation.',
    duration: 45,
    price: 9500,
    category: 'Scalp Sanctuary'
  }
];

// GET /api/services - Public active services or admin all services
export async function GET(req: NextRequest) {
  try {
    try {
      await initDatabase();
    } catch (e) {
      console.warn('Database init notice in /api/services:', e);
    }
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('all') === 'true';

    const sql = includeInactive
      ? 'SELECT * FROM services ORDER BY sortOrder ASC, name ASC'
      : 'SELECT * FROM services WHERE COALESCE(active, isActive, 1) = 1 ORDER BY sortOrder ASC, name ASC';

    let services = await query.all(sql);
    if (!services || services.length === 0) {
      services = defaultFallbackServices;
    }
    return NextResponse.json({ success: true, services });
  } catch (err: any) {
    console.error('Notice in services route, returning fallback catalog:', err);
    return NextResponse.json({ success: true, services: defaultFallbackServices });
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
