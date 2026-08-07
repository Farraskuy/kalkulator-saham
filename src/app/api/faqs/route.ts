import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const faqs = await prisma.faqItem.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ faqs: faqs || [] });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ faqs: [] });
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question, answer, order } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Pertanyaan dan jawaban wajib diisi' }, { status: 400 });
    }

    const maxOrder = await prisma.faqItem.aggregate({
      _max: { order: true },
    });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder._max.order || 0) + 1;

    const newFaq = await prisma.faqItem.create({
      data: {
        question,
        answer,
        order: nextOrder,
      },
    });

    revalidateTag('faqs');

    return NextResponse.json({ success: true, faq: newFaq });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menambah FAQ: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, question, answer, order } = body;

    if (!id || !question || !answer) {
      return NextResponse.json({ error: 'ID, pertanyaan, dan jawaban wajib diisi' }, { status: 400 });
    }

    const updatedFaq = await prisma.faqItem.update({
      where: { id },
      data: {
        question,
        answer,
        order: order !== undefined ? Number(order) : 0,
      },
    });

    revalidateTag('faqs');

    return NextResponse.json({ success: true, faq: updatedFaq });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengupdate FAQ: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    }

    await prisma.faqItem.delete({
      where: { id },
    });

    revalidateTag('faqs');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus FAQ: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
