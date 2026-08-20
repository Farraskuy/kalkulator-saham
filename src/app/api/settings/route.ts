import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    let terms = 'HitungSaham.com menyediakan informasi, edukasi, dan simulasi terkait saham dan pasar modal. Seluruh hasil perhitungan bersifat ilustrasi berdasarkan asumsi dan data tertentu, dan tidak menjamin hasil investasi di masa mendatang. Konten di situs ini bukan merupakan rekomendasi, ajakan, penawaran, atau permintaan untuk membeli atau menjual saham maupun instrumen investasi lainnya. Setiap keputusan investasi sepenuhnya menjadi tanggung jawab pengguna, dan investasi di pasar modal mengandung risiko, termasuk kemungkinan kehilangan modal.';
    let shareDisclaimer = 'Disclaimer: HitungSaham.com menyediakan edukasi & simulasi saham. Hasil hanya ilustrasi, bukan jaminan atau rekomendasi investasi. Keputusan investasi sepenuhnya tanggung jawab pengguna. Instrumen investasi berisiko termasuk kehilangan modal.';
    let tax = '0.0';
    let siteDescription = 'Platform personal berisi kalkulator simulasi matematis saham serta artikel & blog opini pribadi.';

    try {
      const settingDesc = await prisma.systemSetting.findUnique({
        where: { key: 'siteDescription' },
      });
      if (settingDesc) {
        siteDescription = settingDesc.value;
      }

      const settingTerms = await prisma.systemSetting.findUnique({
        where: { key: 'terms' },
      });
      if (settingTerms) {
        terms = settingTerms.value;
      }

      const settingShare = await prisma.systemSetting.findUnique({
        where: { key: 'shareDisclaimer' },
      });
      if (settingShare) {
        shareDisclaimer = settingShare.value;
      }

      const settingTax = await prisma.systemSetting.findUnique({
        where: { key: 'tax' },
      });
      if (settingTax) {
        tax = settingTax.value;
      }
    } catch {
      // Fallback to default
    }

    return NextResponse.json({ terms, shareDisclaimer, tax, siteDescription });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan: ' + (error as Error).message },
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
    const { terms, shareDisclaimer, tax, siteDescription } = await request.json();

    try {
      if (siteDescription !== undefined && siteDescription !== null) {
        await prisma.systemSetting.upsert({
          where: { key: 'siteDescription' },
          update: { value: siteDescription },
          create: { key: 'siteDescription', value: siteDescription },
        });
      }

      if (terms !== undefined && terms !== null) {
        await prisma.systemSetting.upsert({
          where: { key: 'terms' },
          update: { value: terms },
          create: { key: 'terms', value: terms },
        });
      }

      if (shareDisclaimer !== undefined && shareDisclaimer !== null) {
        await prisma.systemSetting.upsert({
          where: { key: 'shareDisclaimer' },
          update: { value: shareDisclaimer },
          create: { key: 'shareDisclaimer', value: shareDisclaimer },
        });
      }

      if (tax !== undefined && tax !== null) {
        await prisma.systemSetting.upsert({
          where: { key: 'tax' },
          update: { value: String(tax) },
          create: { key: 'tax', value: String(tax) },
        });
      }
    } catch (dbErr) {
      console.error('Database write error:', dbErr);
    }

    try {
      const { revalidateTag, revalidatePath } = await import('next/cache');
      revalidateTag('system-settings', 'max');
      revalidatePath('/', 'layout');
    } catch {
      // Cache revalidation fallback
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
