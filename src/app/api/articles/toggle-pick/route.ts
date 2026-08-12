import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

const MAX_TRADER_PICKS = 3;

export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'ID artikel tidak valid.' }, { status: 400 });

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 });

    const isTraderPick = typeof body.isTraderPick === 'boolean' ? body.isTraderPick : !existing.isTraderPick;

    if (isTraderPick) {
      const count = await prisma.article.count({
        where: {
          isTraderPick: true,
          id: { not: id },
        },
      });
      if (count >= MAX_TRADER_PICKS) {
        return NextResponse.json(
          { error: `Catatan Pilihan Teratas dibatasi maksimal ${MAX_TRADER_PICKS} artikel. Hapus pilihan dari artikel lain terlebih dahulu.` },
          { status: 400 }
        );
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: { isTraderPick },
    });

    try {
      revalidateTag('articles', 'max');
      if (article.slug) {
        revalidateTag(`article-${article.slug}`, 'max');
      }
    } catch (revalidateError) {
      console.warn('revalidateTag warning:', revalidateError);
    }

    return NextResponse.json({ success: true, article, isTraderPick: article.isTraderPick });
  } catch (error) {
    console.error('Error toggling trader pick:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses status Pilihan Teratas.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
