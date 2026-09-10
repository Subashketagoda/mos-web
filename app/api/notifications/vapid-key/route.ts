import { NextResponse } from 'next/server';
import { vapidPublicKey } from '@/lib/webPushService';

export async function GET() {
  return NextResponse.json({ publicKey: vapidPublicKey });
}
