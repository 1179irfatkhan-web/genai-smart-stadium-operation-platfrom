import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedResponse, setCachedResponse, clearCache, getCacheSize, buildCacheKey } from '../utils/aiCache';
import type { StructuredAIResponse, LanguageCode } from '../types';

const mockResponse: StructuredAIResponse = {
  answer: 'test response',
  confidence: 0.9,
  reasoningSummary: 'test reasoning',
  recommendedActions: ['action1'],
  sources: ['gates'],
  language: 'en',
  isFallback: false,
};

describe('AI cache', () => {
  beforeEach(() => {
    clearCache();
  });

  it('returns null for uncached keys', () => {
    expect(getCachedResponse('nonexistent')).toBeNull();
  });

  it('stores and retrieves cached responses', () => {
    setCachedResponse('test-key', mockResponse);
    const cached = getCachedResponse('test-key');
    expect(cached).not.toBeNull();
    expect(cached?.answer).toBe('test response');
    expect(cached?.sources).toEqual(['gates']);
    expect(cached?.confidence).toBe(0.9);
  });

  it('tracks cache size', () => {
    expect(getCacheSize()).toBe(0);
    setCachedResponse('key1', mockResponse);
    expect(getCacheSize()).toBe(1);
    setCachedResponse('key2', mockResponse);
    expect(getCacheSize()).toBe(2);
  });

  it('clears all entries', () => {
    setCachedResponse('key1', mockResponse);
    setCachedResponse('key2', mockResponse);
    clearCache();
    expect(getCacheSize()).toBe(0);
  });

  it('builds consistent keys regardless of whitespace and case', () => {
    const key1 = buildCacheKey('Hello World', 'en' as LanguageCode);
    const key2 = buildCacheKey('  hello world  ', 'en' as LanguageCode);
    expect(key1).toBe(key2);
  });

  it('builds different keys for different languages', () => {
    const key1 = buildCacheKey('Hello', 'en' as LanguageCode);
    const key2 = buildCacheKey('Hello', 'es' as LanguageCode);
    expect(key1).not.toBe(key2);
  });
});
