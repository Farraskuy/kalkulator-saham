"use client";

import React from "react";
import Link from "next/link";
import AppLogo from "./AppLogo";
import DynamicDisclaimer from "./DynamicDisclaimer";

interface FooterProps {
  variant?: "default" | "acme";
}

export default function Footer({ variant = "default" }: FooterProps) {
  const year = new Date().getFullYear();
  const [siteDescription, setSiteDescription] = React.useState(
    "Platform personal berisi kalkulator simulasi matematis saham serta artikel & blog edukasi pasar modal.",
  );

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.siteDescription) {
          setSiteDescription(data.siteDescription);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full border-t border-border-custom bg-card/60 text-main mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* BRAND COLUMN (5 cols) */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg text-main">
              <AppLogo size={26} variant="auto" />
              <span className="tracking-tight">HitungSaham</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-sm">
              {siteDescription}
            </p>
          </div>

          {/* COL 2: KALKULATOR SAHAM (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-main">
              Kalkulator Saham
            </h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li>
                <Link
                  href="/#calculator"
                  className="hover:text-main transition-colors block"
                >
                  Target Jual / Beli &amp; Fee Net
                </Link>
              </li>
              <li>
                <Link
                  href="/#calculator"
                  className="hover:text-main transition-colors block"
                >
                  Batas Auto Rejection (ARA / ARB)
                </Link>
              </li>
              <li>
                <Link
                  href="/#calculator"
                  className="hover:text-main transition-colors block"
                >
                  Simulasi Average Down &amp; Up
                </Link>
              </li>
              <li>
                <Link
                  href="/#panduan"
                  className="hover:text-main transition-colors block"
                >
                  Fraksi Harga Resmi BEI
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: ARTIKEL & PANDUAN (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-main">
              Edukasi &amp; Bantuan
            </h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-main transition-colors block"
                >
                  Blog &amp; Analisis Pasar
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-main transition-colors block"
                >
                  Pusat Bantuan &amp; FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/#panduan"
                  className="hover:text-main transition-colors block"
                >
                  Panduan Rumus Saham
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* DISCLAIMER BOX */}
        <div className="rounded-xl">
          <DynamicDisclaimer />
        </div>

        {/* COPYRIGHT & BOTTOM BAR */}
        <div className="pt-2 border-t border-border-custom/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {year} HitungSaham.com. Hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
}
