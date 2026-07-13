import { AI_MAX_CACHE_ENTRIES } from '../constants';

interface CacheEntry {
  response: string;
  timestamp: number;
  sources: string[];
  confidence: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedResponse(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry;
}

export function setCachedResponse(
  key: string,
  response: string,
  sources: string[],
  confidence: number,
): void {
  if (cache.size >= AI_MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { response, timestamp: Date.now(), sources, confidence });
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheSize(): number {
  return cache.size;
}

export function buildCacheKey(query: string, language: string): string {
  return `${language}:${query.toLowerCase().trim()}`;
}
