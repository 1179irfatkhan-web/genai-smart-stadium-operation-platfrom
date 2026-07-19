import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

import { verifyAuth } from "./auth.ts";
import { getCorsHeaders } from "./cors.ts";
import { checkRateLimitServer } from "./rateLimit.ts";
import {
  MAX_QUESTION_LENGTH,
  detectPromptInjection,
  sanitizeInput,
  getFallbackResponse,
} from "./validation.ts";
import { getRoleContext, buildStadiumContextStr, fetchAuthoritativeContext } from "./context.ts";
import { callGemini } from "./gemini.ts";
import type { AIRequestBody, StructuredAIResponse } from "./types.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { session, error: authError } = await verifyAuth(req);
    if (authError || !session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { user, role, supabaseService } = session;

    const body: AIRequestBody = await req.json();
    const { query, language } = body;

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

    const rateLimit = await checkRateLimitServer(supabaseService, user.id);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          answer: `Please wait ${Math.ceil(rateLimit.retryAfterMs / 1000)} seconds before sending another message.`,
          confidence: 1,
          reasoningSummary: "Rate limit active to prevent abuse.",
          recommendedActions: [],
          sources: ["rate-limiter"],
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

    const authoritativeContext = await fetchAuthoritativeContext(supabaseService);

    const stadiumContextStr = buildStadiumContextStr(authoritativeContext);
    const roleContext = getRoleContext(role);

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
