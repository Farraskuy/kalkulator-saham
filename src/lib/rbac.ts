export type CMSFeature =
  | "overview"
  | "articles"
  | "categories"
  | "faqs"
  | "fractions"
  | "ara_arb"
  | "taxes"
  | "settings"
  | "users";

export interface FeatureDefinition {
  id: CMSFeature;
  label: string;
  description: string;
  category: "Overview" | "Konten" | "Konfigurasi";
  path: string;
}

export const CMS_FEATURES: FeatureDefinition[] = [
  {
    id: "overview",
    label: "Dashboard",
    description:
      "Melihat ringkasan statistik kunjungan, aksi kalkulator, dan konten.",
    category: "Overview",
    path: "/admin",
  },
  {
    id: "articles",
    label: "Artikel & Blog",
    description:
      "Membuat, mengedit, mempublikasikan, dan menghapus artikel & blog.",
    category: "Konten",
    path: "/admin/articles",
  },
  {
    id: "categories",
    label: "Kategori Artikel",
    description: "Mengatur kategori artikel, nama, dan slug.",
    category: "Konten",
    path: "/admin/categories",
  },
  {
    id: "faqs",
    label: "FAQ",
    description:
      "Mengelola daftar pertanyaan dan jawaban seputar kalkulator saham.",
    category: "Konten",
    path: "/admin/faqs",
  },
  {
    id: "fractions",
    label: "Fraksi Harga BEI",
    description:
      "Mengonfigurasi rentang harga fraksi dan tick penawaran saham BEI.",
    category: "Konfigurasi",
    path: "/admin/fractions",
  },
  {
    id: "ara_arb",
    label: "Aturan ARA / ARB",
    description:
      "Mengatur persentase Auto Rejection Atas dan Bawah per papan bursa.",
    category: "Konfigurasi",
    path: "/admin/ara-arb",
  },
  {
    id: "taxes",
    label: "Pajak Transaksi",
    description:
      "Mengatur persentase tarif pajak transaksi global pada kalkulator saham.",
    category: "Konfigurasi",
    path: "/admin/taxes",
  },
  {
    id: "settings",
    label: "Pengaturan Web",
    description:
      "Mengubah deskripsi platform SEO, teks disclaimer footer dan watermark share.",
    category: "Konfigurasi",
    path: "/admin/settings",
  },
  {
    id: "users",
    label: "Manajemen Pengguna",
    description:
      "Mengelola data pengguna, peran dinamis (roles), dan hak akses per-fitur.",
    category: "Konfigurasi",
    path: "/admin/users",
  },
];

export interface DynamicRole {
  id: string;
  name: string;
  description: string;
  isProtected: boolean; // ADMIN is strictly protected
  permissions: CMSFeature[];
  createdAt?: string;
}

export const DEFAULT_DYNAMIC_ROLES: DynamicRole[] = [
  {
    id: "ADMIN",
    name: "Administrator",
    description: "Akses penuh ke seluruh modul CMS dan pengelolaan sistem.",
    isProtected: true,
    permissions: [
      "overview",
      "articles",
      "categories",
      "faqs",
      "fractions",
      "ara_arb",
      "settings",
      "users",
    ],
  },
  {
    id: "CONTENT_MANAGER",
    name: "Konten Manajemen",
    description:
      "Membuat dan mengelola artikel, blog, kategori konten, dan FAQ.",
    isProtected: false,
    permissions: ["overview", "articles", "categories", "faqs"],
  },
  {
    id: "USER",
    name: "Pengguna Publik",
    description:
      "Pengguna publik yang mendaftar via Google OAuth untuk riwayat perhitungan.",
    isProtected: true,
    permissions: [],
  },
];

export type UserRole = "ADMIN" | "CONTENT_MANAGER" | "USER" | string;

export const DEFAULT_ROLE_PERMISSIONS: Record<string, CMSFeature[]> = {
  ADMIN: [
    "overview",
    "articles",
    "categories",
    "faqs",
    "fractions",
    "ara_arb",
    "settings",
    "users",
  ],
  CONTENT_MANAGER: ["overview", "articles", "categories", "faqs"],
  USER: [],
};

export const PROTECTED_ROLES: string[] = ["ADMIN", "USER"];
