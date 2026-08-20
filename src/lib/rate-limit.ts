type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  rateLimitEntries?: Map<string, RateLimitEntry>;
};

const entries =
  globalForRateLimit.rateLimitEntries ?? new Map<string, RateLimitEntry>();
globalForRateLimit.rateLimitEntries = entries;

export function getClientAddress(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const current = entries.get(key);

  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    current.count += 1;
    if (current.count > limit) return false;
  }

  // Keep the in-process limiter bounded even when attackers rotate addresses.
  if (entries.size > 10_000) {
    for (const [entryKey, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(entryKey);
    }
    if (entries.size > 10_000)
      entries.delete(entries.keys().next().value as string);
  }

  return true;
}
