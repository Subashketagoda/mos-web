import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET /api/gallery - Public active gallery images
export async function GET() {
  await initDatabase();
  try {
    const images = await query.all('SELECT * FROM gallery WHERE active = 1 ORDER BY sortOrder ASC, createdAt DESC');
    return NextResponse.json({ success: true, images });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/gallery - Add new photo to gallery
export async function POST(req: Request) {
  await initDatabase();
  try {
    const body = await req.json();
    const { imageUrl, title, category, aspectRatio } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const photoId = 'gal-' + uuidv4().slice(0, 8);
    const now = new Date().toISOString();

    await query.run(
      `INSERT INTO gallery (id, imageUrl, title, category, aspectRatio, active, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?)`,
      [
        photoId,
        imageUrl.trim(),
        title?.trim() || 'Mosphere Hair Artistry',
        category?.trim() || 'Haute Styling',
        aspectRatio || 'portrait',
        now
      ]
    );

    const newPhoto = await query.get('SELECT * FROM gallery WHERE id = ?', [photoId]);

    return NextResponse.json({
      success: true,
      message: 'Photo added to gallery successfully',
      photo: newPhoto
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
