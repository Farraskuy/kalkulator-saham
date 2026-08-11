import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [
      totalTraffic,
      totalUsers,
      totalCalculations,
      totalDownloads,
      totalShares,
      totalArticles,
      publishedArticles,
      trafficLogs,
      actionGroups,
      recentActions,
    ] = await Promise.all([
      prisma.trafficLog.count(),
      prisma.user.count(),
      prisma.calculationHistory.count(),
      prisma.actionLog.count({ where: { action: 'download' } }),
      prisma.actionLog.count({ where: { action: 'share' } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.trafficLog.findMany({ select: { referrer: true }, orderBy: { timestamp: 'desc' }, take: 1000 }),
      prisma.actionLog.groupBy({ by: ['calculatorType', 'action'], _count: { _all: true } }),
      prisma.actionLog.findMany({ orderBy: { timestamp: 'desc' }, take: 8 }),
    ]);

    const referrerCounts: Record<string, number> = {};
    trafficLogs.forEach((log) => {
      let ref = log.referrer;
      if (ref.includes('google')) ref = 'Google';
      else if (ref.includes('facebook') || ref.includes('fb.')) ref = 'Facebook';
      else if (ref.includes('twitter') || ref.includes('t.co')) ref = 'Twitter';
      else if (ref.includes('instagram')) ref = 'Instagram';
      else if (ref.includes('localhost') || ref.includes('127.0.0.1')) ref = 'Localhost';
      else if (!ref || ref === 'Direct') ref = 'Direct / Bookmark';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    const calculatorStats: Record<string, { download: number; share: number }> = {
      'ara-arb': { download: 0, share: 0 },
      average: { download: 0, share: 0 },
      prediction: { download: 0, share: 0 },
    };
    actionGroups.forEach((group) => {
      const stats = calculatorStats[group.calculatorType];
      if (stats && (group.action === 'download' || group.action === 'share')) {
        stats[group.action] = group._count._all;
      }
    });

    return NextResponse.json({
      summary: {
        totalTraffic,
        totalUsers,
        totalCalculations,
        totalDownloads,
        totalShares,
        totalArticles,
        publishedArticles,
        draftArticles: totalArticles - publishedArticles,
      },
      referrers: Object.entries(referrerCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      calculatorStats,
      recentActions,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data dashboard.' }, { status: 500 });
  }
}
