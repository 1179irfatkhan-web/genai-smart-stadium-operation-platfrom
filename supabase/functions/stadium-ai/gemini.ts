import { StructuredAIResponse } from "./types.ts";
import { getFallbackResponse } from "./validation.ts";

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_RETRIES = 2;

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

export async function callGemini(
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
