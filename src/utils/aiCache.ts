import { AI_MAX_CACHE_ENTRIES } from '../constants';
import type { StructuredAIResponse, LanguageCode } from '../types';

interface CacheEntry {
  response: StructuredAIResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedResponse(key: string): StructuredAIResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry.response;
}

export function setCachedResponse(key: string, response: StructuredAIResponse): void {
  if (cache.size >= AI_MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { response, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheSize(): number {
  return cache.size;
}

export function buildCacheKey(query: string, language: LanguageCode): string {
  return `${language}:${query.toLowerCase().trim()}`;
}
