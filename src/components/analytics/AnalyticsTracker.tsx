"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Record page view analytics
    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    fetch("/api/analytics/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: url,
        referrer: document.referrer || "Direct",
      }),
      keepalive: true,
    }).catch(() => {
      // ignore
    });
  }, [pathname, searchParams]);

  return null;
}
