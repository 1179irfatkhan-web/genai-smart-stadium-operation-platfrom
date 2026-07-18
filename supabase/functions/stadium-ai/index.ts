import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const MAX_QUESTION_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 3000;
const MAX_RETRIES = 2;

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

interface StadiumContext {
  stadiumName: string;
  gates: unknown[];
  seatingSections: unknown[];
  facilities: unknown[];
  crowdDensity: unknown[];
  transportation: unknown[];
  matches: unknown[];
  alerts: unknown[];
  volunteers: unknown[];
  sustainabilityMetrics: unknown[];
}

interface AIRequestBody {
  query: string;
  language: string;
  role: string;
  stadiumContext: StadiumContext;
}

interface StructuredAIResponse {
  answer: string;
  confidence: number;
  reasoningSummary: string;
  recommendedActions: string[];
  sources: string[];
  language: string;
  isFallback: boolean;
}

const SYSTEM_PROMPT = `You are StadiumIQ, a Generative AI decision-support assistant for FIFA World Cup 2026 stadium operations. Answer exclusively from the provided stadium data. Support fans, volunteers, venue staff and organizers. Prioritize safety, accessibility and operational accuracy. Do not invent locations or live conditions. When information is unavailable, state that you do not have that information.

You must respond with valid JSON only, no markdown, no code fences. The JSON must match this schema exactly:
{
  "answer": "string - your response to the user",
  "confidence": "number between 0 and 1",
  "reasoningSummary": "string - brief explanation based only on available data",
  "recommendedActions": ["string - actionable steps if applicable"],
  "sources": ["string - data sources used, e.g. gates, crowd_density, facilities"],
  "language": "string - the language code of your response",
  "isFallback": "boolean - true if you don't have enough data"
}

Rules:
- Never invent gates, facilities, transport points, or incidents that are not in the provided data.
- If the question is outside the scope of stadium operations, respond with isFallback: true and answer: "I don't have that information yet."
- For non-English languages, generate a genuine response in that language, not a translation tag.
- Provide role-aware recommendations: fans get navigation, volunteers get tasks, organizers get crowd management, venue staff get facility status.
- Keep reasoningSummary brief and user-facing, never expose internal chain-of-thought.
- confidence should reflect how well the available data answers the question.`;

function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, MAX_QUESTION_LENGTH);
}

function getFallbackResponse(language: string): StructuredAIResponse {
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

function getRoleContext(role: string): string {
  const roleContexts: Record<string, string> = {
    fan: "The user is a FAN. Focus on: navigation, seats, gates, restrooms, medical help, accessibility, transport.",
    volunteer: "The user is a VOLUNTEER. Focus on: assigned tasks, crowd support, incident handling, suggested actions.",
    venue_staff: "The user is VENUE STAFF. Focus on: facility status, operational alerts, incident response.",
    organizer: "The user is an ORGANIZER. Focus on: crowd redirection, volunteer deployment, congestion response, transport planning, operational intelligence.",
  };
  return roleContexts[role] ?? roleContexts.fan;
}

async function callGemini(
  query: string,
  stadiumContextStr: string,
  roleContext: string,
  language: string,
  apiKey: string,
): Promise<StructuredAIResponse> {
  const userPrompt = `Language: ${language}
User Role: ${roleContext}

Stadium Data:
${stadiumContextStr}

User Question: ${query}

Respond with valid JSON only.`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `${GEMINI_API_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      const parsed = JSON.parse(text) as Partial<StructuredAIResponse>;

      const validated: StructuredAIResponse = {
        answer: typeof parsed.answer === "string" ? parsed.answer : "I don't have that information yet.",
        confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
        reasoningSummary: typeof parsed.reasoningSummary === "string" ? parsed.reasoningSummary : "",
        recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions.filter((a): a is string => typeof a === "string") : [],
        sources: Array.isArray(parsed.sources) ? parsed.sources.filter((s): s is string => typeof s === "string") : [],
        language: typeof parsed.language === "string" ? parsed.language : language,
        isFallback: typeof parsed.isFallback === "boolean" ? parsed.isFallback : false,
      };

      return validated;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  console.error("Gemini API failed after retries:", lastError?.message);
  return getFallbackResponse(language);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      },
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: AIRequestBody = await req.json();
    const { query, language, role, stadiumContext } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (query.length > MAX_QUESTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query too long. Maximum ${MAX_QUESTION_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const sanitized = sanitizeInput(query);

    if (detectPromptInjection(sanitized)) {
      return new Response(
        JSON.stringify({
          answer: "I can only answer questions about stadium facilities, navigation, crowd, transport, and match information.",
          confidence: 1,
          reasoningSummary: "Query was identified as a potential prompt injection attempt.",
          recommendedActions: [],
          sources: ["security"],
          language,
          isFallback: false,
        } satisfies StructuredAIResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not configured");
      return new Response(
        JSON.stringify(getFallbackResponse(language)),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contextParts: string[] = [`Stadium: ${stadiumContext?.stadiumName ?? "Unknown"}`];

    if (stadiumContext?.gates?.length) {
      contextParts.push(`Gates: ${JSON.stringify(stadiumContext.gates)}`);
    }
    if (stadiumContext?.seatingSections?.length) {
      contextParts.push(`Seating: ${JSON.stringify(stadiumContext.seatingSections)}`);
    }
    if (stadiumContext?.facilities?.length) {
      contextParts.push(`Facilities: ${JSON.stringify(stadiumContext.facilities)}`);
    }
    if (stadiumContext?.crowdDensity?.length) {
      contextParts.push(`Crowd Density: ${JSON.stringify(stadiumContext.crowdDensity)}`);
    }
    if (stadiumContext?.transportation?.length) {
      contextParts.push(`Transportation: ${JSON.stringify(stadiumContext.transportation)}`);
    }
    if (stadiumContext?.matches?.length) {
      contextParts.push(`Matches: ${JSON.stringify(stadiumContext.matches)}`);
    }
    if (stadiumContext?.alerts?.length) {
      contextParts.push(`Alerts: ${JSON.stringify(stadiumContext.alerts)}`);
    }
    if (stadiumContext?.volunteers?.length) {
      contextParts.push(`Volunteers: ${JSON.stringify(stadiumContext.volunteers)}`);
    }
    if (stadiumContext?.sustainabilityMetrics?.length) {
      contextParts.push(`Sustainability: ${JSON.stringify(stadiumContext.sustainabilityMetrics)}`);
    }

    const stadiumContextStr = contextParts.join("\n");
    const roleContext = getRoleContext(role ?? "fan");

    const response = await callGemini(sanitized, stadiumContextStr, roleContext, language, geminiApiKey);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({
        answer: "I don't have that information yet.",
        confidence: 0,
        reasoningSummary: "An error occurred processing your request.",
        recommendedActions: [],
        sources: [],
        language: "en",
        isFallback: true,
      } satisfies StructuredAIResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
