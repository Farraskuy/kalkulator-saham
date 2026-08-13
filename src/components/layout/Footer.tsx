'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from './AppLogo';
import DynamicDisclaimer from './DynamicDisclaimer';

interface FooterProps {
  variant?: 'default' | 'acme';
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const isAcme = variant === 'acme';
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-page text-main border-t border-border-custom/50 mt-16 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* BRAND COLUMN */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-lg text-main">
              <AppLogo size={24} variant="auto" />
              <span>HitungSaham</span>
            </div>
            <p className="text-xs text-muted max-w-sm leading-relaxed font-medium">
              Platform personal berisi kalkulator simulasi matematis saham serta artikel &amp; blog opini pribadi.
            </p>
          </div>

          {/* NAV COLUMNS */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="font-bold text-main mb-3 text-xs">
                Kalkulator Saham
              </div>
              <ul className="space-y-2.5 text-muted font-medium">
                <li>
                  <Link href="/#calculator" className="hover:text-main transition-colors">
                    Prediksi Target Jual/Beli
                  </Link>
                </li>
                <li>
                  <Link href="/#calculator" className="hover:text-main transition-colors">
                    Auto Rejection (ARA/ARB)
                  </Link>
                </li>
                <li>
                  <Link href="/#calculator" className="hover:text-main transition-colors">
                    Average Up / Down
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-main transition-colors">
                    Pertanyaan Umum (FAQ)
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-main mb-3 text-xs">
                Jurnal &amp; Navigasi
              </div>
              <ul className="space-y-2.5 text-muted font-medium">
                <li>
                  <Link href="/blog" className="hover:text-main transition-colors">
                    Blog &amp; Artikel
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-main transition-colors">
                    Pusat Bantuan &amp; FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-main transition-colors">
                    Admin Panel CMS
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-main mb-3 text-xs">
                Profil Pengelola
              </div>
              <p className="text-xs text-muted leading-relaxed font-medium">
                Dikelola secara mandiri sebagai ruang berbagi catatan artikel opini pribadi dan penyedia alat kalkulasi matematis saham.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION (CENTERED COPYRIGHT & DISCLAIMER) */}
        <div className="pt-6 border-t border-border-custom/40 flex flex-col items-center justify-center text-center space-y-2 text-[11px] text-muted font-medium">
          <div>
            &copy; {year} HitungSaham.com • Catatan &amp; Kalkulator Saham
          </div>
          <div className="max-w-2xl text-[10px] leading-relaxed">
            <DynamicDisclaimer />
          </div>
        </div>
      </div>
    </footer>
  );
}
