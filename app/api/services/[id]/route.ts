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
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Service not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, duration, price, category, active, sortOrder } = body;
    const now = new Date().toISOString();

    await query.run(
      `UPDATE services 
       SET name = ?, description = ?, duration = ?, price = ?, category = ?, active = ?, sortOrder = ?, updatedAt = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        description !== undefined ? description.trim() : existing.description,
        duration !== undefined ? parseInt(duration, 10) : existing.duration,
        price !== undefined ? parseFloat(price) : existing.price,
        category !== undefined ? category : existing.category,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        sortOrder !== undefined ? parseInt(sortOrder, 10) : existing.sortOrder,
        now,
        id
      ]
    );

    const updated = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    return NextResponse.json({ success: true, service: updated });
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
    const result = await query.run('DELETE FROM services WHERE id = ?', [id]);
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Service not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Service deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
