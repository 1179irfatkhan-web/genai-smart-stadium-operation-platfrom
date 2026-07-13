import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedResponse, setCachedResponse, clearCache, getCacheSize, buildCacheKey } from '../utils/aiCache';

describe('AI cache', () => {
  beforeEach(() => {
    clearCache();
  });

  it('returns null for uncached keys', () => {
    expect(getCachedResponse('nonexistent')).toBeNull();
  });

  it('stores and retrieves cached responses', () => {
    setCachedResponse('test-key', 'test response', ['gates'], 0.9);
    const cached = getCachedResponse('test-key');
    expect(cached).not.toBeNull();
    expect(cached?.response).toBe('test response');
    expect(cached?.sources).toEqual(['gates']);
    expect(cached?.confidence).toBe(0.9);
  });

  it('tracks cache size', () => {
    expect(getCacheSize()).toBe(0);
    setCachedResponse('key1', 'response1', [], 0.5);
    expect(getCacheSize()).toBe(1);
    setCachedResponse('key2', 'response2', [], 0.5);
    expect(getCacheSize()).toBe(2);
  });

  it('clears all entries', () => {
    setCachedResponse('key1', 'response1', [], 0.5);
    setCachedResponse('key2', 'response2', [], 0.5);
    clearCache();
    expect(getCacheSize()).toBe(0);
  });

  it('builds consistent keys regardless of whitespace and case', () => {
    const key1 = buildCacheKey('Hello World', 'en');
    const key2 = buildCacheKey('  hello world  ', 'en');
    expect(key1).toBe(key2);
  });

  it('builds different keys for different languages', () => {
    const key1 = buildCacheKey('Hello', 'en');
    const key2 = buildCacheKey('Hello', 'es');
    expect(key1).not.toBe(key2);
  });
});
