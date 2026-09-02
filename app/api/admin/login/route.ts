import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, initDatabase } from '@/lib/db';
import { salonConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
  } catch (initErr) {
    console.warn('Notice: Database initialization deferred or failed:', initErr);
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const trimmedUser = username.trim().toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'adminPassword123';

    // Fast-path / Fallback for default administrator
    if (trimmedUser === 'admin' && password === defaultPassword) {
      const token = jwt.sign(
        { userId: 'admin-lead-default', username: 'admin', role: 'superadmin' },
        salonConfig.jwtSecret,
        { expiresIn: salonConfig.jwtExpiresIn as any }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: 'admin-lead-default',
          username: 'admin',
          name: 'Mosphere Concierge Lead',
          role: 'superadmin'
        }
      });
    }

    let user: any = null;
    try {
      user = await query.get('SELECT * FROM admin_users WHERE LOWER(username) = ?', [trimmedUser]);
    } catch (dbErr) {
      console.warn('Database query notice in login:', dbErr);
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid username or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid username or password.' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      salonConfig.jwtSecret,
      { expiresIn: salonConfig.jwtExpiresIn as any }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
