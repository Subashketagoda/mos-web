import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mosphere.db');

// SQLite connection
const sqlite = sqlite3.verbose();
export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Helper for Promisified Queries
export const query = {
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize schema and seed data
export async function initDatabase() {
  await query.run('PRAGMA foreign_keys = ON');

  // Create tables
  await query.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'Hair & Grooming',
      isActive INTEGER DEFAULT 1,
      sortOrder INTEGER DEFAULT 0,
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
      googleCalendarEventId TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
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

  // Seed default services if none exist
  const existingServices = await query.all('SELECT COUNT(*) as count FROM services');
  if (existingServices[0].count === 0) {
    console.log('🌱 Seeding initial Mosphere luxury services (configurable placeholders)...');
    const now = new Date().toISOString();
    const defaultServices = [
      {
        id: 'srv-signature-sculpt',
        name: 'Signature Hair Sculpting & Styling',
        duration: 45,
        price: 1500,
        description: 'Bespoke precision haircut tailored to facial architecture, completed with an organic wash, conditioning scalp massage, and luxury styling finish.',
        category: 'Hair Architecture',
        sortOrder: 1
      },
      {
        id: 'srv-beard-ritual',
        name: 'Beard Architecture & Hot Towel Ritual',
        duration: 30,
        price: 950,
        description: 'Sculpted beard grooming with botanical oil infusion, traditional hot and cold towel compress, precision razor line-up, and nourishing balm treatment.',
        category: 'Grooming & Shave',
        sortOrder: 2
      },
      {
        id: 'srv-executive-ritual',
        name: 'The Mosphere Royal Executive Ritual',
        duration: 75,
        price: 2800,
        description: 'Our pinnacle full-grooming experience: Master Haircut, Hot Towel Beard Sculpture, Deep Scalp Detox, and Stress-Relief Facial Massage.',
        category: 'Signature Experiences',
        sortOrder: 3
      },
      {
        id: 'srv-scalp-therapy',
        name: 'Scalp Revitalization & Detox Treatment',
        duration: 40,
        price: 1800,
        description: 'Exfoliating botanical scalp cleanse, high-frequency ozone therapy, nutrient serum infusion, and acupressure head massage for root rejuvenation.',
        category: 'Therapeutic Treatments',
        sortOrder: 4
      },
      {
        id: 'srv-color-tone',
        name: 'Master Color, Blend & Tone',
        duration: 60,
        price: 2400,
        description: 'Subtle gray blending, natural tone enhancement, or statement bespoke coloration using ammonia-free Italian organic pigments.',
        category: 'Color & Texture',
        sortOrder: 5
      },
      {
        id: 'srv-deep-facial',
        name: 'Hydro-Infusion Charcoal Facial',
        duration: 45,
        price: 2100,
        description: 'Deep pore purification, enzymatic exfoliation, volcanic charcoal peel, and hyaluronic hydration mist for immediate skin radiance.',
        category: 'Skincare & Wellness',
        sortOrder: 6
      }
    ];

    for (const s of defaultServices) {
      await query.run(
        `INSERT INTO services (id, name, duration, price, description, category, isActive, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [s.id, s.name, s.duration, s.price, s.description, s.category, s.sortOrder, now, now]
      );
    }
  }

  // Seed default settings if empty
  const existingSettings = await query.all('SELECT COUNT(*) as count FROM settings');
  if (existingSettings[0].count === 0) {
    console.log('🌱 Seeding default Mosphere business hours and settings...');
    const now = new Date().toISOString();
    const defaultSettings = [
      { key: 'openTime', value: '10:00' },
      { key: 'closeTime', value: '20:00' },
      { key: 'bufferMinutes', value: '15' },
      { key: 'slotInterval', value: '15' },
      { key: 'closedDays', value: JSON.stringify([]) }, // 0=Sunday, 1=Monday, etc. (Empty means open all 7 days)
      { key: 'blockedDates', value: JSON.stringify([]) }, // Array of YYYY-MM-DD strings
      { key: 'maxAdvanceDays', value: '30' },
      { key: 'salonName', value: 'Mosphere Luxury Salon & Grooming Studio' },
      { key: 'salonPhone', value: '+91 98765 43210' },
      { key: 'salonWhatsApp', value: '919876543210' },
      { key: 'salonEmail', value: 'concierge@mosphere.com' },
      { key: 'salonAddress', value: 'Ground Floor, The Palladium Gallery, Luxury Boulevard' },
      { key: 'currency', value: '₹' }
    ];

    for (const setting of defaultSettings) {
      await query.run(
        'INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)',
        [setting.key, setting.value, now]
      );
    }
  }

  // Seed default admin user if none exists
  const existingAdmins = await query.all('SELECT COUNT(*) as count FROM admin_users');
  if (existingAdmins[0].count === 0) {
    console.log('🌱 Seeding default admin account (Username: admin, Password: adminPassword123)...');
    const now = new Date().toISOString();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('adminPassword123', salt);
    await query.run(
      `INSERT INTO admin_users (id, username, passwordHash, name, role, createdAt)
       VALUES (?, ?, ?, ?, 'superadmin', ?)`,
      [uuidv4(), 'admin', passwordHash, 'Mosphere Concierge Lead', now]
    );
  }

  console.log('✨ Database initialization complete.');
}
