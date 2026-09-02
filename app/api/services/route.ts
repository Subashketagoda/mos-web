import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const defaultFallbackServices = [
  {
    id: 'srv-hair-botox',
    name: 'Hair Botox Deep Hydration & Repair Treatment',
    description: 'Signature Mosphere restorative treatment. Infuses amino acids, collagen, and caviar oil to eliminate frizz, restore deep moisture, and provide radiant glass-shine.',
    duration: 90,
    price: 14500,
    category: 'Hair Botox & Keratin',
    sortOrder: 1
  },
  {
    id: 'srv-keratin-silk',
    name: 'Keratin Silk Protein Smoothing Therapy',
    description: 'Long-lasting structural smoothing therapy that seals the hair cuticle, tames humidity curls, and leaves hair mirror-smooth and manageable.',
    duration: 120,
    price: 18500,
    category: 'Hair Botox & Keratin',
    sortOrder: 2
  },
  {
    id: 'srv-gents-cut-beard',
    name: 'Gents Master Cut & Beard Architecture',
    description: 'Precision fade or taper cut tailored to facial structure, hot towel steam prep, precision razor edge-up, and beard oil conditioning finish.',
    duration: 45,
    price: 3500,
    category: 'Gents Grooming',
    sortOrder: 3
  },
  {
    id: 'srv-ladies-couture-cut',
    name: 'Ladies Couture Cut & Signature Blowout',
    description: 'Bespoke precision layering, face-framing texture, scalp massage wash, and editorial blowout finish for voluminous radiance.',
    duration: 60,
    price: 4500,
    category: 'Ladies Hair & Styling',
    sortOrder: 4
  },
  {
    id: 'srv-color-balayage',
    name: 'Dimensional Balayage & Gloss Tone Melt',
    description: 'Seamless hand-painted highlights, custom blonde/caramel balayage, and restorative gloss glaze for luminous depth.',
    duration: 120,
    price: 15500,
    category: 'Color & Balayage',
    sortOrder: 5
  },
  {
    id: 'srv-beard-sculpt',
    name: 'Beard Sculpture & Hot Towel Shave Ritual',
    description: 'Sculpted beard grooming with botanical oil infusion, traditional hot and cold towel compress, and soothing aftershave balm.',
    duration: 30,
    price: 2200,
    category: 'Gents Grooming',
    sortOrder: 6
  },
  {
    id: 'srv-scalp-detox',
    name: 'Deep Scalp Detox & High-Frequency Therapy',
    description: 'Holistic scalp purification, ozone root stimulation, essential oil infusion, and relaxing acupressure massage for hair growth.',
    duration: 45,
    price: 5500,
    category: 'Skin & Spa',
    sortOrder: 7
  },
  {
    id: 'srv-glow-facial',
    name: 'Hydro-Radiance Deep Cleanse Facial',
    description: 'Enzymatic exfoliation, blackhead extraction, antioxidant serum infusion, and chilled jade stone lymphatic drainage for glowing skin.',
    duration: 60,
    price: 7500,
    category: 'Skin & Spa',
    sortOrder: 8
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

    // 1. Dual-read from Cloud Firestore first (ensures persistence across Vercel lambdas)
    let services: any[] = [];
    try {
      const { getServicesFromFirestore } = await import('@/lib/firebaseService');
      const fsServices = await getServicesFromFirestore();
      if (fsServices && fsServices.length > 0) {
        services = fsServices;
        // Background sync to SQLite
        for (const s of fsServices) {
          query.run(
            `INSERT INTO services (id, name, description, duration, price, category, active, isActive, sortOrder, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               name = excluded.name,
               description = excluded.description,
               duration = excluded.duration,
               price = excluded.price,
               category = excluded.category,
               active = excluded.active,
               isActive = excluded.isActive,
               sortOrder = excluded.sortOrder,
               updatedAt = excluded.updatedAt`,
            [s.id, s.name, s.description || '', s.duration, s.price, s.category || 'Hair', s.active !== false ? 1 : 0, s.active !== false ? 1 : 0, s.sortOrder || 0, new Date().toISOString(), new Date().toISOString()]
          ).catch(() => {});
        }
      }
    } catch (fsErr) {
      console.warn('Firestore fetch notice in /api/services:', fsErr);
    }

    // 2. If Firestore was empty or failed, fetch from SQLite
    if (!services || services.length === 0) {
      const sql = includeInactive
        ? 'SELECT * FROM services ORDER BY sortOrder ASC, name ASC'
        : 'SELECT * FROM services WHERE COALESCE(active, isActive, 1) = 1 ORDER BY sortOrder ASC, name ASC';
      services = await query.all(sql);
    }

    // 3. Fallback to default catalog
    if (!services || services.length === 0) {
      services = defaultFallbackServices;
    }

    if (!includeInactive) {
      services = services.filter((s: any) => s.active !== false && s.active !== 0 && s.isActive !== 0);
    }

    return NextResponse.json(
      { success: true, services },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (err: any) {
    console.error('Notice in services route, returning fallback catalog:', err);
    return NextResponse.json(
      { success: true, services: defaultFallbackServices },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        }
      }
    );
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
    const numDuration = parseInt(duration, 10);
    const numPrice = parseFloat(price);
    const cat = category || 'Hair';
    const sort = parseInt(sortOrder || 0, 10);
    const desc = (description || '').trim();

    // 1. Dual-write to SQLite
    await query.run(
      `INSERT INTO services (id, name, description, duration, price, category, active, isActive, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [id, name.trim(), desc, numDuration, numPrice, cat, sort, now, now]
    );

    // 2. Dual-write to Cloud Firestore
    try {
      const { saveServiceToFirestore } = await import('@/lib/firebaseService');
      await saveServiceToFirestore({
        id,
        name: name.trim(),
        description: desc,
        duration: numDuration,
        price: numPrice,
        category: cat,
        active: true,
        sortOrder: sort,
        updatedAt: now,
      });
    } catch (fsErr) {
      console.warn('Notice: Firestore sync in POST /api/services:', fsErr);
    }

    const created = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    return NextResponse.json(
      { success: true, service: created || { id, name, price: numPrice, duration: numDuration } },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
