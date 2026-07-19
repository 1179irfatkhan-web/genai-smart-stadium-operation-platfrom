# Generative AI Integration and Grounding

StadiumIQ integrates Google Gemini 1.5 Flash server-side to deliver decision-support recommendations to fans, organizers, volunteers, and venue staff.

---

## 🤖 Server-Side Gemini Integration

### API Model and Endpoint
The platform uses the **`gemini-1.5-flash`** model. The API key is stored exclusively in Supabase secrets on the server and is never exposed to the client. The Edge Function issues HTTPS POST requests to the official Generative Language API endpoint:

```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}
```

### Request Structure
The payload sent to Gemini includes the following parameter configurations:
- **`temperature`**: `0.3` (restricts creative variance to prioritize factual data).
- **`topP`**: `0.8` (focuses token selection on high-probability vocabulary).
- **`topK`**: `40` (limits tokens considered to highly plausible terms).
- **`maxOutputTokens`**: `1024` (provides sufficient space for structured responses).
- **`responseMimeType`**: `"application/json"` (forces the model to respond in JSON format).

---

## 🎯 Role-Aware System Prompts

The system instructions shape the AI's persona, boundaries, response format, and role-specific focuses:
- **Fans**: Focuses on accessibility features, closest gates, restroom facilities, ticketing issues, and transit egress.
- **Volunteers**: Prioritizes shift task checklists, crowd control instructions, and reporting protocols.
- **Venue Staff**: Emphasizes maintenance tickets, operational alerts, facility details, and incident logs.
- **Organizers**: Focuses on crowd densities, volunteer locations, transit queues, match events, and redirection plans.

---

## 📐 Grounding and Stadium Context Synthesis

To prevent hallucinations, the model is strictly grounded in the database context:
1. **Telemetry Retrieval**: When a query is verified, the Edge Function queries PostgreSQL tables (`stadiums`, `gates`, `seating_sections`, `facilities`, `crowd_density`, `transportation`, `matches`, `alerts`, `volunteers`, `sustainability_metrics`).
2. **Context Compilation**: The Edge Function compiles these telemetry arrays into a structured text string.
3. **Strict Evaluation**: The system prompt instructs the model to answer **exclusively** from this context. If the requested information is not in the context, the model returns a deterministic fallback.

---

## 📋 Structured JSON Response Schema

Gemini is forced to return a JSON structure matching the following TypeScript schema:

```typescript
interface StructuredAIResponse {
  answer: string;              // The direct answer generated for the user
  confidence: number;          // Factual alignment score between 0.0 and 1.0
  reasoningSummary: string;    // Brief, grounded logic explanation (excluding chain-of-thought)
  recommendedActions: string[];// Actionable steps (role-aware guidance)
  sources: string[];           // Telemetry sources referenced (e.g., ["gates", "crowd_density"])
  language: string;            // The language code matching the query
  isFallback: boolean;          // True if context was insufficient to answer
}
```

*Note: The Edge Function validates that all response fields match these types before sending the payload back to the client.*

---

## ⚡ Client-Side Optimization: Cache, Cooldown, and Pre-check

To minimize API latency and compute costs, the client implements a three-tier optimization pipeline:

1. **Client-Side Grounding Check**: A local search scans the query for stadium-related keywords. If the query is ungrounded (e.g., asking general knowledge questions), a local fallback is returned without firing network requests.
2. **LRU Response Cache**: An in-memory Least Recently Used (LRU) cache (capped at 50 entries) stores successful responses, avoiding duplicate Gemini requests for identical queries.
3. **Memory Cooldown**: A 3-second client rate limit blocks rapid button taps, protecting both Deno server compute resources and Gemini API quotas.

---

## 🌍 Multilingual Support

The platform supports **English, Spanish, French, German, Portuguese, Arabic, and Chinese**.
- The query language code is sent to Gemini as part of the request payload.
- The model generates the response directly in the target language (avoiding machine translation artifacts).
- Fallback text matches the query language code dynamically on any error.

---

## 🚦 Telemetry Limits & Future Integrations

### Current Telemetry (Simulated)
The platform uses Supabase tables containing simulated match-day stadium data for demonstration:
- `crowd_density`: Simulates concourse congestion levels (`low`, `moderate`, `high`, `critical`).
- `gates`: Simulates entrance queue lengths and ticket validation rates.
- `facilities`: Simulates restroom and elevator status telemetry.
- `transportation`: Simulates subway/bus frequencies and rideshare queues.

### Future Production Integrations
In a production deployment, these database tables would be updated via:
- **Ticketing Systems**: Live ticket scans at gates to update arrival rates.
- **Computer Vision / LiDAR**: Camera telemetry feeds to track real-time crowd densities.
- **Municipal Transport APIs**: Real-time GPS feeds from transit authorities to track bus and subway locations.
- **IoT Sensors**: Smart waste containers and smart facility sensors to report maintenance needs.
