import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { DEFAULT_FRACTION_RULES, DEFAULT_ARA_ARB_RULES } from '@/features/calculators';

export async function GET() {
  try {
    let fractions = DEFAULT_FRACTION_RULES;
    let araArb = DEFAULT_ARA_ARB_RULES;

    try {
      const dbFractions = await prisma.fractionRule.findMany();
      if (dbFractions && dbFractions.length > 0) {
        fractions = dbFractions.map((f) => ({
          minPrice: f.minPrice,
          maxPrice: f.maxPrice,
          tick: f.tick,
        }));
      }

      const dbAraArb = await prisma.araArbRule.findMany();
      if (dbAraArb && dbAraArb.length > 0) {
        const mapped: Record<string, { ara: number; arb: number }[]> = {};
        dbAraArb.forEach((r) => {
          if (!mapped[r.board]) mapped[r.board] = [];
          mapped[r.board].push({ ara: r.ara, arb: r.arb });
        });
        araArb = mapped;
      }
    } catch {
      // Fallback to default in-memory rules if DB is not reachable
    }

    return NextResponse.json({ fractions, araArb });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data aturan: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fractions, araArb } = await request.json();

    try {
      if (fractions && Array.isArray(fractions)) {
        await prisma.fractionRule.deleteMany();
        for (const f of fractions) {
          await prisma.fractionRule.create({
            data: {
              minPrice: Number(f.minPrice),
              maxPrice: Number(f.maxPrice),
              tick: Number(f.tick),
            },
          });
        }
      }

      if (araArb && typeof araArb === 'object') {
        await prisma.araArbRule.deleteMany();
        for (const board of Object.keys(araArb)) {
          const rules = araArb[board];
          if (Array.isArray(rules) && rules.length > 0) {
            await prisma.araArbRule.create({
              data: {
                board,
                ara: Number(rules[0].ara),
                arb: Number(rules[0].arb),
              },
            });
          }
        }
      }
    } catch {
      // If DB error, proceed safely
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menyimpan aturan: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
