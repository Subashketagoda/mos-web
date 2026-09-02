import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { getGalleryFromFirestore } from '@/lib/firebaseService';

// GET /api/admin/gallery - All images
export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await initDatabase();
  } catch (e) {
    console.warn('DB init deferred in gallery GET:', e);
  }

  try {
    let localImages: any[] = [];
    try {
      localImages = await query.all('SELECT * FROM gallery ORDER BY sortOrder ASC, createdAt DESC');
    } catch (e) {
      console.warn('Local DB gallery query notice:', e);
    }

    let firestoreImages: any[] = [];
    try {
      firestoreImages = await getGalleryFromFirestore();
    } catch (e) {
      console.warn('Firestore gallery query notice:', e);
    }

    const map = new Map<string, any>();
    for (const img of localImages) {
      map.set(img.imageUrl || img.id, img);
    }
    for (const img of firestoreImages) {
      const key = img.imageUrl || img.id;
      map.set(key, { ...(map.get(key) || {}), ...img });
    }

    return NextResponse.json({ success: true, images: Array.from(map.values()) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/gallery - Add image
export async function POST(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await initDatabase();
  } catch (e) {
    console.warn('DB init deferred in gallery POST:', e);
  }

  try {
    const { imageUrl, title, category, aspectRatio, sortOrder, location } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Image URL is required.' }, { status: 400 });
    }

    const id = `gal-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();
    const photoLocation = location || 'colombo';

    try {
      await query.run(
        `INSERT INTO gallery (id, imageUrl, title, category, aspectRatio, location, active, sortOrder, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [id, imageUrl.trim(), title || '', category || 'Salon', aspectRatio || 'portrait', photoLocation, parseInt(sortOrder || 0, 10), now]
      );
    } catch (dbErr) {
      // Fallback if location column not yet in SQLite
      try {
        await query.run(
          `INSERT INTO gallery (id, imageUrl, title, category, aspectRatio, active, sortOrder, createdAt)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
          [id, imageUrl.trim(), title || '', category || 'Salon', aspectRatio || 'portrait', parseInt(sortOrder || 0, 10), now]
        );
      } catch (e) {}
    }

    // Dual-persist to Cloud Firestore
    try {
      const { addGalleryPhotoToFirestore } = await import('@/lib/firebaseService');
      await addGalleryPhotoToFirestore({
        imageUrl: imageUrl.trim(),
        title: title || 'Mosphere Hair Artistry',
        category: category || 'Hair Styling',
        aspectRatio: aspectRatio || 'portrait',
        location: photoLocation,
      });
    } catch (fsErr) {
      console.warn('Notice: Firestore sync in admin gallery POST:', fsErr);
    }

    return NextResponse.json({ success: true, image: { id, imageUrl, title, category, aspectRatio, location: photoLocation } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/gallery?id=...
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await initDatabase();
  } catch (e) {
    console.warn('DB init deferred in gallery DELETE:', e);
  }

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
