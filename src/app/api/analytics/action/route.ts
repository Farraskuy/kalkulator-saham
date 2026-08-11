import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientAddress } from '@/lib/rate-limit';

export async function POST(request: Request) {
  if (!checkRateLimit(`action:${getClientAddress(request)}`, 120, 60 * 1000)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  try {
    const { calculatorType, action } = await request.json();
    if (
      typeof calculatorType !== 'string' ||
      typeof action !== 'string' ||
      calculatorType.length > 64 ||
      action.length > 64
    ) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    try {
      await prisma.actionLog.create({
        data: {
          calculatorType,
          action,
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
