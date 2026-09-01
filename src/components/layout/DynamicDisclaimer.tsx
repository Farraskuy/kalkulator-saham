"use client";

import React, { useEffect, useState } from "react";

export default function DynamicDisclaimer() {
  const [terms, setTerms] = useState<string>(
    "HitungSaham.com menyediakan informasi, edukasi, dan simulasi terkait saham dan pasar modal. Seluruh hasil perhitungan bersifat ilustrasi berdasarkan asumsi dan data tertentu, dan tidak menjamin hasil investasi di masa mendatang. Konten di situs ini bukan merupakan rekomendasi, ajakan, penawaran, atau permintaan untuk membeli atau menjual saham maupun instrumen investasi lainnya. Setiap keputusan investasi sepenuhnya menjadi tanggung jawab pengguna, dan investasi di pasar modal mengandung risiko, termasuk kemungkinan kehilangan modal.",
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.terms) {
          setTerms(data.terms);
        } else if (data.settings?.terms) {
          setTerms(data.settings.terms);
        }
      })
      .catch(() => {
        // Fallback default
      });
  }, []);

  return (
    <p className="text-[11px] leading-relaxed text-muted">
      <strong className="text-main font-semibold">Disclaimer:</strong>{" "}
      {terms}
    </p>
  );
}
