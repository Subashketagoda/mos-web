import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, initDatabase } from '@/lib/db';
import { salonConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  await initDatabase();

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const user = await query.get('SELECT * FROM admin_users WHERE username = ?', [username.trim()]);
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
