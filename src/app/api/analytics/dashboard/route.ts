import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Total traffic & user counts
    const totalTraffic = await prisma.trafficLog.count().catch(() => 0);
    const totalUsers = await prisma.user.count().catch(() => 0);
    const totalCalculations = await prisma.calculationHistory.count().catch(() => 0);

    // 2. Total action counts
    const totalDownloads = await prisma.actionLog.count({ where: { action: 'download' } }).catch(() => 0);
    const totalShares = await prisma.actionLog.count({ where: { action: 'share' } }).catch(() => 0);

    // 3. Traffic by Referrer
    const trafficLogs = await prisma.trafficLog.findMany({
      select: { referrer: true },
      take: 1000,
    }).catch(() => []);

    const referrerCounts: Record<string, number> = {};
    trafficLogs.forEach((log) => {
      let ref = log.referrer;
      if (ref.includes('google')) ref = 'Google';
      else if (ref.includes('facebook') || ref.includes('fb.')) ref = 'Facebook';
      else if (ref.includes('twitter') || ref.includes('t.co')) ref = 'Twitter';
      else if (ref.includes('instagram')) ref = 'Instagram';
      else if (ref.includes('localhost') || ref.includes('127.0.0.1')) ref = 'Localhost';
      else if (!ref || ref === 'Direct' || ref === '') ref = 'Direct / Bookmark';
      
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    const referrerList = Object.entries(referrerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 4. Action Counts by Calculator Type
    const actions = await prisma.actionLog.findMany({
      select: { calculatorType: true, action: true },
    }).catch(() => []);

    const calculatorStats = {
      'ara-arb': { download: 0, share: 0 },
      'average': { download: 0, share: 0 },
      'prediction': { download: 0, share: 0 },
    };

    actions.forEach((act) => {
      const type = act.calculatorType as 'ara-arb' | 'average' | 'prediction';
      const actionType = act.action as 'download' | 'share';
      if (calculatorStats[type]) {
        calculatorStats[type][actionType] = (calculatorStats[type][actionType] || 0) + 1;
      }
    });

    // 5. Recent actions log
    const recentActions = await prisma.actionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    }).catch(() => []);

    return NextResponse.json({
      summary: {
        totalTraffic,
        totalUsers,
        totalCalculations,
        totalDownloads,
        totalShares,
      },
      referrers: referrerList,
      calculatorStats,
      recentActions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data analitik: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
