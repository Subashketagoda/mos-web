import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';

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
