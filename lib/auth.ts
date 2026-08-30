import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { salonConfig } from './config';
import { query, initDatabase } from './db';

export async function verifyAdminAuth(req: NextRequest): Promise<{ authorized: boolean; user?: any; response?: NextResponse }> {
  await initDatabase();

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication token required.' },
        { status: 401 }
      )
    };
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, salonConfig.jwtSecret);

    const user = await query.get(
      'SELECT id, username, name, role FROM admin_users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized: User account not found or disabled.' },
          { status: 401 }
        )
      };
    }

    return { authorized: true, user };
  } catch (err: any) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid or expired session token. Please log in again.' },
        { status: 401 }
      )
    };
  }
}
