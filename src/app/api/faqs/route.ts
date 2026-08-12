import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const faq = await prisma.faqItem.findUnique({ where: { id } });
      if (!faq) return NextResponse.json({ error: 'FAQ tidak ditemukan.' }, { status: 404 });
      return NextResponse.json({ faq });
    }
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
    const slug = slugify(typeof body.slug === 'string' ? body.slug : question || '');

    if (!question || !answer || !slug) {
      return NextResponse.json({ error: 'Pertanyaan, slug, dan jawaban wajib diisi' }, { status: 400 });
    }

    const maxOrder = await prisma.faqItem.aggregate({
      _max: { order: true },
    });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder._max.order || 0) + 1;

    const newFaq = await prisma.faqItem.create({
      data: {
        question,
        slug,
        answer,
        order: nextOrder,
      },
    });

    revalidateTag('faqs', 'max');

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
    const slug = slugify(typeof body.slug === 'string' ? body.slug : question || '');

    if (!id || !question || !answer || !slug) {
      return NextResponse.json({ error: 'ID, pertanyaan, slug, dan jawaban wajib diisi' }, { status: 400 });
    }

    const updatedFaq = await prisma.faqItem.update({
      where: { id },
      data: {
        question,
        slug,
        answer,
        order: order !== undefined ? Number(order) : 0,
      },
    });

    revalidateTag('faqs', 'max');

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

    revalidateTag('faqs', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus FAQ: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
