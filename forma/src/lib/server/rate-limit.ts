import { NextResponse } from "next/server";
import { headers } from "next/headers";

type TokenBucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, TokenBucket>();

const CLEANUP_INTERVAL = 60_000 * 10;
let lastCleanup = Date.now();

function cleanup(maxAge: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > maxAge) buckets.delete(key);
  }
}

type RateLimitConfig = {
  /** unique namespace so different routes don't share buckets */
  key: string;
  /** max tokens (requests) in the bucket */
  limit: number;
  /** refill window in seconds */
  windowSeconds: number;
};

export async function rateLimit(config: RateLimitConfig): Promise<NextResponse | null> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const bucketKey = `${config.key}:${ip}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  cleanup(windowMs * 2);

  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = { tokens: config.limit, lastRefill: now };
    buckets.set(bucketKey, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const refill = Math.floor((elapsed / windowMs) * config.limit);
    if (refill > 0) {
      bucket.tokens = Math.min(config.limit, bucket.tokens + refill);
      bucket.lastRefill = now;
    }
  }

  if (bucket.tokens <= 0) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(config.windowSeconds) },
      },
    );
  }

  bucket.tokens -= 1;
  return null;
}
