import { AI_FALLBACK_RESPONSE } from '../constants';
import { sanitizeAndValidateInput } from './sanitization';
import { buildStadiumDataContext, isQueryGrounded, type StadiumDataContext } from './stadiumData';
import { getCachedResponse, setCachedResponse, buildCacheKey } from './aiCache';
import { checkRateLimit } from './rateLimiter';

export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
  language: string;
  isFallback: boolean;
}

export interface AIRequestParams {
  query: string;
  language: string;
  stadiumData: StadiumDataContext;
  userId: string;
}

const FALLBACK: AIResponse = {
  content: AI_FALLBACK_RESPONSE,
  confidence: 0,
  sources: [],
  language: 'en',
  isFallback: true,
};

const INJECTION_RESPONSE: AIResponse = {
  content: 'I can only answer questions about stadium facilities, navigation, crowd, transport, and match information.',
  confidence: 1,
  sources: ['security'],
  language: 'en',
  isFallback: false,
};

const MULTILINGUAL_FALLBACKS: Record<string, string> = {
  es: 'Aún no tengo esa información.',
  fr: "Je n'ai pas encore cette information.",
  de: 'Ich habe diese Information noch nicht.',
  pt: 'Ainda não tenho essa informação.',
  ar: 'ليس لدي هذه المعلومات بعد.',
  zh: '我还没有这个信息。',
};

export function getFallbackResponse(language: string): string {
  return MULTILINGUAL_FALLBACKS[language] ?? AI_FALLBACK_RESPONSE;
}

export function processAIRequest(params: AIRequestParams): AIResponse {
  const { query, language, stadiumData, userId } = params;

  const { sanitized, isInjection, error } = sanitizeAndValidateInput(query);
  if (error || !sanitized) {
    return { ...FALLBACK, content: error ?? 'Invalid input.', language };
  }

  if (isInjection) {
    return { ...INJECTION_RESPONSE, language };
  }

  const rateLimit = checkRateLimit(`ai:${userId}`);
  if (!rateLimit.allowed) {
    return {
      content: `Please wait ${Math.ceil(rateLimit.retryAfterMs / 1000)} seconds before sending another message.`,
      confidence: 1,
      sources: ['rate-limiter'],
      language,
      isFallback: false,
    };
  }

  const cacheKey = buildCacheKey(sanitized, language);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return {
      content: cached.response,
      confidence: cached.confidence,
      sources: cached.sources,
      language,
      isFallback: false,
    };
  }

  const grounded = isQueryGrounded(sanitized, stadiumData);
  if (!grounded) {
    const fallback = getFallbackResponse(language);
    return { ...FALLBACK, content: fallback, language };
  }

  const context = buildStadiumDataContext(stadiumData);
  const response = generateGroundedResponse(sanitized, context, stadiumData, language);
  setCachedResponse(cacheKey, response.content, response.sources, response.confidence);

  return response;
}

function generateGroundedResponse(
  query: string,
  _context: string,
  data: StadiumDataContext,
  language: string,
): AIResponse {
  const lower = query.toLowerCase();
  const sources: string[] = [];

  let response = '';
  let confidence = 0.7;

  if (lower.includes('gate') || lower.includes('entrance')) {
    const openGates = data.gates.filter((g) => g.status === 'open');
    const lowQueueGates = openGates.sort((a, b) => a.current_queue - b.current_queue).slice(0, 3);
    response = `Based on current data, the least crowded gates are: ${lowQueueGates.map((g) => `${g.name} (queue: ${g.current_queue})`).join(', ')}. `;
    sources.push('gates');
    confidence = 0.9;
  } else if (lower.includes('restroom') || lower.includes('toilet')) {
    const restrooms = data.facilities.filter((f) => f.type === 'restroom' && f.status === 'operational');
    const accessible = restrooms.filter((f) => f.is_accessible);
    response = `There are ${restrooms.length} operational restrooms${accessible.length > 0 ? `, including ${accessible.length} accessible ones` : ''}. `;
    sources.push('facilities');
    confidence = 0.9;
  } else if (lower.includes('food') || lower.includes('eat') || lower.includes('drink')) {
    const foodStalls = data.facilities.filter((f) => f.type === 'food_stall' || f.type === 'beverage');
    response = `Available food and beverage options: ${foodStalls.map((f) => f.name).join(', ') || 'none currently listed'}. `;
    sources.push('facilities');
    confidence = 0.85;
  } else if (lower.includes('crowd') || lower.includes('busy') || lower.includes('density')) {
    const critical = data.crowdDensity.filter((c) => c.density_level === 'critical' || c.density_level === 'high');
    response = critical.length > 0
      ? `High-density zones to avoid: ${critical.map((c) => c.zone_name).join(', ')}. `
      : 'All zones are currently at manageable crowd levels. ';
    sources.push('crowd_density');
    confidence = 0.9;
  } else if (lower.includes('transport') || lower.includes('bus') || lower.includes('metro') || lower.includes('parking')) {
    const transport = data.transportation;
    response = `Transport options: ${transport.map((t) => `${t.name} (${t.type}, availability: ${t.current_availability ?? 'unknown'})`).join(', ') || 'no transport data available'}. `;
    sources.push('transportation');
    confidence = 0.85;
  } else if (lower.includes('medical') || lower.includes('emergency') || lower.includes('first aid')) {
    const medical = data.facilities.filter((f) => f.type === 'medical_center' || f.type === 'first_aid');
    response = medical.length > 0
      ? `Medical facilities: ${medical.map((f) => `${f.name} (${f.location ?? 'location unknown'})`).join(', ')}. `
      : 'Contact nearest staff for medical assistance. ';
    sources.push('facilities');
    confidence = 0.9;
  } else if (lower.includes('water')) {
    const water = data.facilities.filter((f) => f.type === 'water_refill');
    response = `Water refill stations: ${water.map((f) => f.name).join(', ') || 'none listed'}. `;
    sources.push('facilities');
    confidence = 0.85;
  } else if (lower.includes('match') || lower.includes('game') || lower.includes('schedule')) {
    const liveMatches = data.matches.filter((m) => m.status === 'live');
    const upcoming = data.matches.filter((m) => m.status === 'scheduled');
    response = liveMatches.length > 0
      ? `Live now: ${liveMatches.map((m) => `${m.home_team} vs ${m.away_team}`).join(', ')}. `
      : upcoming.length > 0
        ? `Next match: ${upcoming[0].home_team} vs ${upcoming[0].away_team}. `
        : 'No matches scheduled. ';
    sources.push('matches');
    confidence = 0.9;
  } else if (lower.includes('alert') || lower.includes('warning')) {
    const active = data.alerts.filter((a) => !a.is_resolved);
    response = active.length > 0
      ? `Active alerts: ${active.map((a) => `${a.title} (${a.severity})`).join(', ')}. `
      : 'No active alerts. ';
    sources.push('alerts');
    confidence = 0.9;
  } else if (lower.includes('accessib')) {
    const accessibleGates = data.gates.filter((g) => g.is_accessible);
    const accessibleFacilities = data.facilities.filter((f) => f.is_accessible);
    response = `Accessible gates: ${accessibleGates.map((g) => g.name).join(', ') || 'none listed'}. Accessible facilities: ${accessibleFacilities.map((f) => f.name).join(', ') || 'none listed'}. `;
    sources.push('gates', 'facilities');
    confidence = 0.85;
  } else {
    response = getFallbackResponse(language);
    confidence = 0;
  }

  if (language !== 'en' && confidence > 0) {
    response = `[${language.toUpperCase()}] ${response}`;
  }

  return { content: response, confidence, sources, language, isFallback: false };
}
