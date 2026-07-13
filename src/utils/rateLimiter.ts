import { AI_RATE_LIMIT_MS } from '../constants';

interface RateLimitEntry {
  lastRequest: number;
  requestCount: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  windowMs: number = AI_RATE_LIMIT_MS,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { lastRequest: now, requestCount: 1 });
    return { allowed: true, retryAfterMs: 0 };
  }

  const elapsed = now - entry.lastRequest;
  if (elapsed < windowMs) {
    return {
      allowed: false,
      retryAfterMs: windowMs - elapsed,
    };
  }

  rateLimitMap.set(key, { lastRequest: now, requestCount: entry.requestCount + 1 });
  return { allowed: true, retryAfterMs: 0 };
}

export function clearRateLimits(): void {
  rateLimitMap.clear();
}

export function getRemainingCooldown(key: string): number {
  const entry = rateLimitMap.get(key);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.lastRequest;
  const remaining = AI_RATE_LIMIT_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}
