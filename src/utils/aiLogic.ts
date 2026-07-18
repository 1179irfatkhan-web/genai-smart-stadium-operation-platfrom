import { supabase } from '../lib/supabase';
import { AI_FALLBACK_RESPONSE } from '../constants';
import { sanitizeAndValidateInput } from './sanitization';
import { getCachedResponse, setCachedResponse, buildCacheKey } from './aiCache';
import { checkRateLimit } from './rateLimiter';
import { isQueryGrounded, type StadiumDataContext } from './stadiumData';
import type { StructuredAIResponse, LanguageCode, UserRole } from '../types';

const FALLBACK_RESPONSE: StructuredAIResponse = {
  answer: AI_FALLBACK_RESPONSE,
  confidence: 0,
  reasoningSummary: 'No relevant stadium data available for this query.',
  recommendedActions: [],
  sources: [],
  language: 'en',
  isFallback: true,
};

const MULTILINGUAL_FALLBACKS: Record<string, string> = {
  es: 'Aún no tengo esa información.',
  fr: "Je n'ai pas encore cette information.",
  de: 'Ich habe diese Information noch nicht.',
  pt: 'Ainda não tenho essa informação.',
  ar: 'ليس لدي هذه المعلومات بعد.',
  zh: '我还没有这个信息。',
};

export function getFallbackResponse(language: LanguageCode): StructuredAIResponse {
  const fallbackText = MULTILINGUAL_FALLBACKS[language] ?? AI_FALLBACK_RESPONSE;
  return { ...FALLBACK_RESPONSE, answer: fallbackText, language };
}

export interface AIRequestParams {
  query: string;
  language: LanguageCode;
  stadiumData: StadiumDataContext;
  userId: string;
  userRole: UserRole;
}

/**
 * Processes an AI request through the secure server-side Gemini Edge Function.
 *
 * Flow:
 * 1. Client-side input validation and sanitization
 * 2. Client-side prompt injection detection
 * 3. Client-side rate limiting (prevents unnecessary network calls)
 * 4. Client-side cache check (avoids redundant Gemini calls)
 * 5. Client-side grounding check (returns fallback for ungrounded queries)
 * 6. Server-side Supabase Edge Function call with authenticated session
 * 7. Structured response validation and cache storage
 * 8. Deterministic fallback on any error
 */
export async function processAIRequest(params: AIRequestParams): Promise<StructuredAIResponse> {
  const { query, language, stadiumData, userId, userRole } = params;

  const { sanitized, isInjection, error } = sanitizeAndValidateInput(query);
  if (error || !sanitized) {
    return { ...FALLBACK_RESPONSE, answer: error ?? 'Invalid input.', language };
  }

  if (isInjection) {
    return {
      answer: 'I can only answer questions about stadium facilities, navigation, crowd, transport, and match information.',
      confidence: 1,
      reasoningSummary: 'Query was identified as a potential prompt injection attempt.',
      recommendedActions: [],
      sources: ['security'],
      language,
      isFallback: false,
    };
  }

  const rateLimit = checkRateLimit(`ai:${userId}`);
  if (!rateLimit.allowed) {
    return {
      answer: `Please wait ${Math.ceil(rateLimit.retryAfterMs / 1000)} seconds before sending another message.`,
      confidence: 1,
      reasoningSummary: 'Rate limit active to prevent abuse.',
      recommendedActions: [],
      sources: ['rate-limiter'],
      language,
      isFallback: false,
    };
  }

  const cacheKey = buildCacheKey(sanitized, language);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const grounded = isQueryGrounded(sanitized, stadiumData);
  if (!grounded) {
    const fallback = getFallbackResponse(language);
    setCachedResponse(cacheKey, fallback);
    return fallback;
  }

  try {
    const { data, error } = await supabase.functions.invoke('stadium-ai', {
      body: {
        query: sanitized,
        language,
        role: userRole,
        stadiumContext: stadiumData,
      },
    });

    if (error) {
      const fallback = getFallbackResponse(language);
      return fallback;
    }

    const response = data as StructuredAIResponse;
    if (!response || typeof response.answer !== 'string') {
      return getFallbackResponse(language);
    }

    const validated: StructuredAIResponse = {
      answer: response.answer,
      confidence: typeof response.confidence === 'number' ? response.confidence : 0.5,
      reasoningSummary: response.reasoningSummary ?? '',
      recommendedActions: Array.isArray(response.recommendedActions) ? response.recommendedActions : [],
      sources: Array.isArray(response.sources) ? response.sources : [],
      language: response.language ?? language,
      isFallback: response.isFallback ?? false,
    };

    setCachedResponse(cacheKey, validated);
    return validated;
  } catch {
    return getFallbackResponse(language);
  }
}
