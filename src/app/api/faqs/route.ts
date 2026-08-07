import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';

// Default FAQs fallback if DB has no data
const DEFAULT_FAQS = [
  {
    id: 'default-1',
    question: 'Apa itu Hitungsaham.com?',
    answer: 'Hitungsaham.com adalah alat bantu kalkulasi yang dirancang khusus untuk trader dan investor di Bursa Efek Indonesia (BEI). Platform ini menyediakan fitur kalkulator instan untuk menghitung batas Auto Rejection Atas (ARA) dan Auto Rejection Bawah (ARB), simulasi average up/down posisi portofolio, serta penentuan titik take profit dan cut loss.',
    order: 1,
  },
  {
    id: 'default-2',
    question: 'Bagaimana cara memberikan masukan atau melaporkan kendala (feedback)?',
    answer: 'Kami sangat menghargai masukan dari rekan-rekan trader untuk terus menyempurnakan alat ini. Jika Anda menemukan ketidaksesuaian perhitungan, memiliki ide fitur baru, atau ingin melaporkan bugs, silakan hubungi tim kami melalui email di admin@hitungsaham.com.',
    order: 2,
  },
  {
    id: 'default-3',
    question: 'Bagaimana Aturan Fraksi Harga & Papan Perdagangan BEI Terbaru?',
    answer: 'Kalkulator kami selalu diperbarui mengikuti regulasi BEI. Saat ini, pergerakan harga saham dibatasi oleh fraksi harga berdasarkan rentang harga saham (misal: Rp1 untuk harga di bawah Rp200, Rp2 untuk harga Rp200-Rp500, dan seterusnya). Selain itu, batas ARA dan ARB berbeda bergantung pada papan pencatatan:\n• Papan Utama & Pengembangan: ARA hingga maksimal 20% - 35% dan ARB hingga maksimal 15%.\n• Papan Akselerasi: ARA dan ARB simetris di angka 10%.\n• Papan Pemantauan Khusus (FCA/Watchlist): ARA dan ARB dibatasi sebesar 10% untuk perdagangan Full Call Auction.\n• Pada rentang harga Rp 1-10: ARA dan ARB dibatasi simetris 1 papan tick.',
    order: 3,
  },
  {
    id: 'default-4',
    question: 'Bagaimana Strategi Aman Melakukan Average Down pada Saham Lapis Ketiga?',
    answer: 'Saham lapis ketiga (small-cap) memiliki tingkat volatilitas yang sangat tinggi. Melakukan average down secara membabi buta saat harga turun (menangkap pisau jatuh) berisiko menggerus modal secara signifikan. Strategi yang lebih aman adalah mengombinasikan simulasi lot di kalkulator ini dengan konfirmasi teknikal. Pastikan Anda hanya menambah porsi (average down) ketika tekanan jual sudah mereda, yang bisa divalidasi ketika indikator teknikal seperti RSI menunjukkan area oversold ekstrem dan mulai ada pola pembalikan arah (reversal).',
    order: 4,
  },
  {
    id: 'default-5',
    question: 'Bagaimana Cara Scalping Menggunakan Momentum ARA/ARB?',
    answer: 'Scalping memanfaatkan pergerakan harga yang cepat dalam hitungan menit. Saat sebuah saham bervolume tinggi menunjukkan momentum breakout dan antrean beli ditekan agresif (HAKA / Hajar Kanan), Anda dapat menggunakan kalkulator kami untuk melihat jarak harga saat ini menuju batas ARA. Jika jarak menuju ARA masih lebar dan momentum terus terakselerasi, ada peluang scalping namun tetap perlu manajemen risiko masing-masing trader. Sebaliknya, mengetahui batas pasti ARB membantu Anda mengukur kapan kepanikan pasar mencapai titik maksimalnya.',
    order: 5,
  },
  {
    id: 'default-6',
    question: 'Bagaimana Mengatur Risk/Reward Ratio dengan Kalkulator Ini?',
    answer: 'Manajemen risiko adalah kunci bertahan di pasar modal untuk menghindari kerugian modal yang dalam. Sebelum mengeksekusi perdagangan, gunakan fitur Prediksi Jual/Beli. Masukkan harga pembelian dan batas toleransi risiko yang siap diterima trader (misalnya maksimal cut loss 3%). Kalkulator dibuat untuk menjadi batasan Anda harus keluar. Pasangkan angka tersebut dengan target take profit minimal dua atau tiga kali lipat dari risiko (Risk/Reward 1:2 atau 1:3). Dengan angka yang absolut, Anda bisa bertransaksi lebih disiplin tanpa melibatkan emosi.',
    order: 6,
  },
];

export async function GET() {
  try {
    const faqs = await prisma.faqItem.findMany({
      orderBy: { order: 'asc' },
    });
    if (!faqs || faqs.length === 0) {
      return NextResponse.json({ faqs: DEFAULT_FAQS });
    }
    return NextResponse.json({ faqs });
  } catch {
    return NextResponse.json({ faqs: DEFAULT_FAQS });
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
