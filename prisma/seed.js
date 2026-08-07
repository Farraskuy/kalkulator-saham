const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Memulai seeding database...');

  // 1. Seed Admin User
  const email = 'admin@credisuite.com';
  const passwordHash = hashPassword('credisuite2026');

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log('✔ Akun Admin default berhasil dibuat.');
  } else {
    console.log('✔ Akun Admin default sudah ada.');
  }

  // 2. Seed Default BEI Fractions
  const defaultFractions = [
    { minPrice: 1, maxPrice: 200, tick: 1 },
    { minPrice: 201, maxPrice: 500, tick: 2 },
    { minPrice: 501, maxPrice: 2000, tick: 5 },
    { minPrice: 2001, maxPrice: 5000, tick: 10 },
    { minPrice: 5001, maxPrice: 99999999, tick: 25 },
  ];

  const existingFractions = await prisma.fractionRule.findMany();
  if (existingFractions.length === 0) {
    for (const f of defaultFractions) {
      await prisma.fractionRule.create({
        data: f,
      });
    }
    console.log('✔ Aturan Fraksi BEI default berhasil disimpan.');
  } else {
    console.log('✔ Aturan Fraksi BEI sudah terisi.');
  }

  // 3. Seed Default ARA/ARB Rules
  const defaultAraArb = [
    { board: 'Utama', ara: 25, arb: 15 },
    { board: 'Pengembangan', ara: 25, arb: 15 },
    { board: 'Akselerasi', ara: 10, arb: 10 },
    { board: 'Watchlist', ara: 10, arb: 10 },
  ];

  const existingAraArb = await prisma.araArbRule.findMany();
  if (existingAraArb.length === 0) {
    for (const r of defaultAraArb) {
      await prisma.araArbRule.create({
        data: r,
      });
    }
    console.log('✔ Persentase ARA/ARB default berhasil disimpan.');
  } else {
    console.log('✔ Persentase ARA/ARB sudah terisi.');
  }

  // 4. Seed Terms and Conditions
  const existingTerms = await prisma.systemSetting.findUnique({
    where: { key: 'terms' },
  });

  if (!existingTerms) {
    await prisma.systemSetting.create({
      data: {
        key: 'terms',
        value: 'Website ini merupakan wadah berbagi catatan trading dan alat bantu kalkulasi matematis saham BEI berdasarkan parameter input pengguna. Isi konten di website ini bukan merupakan instruksi atau rekomendasi beli/jual saham baku.',
      },
    });
    console.log('✔ Syarat dan Ketentuan default berhasil disimpan.');
  } else {
    console.log('✔ Syarat dan Ketentuan sudah terisi.');
  }

  // 5. Seed Default FAQ Items
  const defaultFaqs = [
    {
      id: 'faq-1',
      question: 'Apa itu Hitungsaham.com?',
      answer: 'Hitungsaham.com adalah platform personal berisi kalkulator analisis saham BEI dan kumpulan catatan jurnal trading harian. Platform ini dibuat untuk membantu rekan-rekan investor dan trader dalam menghitung ARA/ARB, Average Down, serta mengelola manajemen risiko.',
      order: 1,
    },
    {
      id: 'faq-2',
      question: 'Bagaimana cara menghitung Average Down secara aman?',
      answer: 'Average down dilakukan dengan menambah porsi saham ketika harga mengalami penurunan. Penggunaan kalkulator Average Down di web ini membantu Anda menghitung berapa lot tambahan yang dibutuhkan untuk mencapai target harga rata-rata tertentu tanpa melampaui alokasi modal maksimal.',
      order: 2,
    },
    {
      id: 'faq-3',
      question: 'Apakah perhitungan ARA dan ARB di website ini sudah simetris?',
      answer: 'Ya, kalkulator kami diperbarui mengikuti aturan bursa terbaru untuk papan Utama, Pengembangan, Akselerasi, dan Pemantauan Khusus (FCA).',
      order: 3,
    },
  ];

  for (const faq of defaultFaqs) {
    await prisma.faqItem.upsert({
      where: { id: faq.id },
      update: faq,
      create: faq,
    });
  }
  console.log('✔ Default FAQ berhasil disimpan/diperbarui.');

  // 6. Seed Default Categories
  const defaultCategories = [
    { name: 'Jurnal ', slug: 'jurnal-trading', order: 1 },
    { name: 'Edukasi Saham', slug: 'edukasi-saham', order: 2 },
    { name: 'Analisis Pasar', slug: 'analisis-pasar', order: 3 },
    { name: 'Tips & Trik', slug: 'tips-trik', order: 4 },
    { name: 'Pengalaman', slug: 'pengalaman', order: 5 },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('✔ Default Categories berhasil disimpan.');

  // 6. Seed Personal Stock Blog Posts & Educational Articles
  await prisma.article.deleteMany({});
  console.log('✔ Artikel lama dibersihkan.');

  const defaultArticles = [
    {
      id: 'art-1',
      slug: 'catatan-pengalaman-trading-5-tahun-bei',
      title: 'Catatan Pengalaman  5 Tahun di BEI: Dari Loss Hingga Konsisten Profit',
      category: 'Jurnal ',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Pengalaman Pribadi',
      excerpt: 'Sharing perjalanan 5 tahun bertransaksi di bursa saham Indonesia. Mengenali kesalahan awal pemula, pentingnya jurnal trading, hingga membentuk sistem bertransaksi disiplin.',
      content: 'Selama 5 tahun bertransaksi di pasar saham BEI, satu pelajaran terbesar yang saya dapatkan adalah bahwa **psikologi dan manajemen posisi jauh lebih penting daripada sekadar menebak arah harga saham**.\n\n### 1. Fase Pemula: Terjebak FOMO dan HAKA\nDi awal perjalanan pada tahun 2021, saya sering terjebak membeli saham di harga pucuk hanya karena melihat antrean *bid* yang mendadak tebal. Hasilnya, modal tergerus signifikan saat saham balik arah kena ARB.\n\n### 2. Membangun Jurnal  dan Aturan Risk/Reward\nTitik balik terjadi ketika saya mulai mencatat setiap transaksi dalam jurnal dan menetapkan batas *stop loss* maksimal 3-5%. Menggunakan kalkulator prediksi target jual/beli membantu saya menghitung *risk/reward ratio* secara objektif sebelum menekan tombol order.\n\n### 3. Kesimpulan\nPasar saham adalah maraton, bukan lari cepat. Disiplin pada sistem transaksi jauh lebih menjamin keberlanjutan modal dibanding mencoba untung instan.',
    },
    {
      id: 'art-2',
      slug: 'psikologi-menghadapi-saham-arb-berjilid',
      title: 'Psikologi Menghadapi Saham ARB Berjilid-jilid: Cara Saya Mengelola Modal',
      category: 'Pengalaman',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Catatan Trader',
      excerpt: 'Bagaimana menjaga ketenangan emosi dan alokasi dana ketika posisi saham yang dipegang terkena Auto Rejection Bawah berturut-turut.',
      content: 'Melihat portofolio merah akibat saham terkunci ARB berjilid-jilid pasti menimbulkan kepanikan. Berikut adalah langkah yang biasa saya lakukan untuk mengamankan psikologi dan modal:\n\n1. **Jangan Langsung Average Down**: Menambah posisi pada saham yang masih terkunci ARB tanpa konfirmasi volume reversal hanya akan memperbesar risiko kerugian.\n2. **Ukur Batas Maksimal Kerugian**: Gunakan kalkulator untuk mengetahui nilai absolut penurunan dan evaluasi apakah skenario *cut loss* pada pembukaan gembok lebih bijak daripada menahan terus.\n3. **Fokus Pada Cash Flow**: Selalu sisakan *cash ratio* minimal 30% dari total portofolio agar tidak panik saat pasar mengalami volatilitas ekstrem.',
    },
    {
      id: 'art-3',
      slug: 'analisa-papan-pemantauan-khusus-fca',
      title: 'Pandangan Saya Tentang Papan Pemantauan Khusus (FCA) dan Strategi Menghadapinya',
      category: 'Analisis Pasar',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Analisa Pasar',
      excerpt: 'Ulasan personal mengenai mekanisme Full Call Auction (FCA) di BEI dan bagaimana menyesuaikan metode transaksi pada saham-saham watchlist.',
      content: 'Skema perdagangan Full Call Auction (FCA) membawa dinamika baru dalam transaksi saham di papan pemantauan khusus.\n\n### Ciri Khas Perdagangan FCA:\n- Pembentukan harga terjadi pada sesi *matching* indikatif (*IE/IEP*).\n- Batas persentase ARA dan ARB dibatasi simetris 10%.\n\n### Strategi Bertransaksi:\nSebagai trader ritel, saya memilih untuk mengurangi porsi transaksi pada saham berstatus FCA dan mengalokasikan modal lebih banyak pada saham papan Utama & Pengembangan dengan transaksi reguler yang transparan.',
    },
    {
      id: 'art-4',
      slug: 'kesalahan-fatal-pemula-saat-average-down',
      title: '5 Kesalahan Fatal Pemula Saat Average Down Saham yang Sedang Downtrend',
      category: 'Tips & Trik',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Tips & Trik',
      excerpt: 'Jangan asal menambah lot! Pelajari kesalahan umum trader saat melakukan average down dan cara mengkalkulasi lot yang rasional.',
      content: 'Banyak trader terjebak dengan ilusi bahwa *average down* selalu menyelesaikan masalah harga saham yang turun. Padahal tanpa perhitungan presisi, *average down* justru mempercepat habisnya modal.\n\nBerikut 5 kesalahan yang wajib dihindari:\n1. Membeli tanpa memperhitungkan target harga rata-rata baru.\n2. Kehabisan amunisi di tahap awal penurunan.\n3. Mengabaikan *support level* teknikal.\n4. Mengabaikan biaya komisi sekuritas.\n5. Tidak memiliki rencana *stop loss* cadangan.',
    },
    {
      id: 'art-5',
      slug: 'ketentuan-baru-jam-perdagangan-bei-2026',
      title: 'Ketentuan Jam Perdagangan BEI & Mekanisme ARA ARB Simetris 2026',
      category: 'Edukasi Saham',
      type: 'ARTICLE',
      author: 'Tim Analis',
      source: 'HitungSaham Edu',
      excerpt: 'Penjelasan ringkas mengenai fraksi harga resmi BEI, rentang pergerakan tick, serta persentase batas auto rejection terbaru.',
      content: 'Bursa Efek Indonesia (BEI) memberlakukan ketentuan fraksi harga dan batasan Auto Rejection Atas (ARA) serta Auto Rejection Bawah (ARB) untuk menjaga ketertiban perdagangan.\n\n### Tabel Fraksi Harga BEI:\n- **Harga < Rp 200**: Kelipatan Rp 1\n- **Harga Rp 200 - Rp 500**: Kelipatan Rp 2\n- **Harga Rp 500 - Rp 2.000**: Kelipatan Rp 5\n- **Harga Rp 2.000 - Rp 5.000**: Kelipatan Rp 10\n- **Harga > Rp 5.000**: Kelipatan Rp 25',
    },
    {
      id: 'art-6',
      slug: 'tips-menghitung-lot-pembelian-rata-rata-saat-saham-arb',
      title: 'Tips Menghitung Lot Pembelian Rata-Rata Saat Saham ARB',
      category: 'Tips & Trik',
      type: 'ARTICLE',
      author: 'Tim Analis',
      source: 'HitungSaham Edu',
      excerpt: 'Panduan matematika sederhana menghitung jumlah lot pembelian tambahan untuk menurunkan harga average sesuai target yang realistis.',
      content: 'Menghitung kebutuhan lot tambahan saat melakukan average down dapat dilakukan menggunakan rumus matematis sederhana:\n\n`Lot Tambahan = (Target Avg * Total Lembar Saham - Total Investasi Awal) / (100 * (Harga Pembelian Baru - Target Avg))`\n\nAnda dapat memanfaatkan kalkulator otomatis di platform ini untuk hasil instan tanpa perlu menghitung manual.',
    },
  ];

  for (const art of defaultArticles) {
    await prisma.article.create({
      data: art,
    });
  }
  console.log('✔ Personal Stock Blog & Educational Articles berhasil disimpan.');

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
