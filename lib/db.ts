import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mosphere.db');
const sqlite = sqlite3.verbose();

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  } else {
    // Enable WAL mode for performance and concurrency
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA foreign_keys = ON;');
  }
});

// Type-safe Query Wrapper
export const query = {
  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  },
  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve((rows || []) as T[]);
      });
    });
  },
  run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

let isInitialized = false;

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;

  await query.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL DEFAULT 'Hair',
      active INTEGER NOT NULL DEFAULT 1,
      isActive INTEGER DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      bookingRef TEXT UNIQUE NOT NULL,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      serviceId TEXT NOT NULL,
      serviceName TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      googleCalendarEventId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      totalBookings INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_hours (
      id INTEGER PRIMARY KEY,
      day INTEGER UNIQUE NOT NULL,
      dayName TEXT NOT NULL,
      openingTime TEXT NOT NULL DEFAULT '10:00',
      closingTime TEXT NOT NULL DEFAULT '20:00',
      isClosed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS blocked_dates (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      reason TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      imageUrl TEXT NOT NULL,
      title TEXT,
      category TEXT DEFAULT 'Salon & Styling',
      aspectRatio TEXT DEFAULT 'portrait',
      active INTEGER DEFAULT 1,
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      authorName TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      source TEXT DEFAULT 'Google Review',
      active INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(bookingRef);
  `);

  // Safe migration for column names if table already existed
  try {
    const tableInfo = await query.all(`PRAGMA table_info(services);`);
    const colNames = tableInfo.map((c) => c.name);
    if (!colNames.includes('active')) {
      await query.run(`ALTER TABLE services ADD COLUMN active INTEGER DEFAULT 1;`);
      await query.run(`UPDATE services SET active = COALESCE(isActive, 1);`);
    }
  } catch (e) {
    // column already exists
  }

  // Seed default business hours (Monday to Sunday, 10:00 AM – 8:00 PM)
  const existingHours = await query.all('SELECT COUNT(*) as count FROM business_hours');
  if (existingHours[0].count === 0) {
    const days = [
      { day: 0, dayName: 'Sunday' },
      { day: 1, dayName: 'Monday' },
      { day: 2, dayName: 'Tuesday' },
      { day: 3, dayName: 'Wednesday' },
      { day: 4, dayName: 'Thursday' },
      { day: 5, dayName: 'Friday' },
      { day: 6, dayName: 'Saturday' }
    ];

    for (const d of days) {
      await query.run(
        `INSERT INTO business_hours (id, day, dayName, openingTime, closingTime, isClosed)
         VALUES (?, ?, ?, '10:00', '20:00', 0)`,
        [d.day + 1, d.day, d.dayName]
      );
    }
  }

  // Seed default services (Configurable placeholders for Colombo salon)
  const existingServices = await query.all('SELECT COUNT(*) as count FROM services');
  if (existingServices[0].count === 0) {
    const now = new Date().toISOString();
    const defaultServices = [
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

    for (const s of defaultServices) {
      await query.run(
        `INSERT OR REPLACE INTO services (id, name, description, duration, price, category, active, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [s.id, s.name, s.description, s.duration, s.price, s.category, s.sortOrder, now, now]
      );
    }
  }

  // Seed default gallery images (Editorial aesthetic placeholders)
  const existingGallery = await query.all('SELECT COUNT(*) as count FROM gallery');
  if (existingGallery[0].count === 0) {
    const now = new Date().toISOString();
    const defaultGallery = [
      {
        id: 'gal-1',
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
        title: 'Bespoke Hair Architecture',
        category: 'Hair',
        aspectRatio: 'portrait',
        sortOrder: 1
      },
      {
        id: 'gal-2',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        title: 'Mosphere Salon Interior & Styling Suite',
        category: 'Interior',
        aspectRatio: 'landscape',
        sortOrder: 2
      },
      {
        id: 'gal-3',
        imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
        title: 'Precision Styling & Wash Ritual',
        category: 'Styling',
        aspectRatio: 'square',
        sortOrder: 3
      },
      {
        id: 'gal-4',
        imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80',
        title: 'Luxury Formulations & Care',
        category: 'Products',
        aspectRatio: 'portrait',
        sortOrder: 4
      },
      {
        id: 'gal-5',
        imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',
        title: 'Editorial Glow & Tone Finish',
        category: 'Hair',
        aspectRatio: 'landscape',
        sortOrder: 5
      },
      {
        id: 'gal-6',
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
        title: 'Skincare & Hydration Lounge',
        category: 'Beauty',
        aspectRatio: 'portrait',
        sortOrder: 6
      }
    ];

    for (const g of defaultGallery) {
      await query.run(
        `INSERT INTO gallery (id, imageUrl, title, category, aspectRatio, active, sortOrder, createdAt)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [g.id, g.imageUrl, g.title, g.category, g.aspectRatio, g.sortOrder, now]
      );
    }
  }

  // Seed default reviews (Google Reviews 4.7★)
  const existingReviews = await query.all('SELECT COUNT(*) as count FROM reviews');
  if (existingReviews[0].count === 0) {
    const now = new Date().toISOString();
    const defaultReviews = [
      {
        id: 'rev-1',
        authorName: 'Dinuka Senanayake',
        rating: 5,
        comment: 'Without doubt the most refined salon experience in Colombo. The attention to detail, scalp massage ritual, and bespoke hair architecture are unmatched.',
        source: 'Google Review'
      },
      {
        id: 'rev-2',
        authorName: 'Anuki Perera',
        rating: 5,
        comment: 'Found my holy grail salon on Nawala Road. Gorgeous aesthetics, calm private suites, and my balayage turned out so smooth and glossy!',
        source: 'Google Review'
      },
      {
        id: 'rev-3',
        authorName: 'Tharindu Wickrama',
        rating: 5,
        comment: 'Seamless online calendar booking with instant confirmation. Master stylist was attentive and delivered exactly what I asked for.',
        source: 'Google Review'
      }
    ];

    for (const r of defaultReviews) {
      await query.run(
        `INSERT INTO reviews (id, authorName, rating, comment, source, active, createdAt)
         VALUES (?, ?, ?, ?, ?, 1, ?)`,
        [r.id, r.authorName, r.rating, r.comment, r.source, now]
      );
    }
  }

  // Seed default admin account (admin / adminPassword123)
  const existingAdmins = await query.all('SELECT COUNT(*) as count FROM admin_users');
  if (existingAdmins[0].count === 0) {
    const now = new Date().toISOString();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('adminPassword123', salt);
    await query.run(
      `INSERT INTO admin_users (id, username, passwordHash, name, role, createdAt)
       VALUES (?, 'admin', ?, 'Mosphere Concierge Lead', 'superadmin', ?)`,
      [uuidv4(), passwordHash, now]
    );
  }

  isInitialized = true;
}
