import { NextRequest, NextResponse } from 'next/server';
import { savePushSubscription } from '@/lib/webPushService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subscription = body.subscription;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription payload' },
        { status: 400 }
      );
    }

    const saved = await savePushSubscription(subscription);
    return NextResponse.json({ success: saved });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
