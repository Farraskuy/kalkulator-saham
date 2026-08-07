'use client';

import React, { useEffect, useState } from 'react';

export default function DynamicDisclaimer() {
  const [terms, setTerms] = useState<string>(
    'Seluruh isi di website ini merupakan blog & catatan artikel opini pribadi pengelola, bukan berupa fakta mutlak, panduan resmi, ataupun ajakan/rekomendasi beli dan jual saham. Penggunaan kalkulator matematis murni sebagai alat bantu simulasi perhitungan independen.'
  );

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.terms) {
          setTerms(data.settings.terms);
        }
      })
      .catch(() => {
        // Fallback fallback default
      });
  }, []);

  return (
    <p className="text-[10px] leading-relaxed text-muted max-w-xl">
      <strong className="text-main font-bold">Sanggahan / Disclaimer:</strong> {terms}
    </p>
  );
}
