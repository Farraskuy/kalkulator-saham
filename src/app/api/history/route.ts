import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUserSession } from '@/lib/auth';

// GET: Ambil daftar riwayat kalkulasi milik user yang sedang login
export async function GET() {
  const user = await verifyUserSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const histories = await prisma.calculationHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // ambil 50 terbaru
    });

    return NextResponse.json({ histories });
  } catch (error) {
    console.error('Fetch history error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Simpan kalkulasi baru ke histori user
export async function POST(request: Request) {
  const user = await verifyUserSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { calculatorType, title, inputs, results } = body;

    if (!calculatorType || !inputs || !results) {
      return NextResponse.json({ error: 'Data kalkulasi tidak lengkap' }, { status: 400 });
    }

    const history = await prisma.calculationHistory.create({
      data: {
        userId: user.id,
        calculatorType,
        title: title || 'Kalkulasi Saham',
        inputs,
        results,
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Save history error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Hapus item histori tertentu milik user
export async function DELETE(request: Request) {
  const user = await verifyUserSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID histori dibutuhkan' }, { status: 400 });
    }

    // Pastikan histori tersebut memang milik user yang sedang login
    await prisma.calculationHistory.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
