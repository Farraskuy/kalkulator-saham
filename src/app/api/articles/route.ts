import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // "ARTICLE" | "BLOG"

    const where: { type?: string } = {};
    if (type) {
      where.type = type;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data artikel: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, category, type = 'BLOG', author, source, coverImage } = body;

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json({ error: 'Field wajib tidak boleh kosong.' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const article = await prisma.article.create({
      data: {
        title,
        slug: cleanSlug,
        excerpt,
        content,
        category,
        type: type || 'BLOG',
        author: author || 'Tim Redaksi',
        source: source || 'HitungSaham',
        coverImage,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal membuat item: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, slug, excerpt, content, category, type, author, source, coverImage } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan.' }, { status: 400 });
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        type,
        author,
        source,
        coverImage,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memperbarui item: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
    }

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus item: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
