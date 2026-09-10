import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAllSubscribers } from '@/lib/webPushService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: messageBody, url, tag } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'Title and body required' },
        { status: 400 }
      );
    }

    const sentCount = await sendPushToAllSubscribers({
      title,
      body: messageBody,
      url,
      tag
    });

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error('Send push error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
