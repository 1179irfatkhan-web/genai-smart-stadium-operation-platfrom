import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, clearRateLimits, getRemainingCooldown } from '../utils/rateLimiter';

describe('checkRateLimit', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('allows first request', () => {
    const result = checkRateLimit('test-key');
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it('blocks second request within cooldown', () => {
    checkRateLimit('test-key');
    const result = checkRateLimit('test-key');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('allows requests for different keys independently', () => {
    checkRateLimit('key-1');
    const result = checkRateLimit('key-2');
    expect(result.allowed).toBe(true);
  });

  it('allows request after cooldown expires', () => {
    checkRateLimit('test-key', 10);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit('test-key', 10);
        expect(result.allowed).toBe(true);
        resolve();
      }, 15);
    });
  });
});

describe('getRemainingCooldown', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('returns 0 when no rate limit entry', () => {
    expect(getRemainingCooldown('no-key')).toBe(0);
  });

  it('returns positive value when within cooldown', () => {
    checkRateLimit('test-key');
    const remaining = getRemainingCooldown('test-key');
    expect(remaining).toBeGreaterThan(0);
  });
});
