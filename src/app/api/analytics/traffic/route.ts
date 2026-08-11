import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientAddress } from '@/lib/rate-limit';

export async function POST(request: Request) {
  if (!checkRateLimit(`traffic:${getClientAddress(request)}`, 120, 60 * 1000)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  try {
    const { referrer, path } = await request.json();
    if (typeof path !== 'string' || path.length > 2048 || (referrer && typeof referrer !== 'string')) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    const userAgent = (request.headers.get('user-agent') || 'Unknown').slice(0, 512);

    // Safe execution: if DB is not ready, fail gracefully
    try {
      await prisma.trafficLog.create({
        data: {
          referrer: (referrer || 'Direct').slice(0, 2048),
          path,
          userAgent,
        },
      });
    } catch {
      // Ignored
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
