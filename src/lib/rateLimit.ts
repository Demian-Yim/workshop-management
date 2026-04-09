/**
 * Simple in-memory sliding-window rate limiter.
 * Resets on cold starts — sufficient for basic abuse prevention on a single instance.
 * For multi-instance deployments, replace with a Redis-backed solution.
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

/** Prune timestamps older than `windowMs` from the store entry. */
function prune(entry: Window, now: number, windowMs: number) {
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
}

export interface RateLimitOptions {
  /** How many requests allowed per window (default: 20). */
  limit?: number;
  /** Window length in milliseconds (default: 60_000 = 1 minute). */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix ms when the oldest request in the window expires
}

/**
 * Check and record a request for `key` (typically an IP address + route).
 * Returns whether the request is allowed and how many are remaining.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  prune(entry, now, windowMs);

  if (entry.timestamps.length >= limit) {
    const resetAt = entry.timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  const remaining = limit - entry.timestamps.length;
  const resetAt = entry.timestamps[0] + windowMs;
  return { allowed: true, remaining, resetAt };
}

/** Extract the best available IP from a Next.js request. */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}
