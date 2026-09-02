import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';

// PUT /api/services/[id] - Admin edit service
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  await initDatabase();

  try {
    const existing = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    const body = await req.json();
    const { name, description, duration, price, category, active, isActive, sortOrder } = body;
    const now = new Date().toISOString();

    const updatedName = name !== undefined ? name.trim() : (existing?.name || 'Service');
    const updatedDesc = description !== undefined ? description.trim() : (existing?.description || '');
    const updatedDuration = duration !== undefined ? parseInt(duration, 10) : (existing?.duration || 60);
    const updatedPrice = price !== undefined ? parseFloat(price) : (existing?.price || 0);
    const updatedCat = category !== undefined ? category : (existing?.category || 'Hair');
    const updatedActive = active !== undefined ? (active ? 1 : 0) : (isActive !== undefined ? (isActive ? 1 : 0) : (existing?.active ?? 1));
    const updatedSort = sortOrder !== undefined ? parseInt(sortOrder, 10) : (existing?.sortOrder || 0);

    // 1. Dual-persist to SQLite (UPSERT)
    await query.run(
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
      [
        id,
        updatedName,
        updatedDesc,
        updatedDuration,
        updatedPrice,
        updatedCat,
        updatedActive,
        updatedActive,
        updatedSort,
        existing?.createdAt || now,
        now
      ]
    );

    // 2. Dual-persist to Cloud Firestore
    try {
      const { saveServiceToFirestore } = await import('@/lib/firebaseService');
      await saveServiceToFirestore({
        id,
        name: updatedName,
        description: updatedDesc,
        duration: updatedDuration,
        price: updatedPrice,
        category: updatedCat,
        active: Boolean(updatedActive),
        sortOrder: updatedSort,
        updatedAt: now,
      });
    } catch (fsErr) {
      console.warn('Notice: Firestore sync in PUT /api/services/[id]:', fsErr);
    }

    const updated = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    return NextResponse.json(
      {
        success: true,
        service: updated || {
          id,
          name: updatedName,
          duration: updatedDuration,
          price: updatedPrice,
          category: updatedCat,
          active: updatedActive,
          updatedAt: now,
        }
      },
      {
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/services/[id] - Admin delete service
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  await initDatabase();

  try {
    await query.run('DELETE FROM services WHERE id = ?', [id]);

    // Dual-delete from Cloud Firestore
    try {
      const { deleteServiceFromFirestore } = await import('@/lib/firebaseService');
      await deleteServiceFromFirestore(id);
    } catch (fsErr) {
      console.warn('Notice: Firestore delete in /api/services/[id]:', fsErr);
    }

    return NextResponse.json(
      { success: true, message: 'Service deleted.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
