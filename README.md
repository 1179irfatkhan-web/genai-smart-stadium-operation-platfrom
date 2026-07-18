# StadiumIQ

**GenAI Smart Stadium Platform for FIFA World Cup 2026**

StadiumIQ is a Generative AI decision-support platform that enhances stadium operations and the tournament experience for fans, organizers, volunteers, and venue staff. It leverages Google Gemini 1.5 Flash to provide grounded, role-aware, multilingual assistance across navigation, crowd management, accessibility, transportation, and sustainability.

## Challenge 4 Alignment

StadiumIQ directly addresses **Challenge 4: GenAI-Enabled Stadium Operations**:

> Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff. The solution must leverage Generative AI to improve navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support during the FIFA World Cup 2026.

| Challenge Area | StadiumIQ Feature | Route | Users | Generative AI Role |
|----------------|-------------------|-------|-------|--------------------|
| Navigation | Smart Navigation | `/dashboard/map` | Fans, volunteers | Generates context-aware routes from structured stadium data |
| Crowd Management | Crowd Dashboard | `/dashboard/crowd` | Organizers, staff | Produces operational recommendations from live conditions |
| Accessibility | Accessibility Assistant | `/dashboard/ai` | Fans with accessibility needs | Adapts guidance based on mobility requirements |
| Transportation | Transport Planner | `/dashboard/transport` | Fans, organizers | Suggests less crowded post-match travel options |
| Sustainability | Sustainability Dashboard | `/dashboard/sustainability` | Fans, organizers | Generates context-aware sustainability recommendations |
| Multilingual Assistance | Gemini AI Assistant | `/dashboard/ai` | International fans and staff | Genuine multilingual responses in 7 languages |
| Operational Intelligence | Admin Dashboard | `/dashboard` | Organizers, staff | Converts operational data into recommended actions |
| Real-Time Decision Support | AI Recommendations | `/dashboard/ai` | Organizers, staff | Role-aware decisions from changing stadium conditions |
| Volunteer Assistance | Volunteer Dashboard | `/dashboard/tasks` | Volunteers | Prioritizes role-specific actions and task suggestions |
| Venue Operations | Facility & Alert Management | `/dashboard` | Venue staff | Assists with incident and facility response |

An in-app **Challenge Alignment** page (`/dashboard/alignment`) visualizes this mapping.

## Proof of Generative AI Integration

StadiumIQ uses **real Google Gemini 1.5 Flash** via a secure Supabase Edge Function — not keyword matching or templates.

### Architecture

1. **Frontend** (`src/utils/aiLogic.ts`) performs client-side validation, injection detection, rate limiting, caching, and grounding pre-checks, then invokes the edge function via `supabase.functions.invoke('stadium-ai')`.
2. **Edge Function** (`supabase/functions/stadium-ai/index.ts`) authenticates the user, validates input, detects injection server-side, builds a grounded prompt from structured stadium data, and calls the Gemini `generateContent` API with `responseMimeType: "application/json"`.
3. **Secrets**: `GEMINI_API_KEY` is stored ONLY in Supabase secrets — never in frontend code, `.env`, or build output.

### Structured Response Schema

```typescript
interface StructuredAIResponse {
  answer: string;
  confidence: number;          // 0..1
  reasoningSummary: string;
  recommendedActions: string[];
  sources: string[];           // e.g. ["gates", "crowd_density"]
  language: LanguageCode;       // en, es, fr, de, pt, ar, zh
  isFallback: boolean;
}
```

### Verification

- `GEMINI_MODEL = 'gemini-1.5-flash'` in `src/constants/index.ts`
- Edge function calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- Tests verify secret exposure never occurs (`edgeFunction.test.ts`)
- Tests verify role-aware, multilingual, and fallback behavior (`aiLogic.test.ts`)

## Features

- **Generative AI Assistant**: Real Gemini 1.5 Flash with grounded, role-aware, multilingual responses
- **Smart Navigation**: Interactive stadium map with gate, facility, and section lookup
- **Crowd Intelligence**: Real-time density monitoring with color-coded severity
- **Transport Hub**: Multi-modal transport planning with post-match suggestions
- **Sustainability Dashboard**: Environmental metrics and recommendations
- **Role-Based Dashboards**: Tailored views for fans, volunteers, venue staff, and organizers
- **Accessibility**: High contrast, large text, skip-to-content, ARIA labels, keyboard navigation
- **Multilingual**: 7 languages (English, Spanish, French, German, Portuguese, Arabic, Chinese)
- **Challenge Alignment Page**: In-app visualization of Challenge 4 mapping

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Generative AI**: Google Gemini 1.5 Flash
- **Testing**: Vitest, React Testing Library, jsdom
- **Code Quality**: ESLint, TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

The dev server runs automatically. Visit the URL shown in your environment.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Fan | demo.fan@stadiumiq.com | StadiumIQ2026!Demo |
| Volunteer | demo.volunteer@stadiumiq.com | StadiumIQ2026!Demo |
| Venue Staff | demo.staff@stadiumiq.com | StadiumIQ2026!Demo |
| Organizer | demo.organizer@stadiumiq.com | StadiumIQ2026!Demo |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Testing

See [TESTING.md](TESTING.md) for the full testing strategy.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system architecture and Mermaid diagrams.

## Security

- **Input validation** on client and server (max 1000 chars, HTML entity encoding)
- **Prompt injection detection**: 12 regex patterns on both client and server
- **Rate limiting**: 3-second cooldown client-side; server-side validation
- **Authentication**: Supabase Auth required for edge function; JWT verified server-side
- **Row Level Security**: All database tables use RLS with `auth.uid()` ownership checks
- **Secret management**: `GEMINI_API_KEY` stored only in Supabase secrets, never exposed to frontend
- **Fallback responses**: Deterministic fallback on any error, never exposing stack traces

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test -- --run`
5. `npm run build`

## Project Structure

```
src/
├── components/         # UI components (auth, dashboard, ai, maps, etc.)
├── contexts/           # React contexts (Auth, Theme)
├── constants/          # App constants and Challenge 4 mapping
├── lib/                # Supabase client
├── types/              # TypeScript interfaces
├── utils/              # AI logic, validation, sanitization, cache, rate limiter
└── __tests__/          # Vitest + RTL test suite
supabase/functions/
└── stadium-ai/         # Gemini edge function
docs/
└── ARCHITECTURE.md     # Architecture documentation
```

## License

MIT
