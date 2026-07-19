import { StructuredAIResponse } from "./types.ts";

export const MAX_QUESTION_LENGTH = 1000;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
  /you\s+are\s+(now|actually)\s+/i,
  /forget\s+(everything|all)\s+/i,
  /new\s+instructions?:/i,
  /system\s+prompt/i,
  /system\s+instructions/i,
  /reveal\s+(your|the)\s+(system|prompt|instructions)/i,
  /act\s+as\s+(if|a|an)\s+/i,
  /pretend\s+(you|to)\s+/i,
  /\b(?:DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|TRUNCATE)\s+/i,
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, MAX_QUESTION_LENGTH);
}

export function getFallbackResponse(language: string): StructuredAIResponse {
  const multilingualFallbacks: Record<string, string> = {
    es: "Aún no tengo esa información.",
    fr: "Je n'ai pas encore cette information.",
    de: "Ich habe diese Information noch nicht.",
    pt: "Ainda não tenho essa informação.",
    ar: "ليس لدي هذه المعلومات بعد.",
    zh: "我还没有这个信息。",
  };
  return {
    answer: multilingualFallbacks[language] ?? "I don't have that information yet.",
    confidence: 0,
    reasoningSummary: "No relevant stadium data available for this query.",
    recommendedActions: [],
    sources: [],
    language,
    isFallback: true,
  };
}
