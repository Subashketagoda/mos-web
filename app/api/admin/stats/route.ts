import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  await initDatabase();
  const today = new Date().toISOString().split('T')[0];

  try {
    const todayStats = await query.all(
      `SELECT COUNT(*) as count, SUM(price) as revenue FROM bookings WHERE date = ? AND status != 'cancelled'`,
      [today]
    );

    const upcomingStats = await query.all(
      `SELECT COUNT(*) as count FROM bookings WHERE date >= ? AND status IN ('confirmed', 'rescheduled')`,
      [today]
    );

    const completedStats = await query.all(
      `SELECT COUNT(*) as count, SUM(price) as revenue FROM bookings WHERE status = 'completed'`
    );

    const customerStats = await query.all('SELECT COUNT(*) as count FROM customers');
    const statusCounts = await query.all('SELECT status, COUNT(*) as count FROM bookings GROUP BY status');

    return NextResponse.json({
      success: true,
      stats: {
        todayCount: todayStats[0]?.count || 0,
        todayRevenue: todayStats[0]?.revenue || 0,
        upcomingCount: upcomingStats[0]?.count || 0,
        completedCount: completedStats[0]?.count || 0,
        totalRevenue: completedStats[0]?.revenue || 0,
        totalCustomers: customerStats[0]?.count || 0,
        statusBreakdown: statusCounts.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {})
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
