import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/admin/gallery - All images
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  try {
    const images = await query.all('SELECT * FROM gallery ORDER BY sortOrder ASC, createdAt DESC');
    return NextResponse.json({ success: true, images });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/gallery - Add image
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  try {
    const { imageUrl, title, category, aspectRatio, sortOrder } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Image URL is required.' }, { status: 400 });
    }

    const id = `gal-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    await query.run(
      `INSERT INTO gallery (id, imageUrl, title, category, aspectRatio, active, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, imageUrl.trim(), title || '', category || 'Salon', aspectRatio || 'portrait', parseInt(sortOrder || 0, 10), now]
    );

    const created = await query.get('SELECT * FROM gallery WHERE id = ?', [id]);
    return NextResponse.json({ success: true, image: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/gallery?id=...
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
    await query.run('DELETE FROM gallery WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Image deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
