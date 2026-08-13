const fs = require('fs');
const path = require('path');

// Auto-load .env file into process.env BEFORE PrismaClient is imported
if (fs.existsSync(path.resolve(__dirname, '../.env'))) {
  const envConfig = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key.trim() && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  const user = process.env.DB_USER || 'kalkulator_app';
  const pass = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME || 'kalkulator_saham';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  if (!user || !pass || !name) {
    throw new Error('DATABASE_URL or DB_USER, DB_PASSWORD, and DB_NAME must be configured before seeding');
  }
  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${encodeURIComponent(name)}?schema=public`;
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai seeding database...');

  // 1. Seed Admin User
  const email = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!email || !adminPassword || adminPassword.length < 12) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) must be configured before seeding');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

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
    await prisma.adminUser.update({
      where: { id: existingAdmin.id },
      data: { passwordHash },
    });
    console.log('Admin password updated from environment configuration.');
  }

  // 2. Seed Default Fractions
  const defaultFractions = [
    { minPrice: 1, maxPrice: 199, tick: 1 },
    { minPrice: 200, maxPrice: 499, tick: 2 },
    { minPrice: 500, maxPrice: 1999, tick: 5 },
    { minPrice: 2000, maxPrice: 4999, tick: 10 },
    { minPrice: 5000, maxPrice: 99999999, tick: 25 },
  ];

  const existingFractions = await prisma.fractionRule.findMany();
  if (existingFractions.length === 0) {
    for (const f of defaultFractions) {
      await prisma.fractionRule.create({
        data: f,
      });
    }
    console.log('✔ Aturan Fraksi Saham default berhasil disimpan.');
  } else {
    console.log('✔ Aturan Fraksi Saham sudah terisi.');
  }

  // 3. Seed Default ARA/ARB Rules
  const defaultAraArb = [
    { board: 'Utama_50_200', ara: 35, arb: 15 },
    { board: 'Utama_200_5000', ara: 25, arb: 15 },
    { board: 'Utama_5000', ara: 20, arb: 15 },
    { board: 'Akselerasi', ara: 10, arb: 10 },
    { board: 'FCA', ara: 10, arb: 10 },
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

  // 4. Seed Terms and Conditions & Share Disclaimer
  await prisma.systemSetting.upsert({
    where: { key: 'terms' },
    update: {
      value: 'HitungSaham.com menyediakan informasi, edukasi, dan simulasi terkait saham dan pasar modal. Seluruh hasil perhitungan bersifat ilustrasi berdasarkan asumsi dan data tertentu, dan tidak menjamin hasil investasi di masa mendatang. Konten di situs ini bukan merupakan rekomendasi, ajakan, penawaran, atau permintaan untuk membeli atau menjual saham maupun instrumen investasi lainnya. Setiap keputusan investasi sepenuhnya menjadi tanggung jawab pengguna, dan investasi di pasar modal mengandung risiko, termasuk kemungkinan kehilangan modal.',
    },
    create: {
      key: 'terms',
      value: 'HitungSaham.com menyediakan informasi, edukasi, dan simulasi terkait saham dan pasar modal. Seluruh hasil perhitungan bersifat ilustrasi berdasarkan asumsi dan data tertentu, dan tidak menjamin hasil investasi di masa mendatang. Konten di situs ini bukan merupakan rekomendasi, ajakan, penawaran, atau permintaan untuk membeli atau menjual saham maupun instrumen investasi lainnya. Setiap keputusan investasi sepenuhnya menjadi tanggung jawab pengguna, dan investasi di pasar modal mengandung risiko, termasuk kemungkinan kehilangan modal.',
    },
  });
  console.log('✔ Syarat dan Ketentuan (terms) default berhasil disimpan.');

  await prisma.systemSetting.upsert({
    where: { key: 'shareDisclaimer' },
    update: {
      value: 'Disclaimer: HitungSaham.com menyediakan edukasi & simulasi saham. Hasil hanya ilustrasi, bukan jaminan atau rekomendasi investasi. Keputusan investasi sepenuhnya tanggung jawab pengguna. Instrumen investasi berisiko termasuk kehilangan modal.',
    },
    create: {
      key: 'shareDisclaimer',
      value: 'Disclaimer: HitungSaham.com menyediakan edukasi & simulasi saham. Hasil hanya ilustrasi, bukan jaminan atau rekomendasi investasi. Keputusan investasi sepenuhnya tanggung jawab pengguna. Instrumen investasi berisiko termasuk kehilangan modal.',
    },
  });
  console.log('✔ Disclaimer share gambar default berhasil disimpan.');

  // 5. Seed Default FAQ Items
  const defaultFaqs = [
    {
      id: 'faq-1',
      slug: 'apa-itu-hitungsaham-com',
      question: 'Apa itu Hitungsaham.com?',
      answer: 'Hitungsaham.com adalah alat bantu kalkulasi yang dirancang khusus untuk trader dan investor di Bursa Efek Indonesia (BEI). Platform ini menyediakan fitur kalkulator instan untuk menghitung batas Auto Rejection Atas (ARA) dan Auto Rejection Bawah (ARB), simulasi average up/down posisi portofolio, serta penentuan titik take profit dan cut loss.',
      order: 1,
    },
    {
      id: 'faq-2',
      slug: 'cara-memberikan-masukan-atau-melaporkan-kendala',
      question: 'Bagaimana cara memberikan masukan atau melaporkan kendala (feedback)?',
      answer: 'Kami sangat menghargai masukan dari rekan-rekan trader untuk terus menyempurnakan alat ini. Jika Anda menemukan ketidaksesuaian perhitungan, memiliki ide fitur baru, atau ingin melaporkan bugs, silakan hubungi tim kami melalui email di admin@hitungsaham.com.',
      order: 2,
    },
    {
      id: 'faq-3',
      slug: 'aturan-fraksi-harga-dan-papan-perdagangan-bei-terbaru',
      question: 'Bagaimana Aturan Fraksi Harga & Papan Perdagangan BEI Terbaru?',
      answer: 'Kalkulator kami selalu diperbarui mengikuti regulasi BEI. Saat ini, pergerakan harga saham dibatasi oleh fraksi harga berdasarkan rentang harga saham (misal: Rp1 untuk harga di bawah Rp200, Rp2 untuk harga Rp200-Rp500, dan seterusnya). Selain itu, batas ARA dan ARB berbeda bergantung pada papan pencatatan:\n\n- Papan Utama & Pengembangan: ARA hingga maksimal 20% - 35% dan ARB hingga maksimal 15%.\n- Papan Akselerasi: ARA dan ARB simetris di angka 10%.\n- FCA (Papan Pemantauan Khusus): ARA dan ARB dibatasi sebesar 10% untuk perdagangan Full Call Auction.\n- Pada rentang harga Rp 1-10: ARA dan ARB dibatasi simetris Rp1.',
      order: 3,
    },
    {
      id: 'faq-4',
      slug: 'strategi-aman-average-down-saham-lapis-ketiga',
      question: 'Bagaimana Strategi Aman Melakukan Average Down pada Saham Lapis Ketiga?',
      answer: 'Saham lapis ketiga (small-cap) memiliki tingkat volatilitas yang sangat tinggi. Melakukan average down secara membabi buta saat harga turun (menangkap pisau jatuh) berisiko menggerus modal secara signifikan. Strategi yang lebih aman adalah mengombinasikan simulasi lot di kalkulator ini dengan konfirmasi teknikal. Pastikan Anda hanya menambah porsi (average down) ketika tekanan jual sudah mereda, yang bisa divalidasi ketika indikator teknikal seperti RSI menunjukkan area oversold ekstrem dan mulai ada pola pembalikan arah (reversal).',
      order: 4,
    },
    {
      id: 'faq-5',
      slug: 'cara-scalping-menggunakan-momentum-ara-arb',
      question: 'Bagaimana Cara Scalping Menggunakan Momentum ARA/ARB?',
      answer: 'Scalping memanfaatkan pergerakan harga yang cepat dalam hitungan menit. Saat sebuah saham bervolume tinggi menunjukkan momentum breakout dan antrean beli ditekan agresif (HAKA / Hajar Kanan), Anda dapat menggunakan kalkulator kami untuk melihat jarak harga saat ini menuju batas ARA. Jika jarak menuju ARA masih lebar dan momentum terus terakselerasi, ada peluang scalping namun tetap perlu manajemen risiko masing-masing trader. Sebaliknya, mengetahui batas pasti ARB membantu Anda mengukur kapan kepanikan pasar mencapai titik maksimalnya.',
      order: 5,
    },
    {
      id: 'faq-6',
      slug: 'mengatur-risk-reward-ratio-dengan-kalkulator',
      question: 'Bagaimana Mengatur Risk/Reward Ratio dengan Kalkulator Ini?',
      answer: 'Manajemen risiko adalah kunci bertahan di pasar modal untuk menghindari kerugian modal yang dalam. Sebelum mengeksekusi perdagangan, gunakan fitur Prediksi Jual/Beli. Masukkan harga pembelian dan batas toleransi risiko yang siap diterima trader (misalnya maksimal cut loss 3%). Kalkulator dibuat untuk menjadi batasan Anda harus keluar. Pasangkan angka tersebut dengan target take profit minimal dua atau tiga kali lipat dari risiko (Risk/Reward 1:2 atau 1:3). Dengan angka yang absolut, Anda bisa bertransaksi lebih disiplin tanpa melibatkan emosi.',
      order: 6,
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
    { name: 'Catatan & Artikel', slug: 'catatan-artikel', order: 1 },
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

  // 7. Seed Personal Stock Blog Posts & Educational Articles
  const resetSeedArticles = process.env.RESET_SEED_ARTICLES === 'true';
  if (resetSeedArticles) await prisma.article.deleteMany({});
  if (resetSeedArticles) console.log('Artikel lama dibersihkan karena RESET_SEED_ARTICLES=true.');

  const defaultArticles = [
    {
      id: 'art-1',
      slug: 'catatan-pengalaman-5-tahun-di-pasar-saham',
      title: 'Catatan Pengalaman 5 Tahun di Pasar Saham: Dari Loss Hingga Konsisten',
      category: 'Catatan & Artikel',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Pengalaman Pribadi',
      excerpt: 'Sharing perjalanan 5 tahun bertransaksi di bursa saham. Mengenali kesalahan awal pemula, pentingnya catatan personal, hingga membentuk sistem analisis yang disiplin.',
      content: 'Selama 5 tahun bertransaksi di pasar saham, satu pelajaran terbesar yang saya dapatkan adalah bahwa **psikologi dan manajemen posisi jauh lebih penting daripada sekadar menebak arah harga saham**.\n\n### 1. Fase Pemula: Terjebak Impulsif\nDi awal perjalanan pada tahun 2021, saya sering terjebak membeli saham di harga pucuk hanya karena melihat pergerakan mendadak. Hasilnya, modal tergerus signifikan saat saham balik arah kena ARB.\n\n### 2. Membangun Catatan & Aturan Risk/Reward\nTitik balik terjadi ketika saya mulai mencatat setiap evaluasi posisi dan menetapkan batas *stop loss* maksimal 3-5%. Menggunakan kalkulator prediksi target jual/beli membantu saya menghitung *risk/reward ratio* secara objektif sebelum melakukan keputusan.\n\n### 3. Kesimpulan\nPasar saham adalah maraton, bukan lari cepat. Disiplin pada sistem analisis jauh lebih menjamin keberlanjutan modal dibanding mencoba untung instan.',
    },
    {
      id: 'art-2',
      slug: 'psikologi-menghadapi-saham-arb-berjilid',
      title: 'Psikologi Menghadapi Saham ARB Berjilid-jilid: Cara Saya Mengelola Modal',
      category: 'Pengalaman',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Catatan Opini Pribadi',
      excerpt: 'Bagaimana menjaga ketenangan emosi dan alokasi dana ketika posisi saham yang dipegang terkena Auto Rejection Bawah berturut-turut.',
      content: 'Melihat portofolio merah akibat saham terkunci ARB berjilid-jilid pasti menimbulkan kepanikan. Berikut adalah langkah yang biasa saya lakukan untuk mengamankan psikologi dan modal:\n\n1. **Jangan Langsung Average Down**: Menambah posisi pada saham yang masih terkunci ARB tanpa konfirmasi volume reversal hanya akan memperbesar risiko kerugian.\n2. **Ukur Batas Maksimal Kerugian**: Gunakan kalkulator untuk mengetahui nilai absolut penurunan dan evaluasi apakah skenario *cut loss* lebih bijak daripada menahan terus.\n3. **Fokus Pada Cash Flow**: Selalu sisakan *cash ratio* minimal 30% dari total portofolio agar tidak panik saat pasar mengalami volatilitas ekstrem.',
    },
    {
      id: 'art-3',
      slug: 'kesalahan-fatal-pemula-saat-average-down',
      title: '5 Kesalahan Fatal Pemula Saat Average Down Saham yang Sedang Downtrend',
      category: 'Tips & Trik',
      type: 'BLOG',
      author: 'HitungSaham',
      source: 'Tips & Trik',
      excerpt: 'Jangan asal menambah lot! Pelajari kesalahan umum saat melakukan average down dan cara mengkalkulasi lot yang rasional.',
      content: 'Banyak orang terjebak dengan ilusi bahwa *average down* selalu menyelesaikan masalah harga saham yang turun. Padahal tanpa perhitungan presisi, *average down* justru mempercepat habisnya modal.\n\nBerikut 5 kesalahan yang wajib dihindari:\n1. Membeli tanpa memperhitungkan target harga rata-rata baru.\n2. Kehabisan amunisi di tahap awal penurunan.\n3. Mengabaikan *support level* teknikal.\n4. Mengabaikan biaya komisi sekuritas.\n5. Tidak memiliki rencana *stop loss* cadangan.',
    },
    {
      id: 'art-4',
      slug: 'ketentuan-baru-jam-perdagangan-dan-fraksi-harga',
      title: 'Ketentuan Jam Perdagangan & Mekanisme ARA ARB Simetris',
      category: 'Edukasi Saham',
      type: 'ARTICLE',
      author: 'Tim Analis',
      source: 'HitungSaham Edu',
      excerpt: 'Penjelasan ringkas mengenai fraksi harga resmi bursa, rentang pergerakan tick, serta persentase batas auto rejection terbaru.',
      content: 'Bursa Efek memberlakukan ketentuan fraksi harga dan batasan Auto Rejection Atas (ARA) serta Auto Rejection Bawah (ARB) untuk menjaga ketertiban transaksi.\n\n### Tabel Fraksi Harga:\n- **Harga < Rp 200**: Kelipatan Rp 1\n- **Harga Rp 200 - Rp 500**: Kelipatan Rp 2\n- **Harga Rp 500 - Rp 2.000**: Kelipatan Rp 5\n- **Harga Rp 2.000 - Rp 5.000**: Kelipatan Rp 10\n- **Harga > Rp 5.000**: Kelipatan Rp 25',
    },
    {
      id: 'art-5',
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
    await prisma.article.upsert({
      where: { id: art.id },
      update: resetSeedArticles ? { ...art, status: 'PUBLISHED' } : {},
      create: { ...art, status: 'PUBLISHED' },
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
