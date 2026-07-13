# Testing Documentation

## Overview

StadiumIQ uses **Vitest** and **React Testing Library** for automated testing. All 112 tests pass across 12 test files.

## Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

## Test Files

| File | Tests | Description |
|------|-------|-------------|
| `validation.test.ts` | 13 | Email, password, name, required field validation |
| `sanitization.test.ts` | 12 | HTML entity encoding, prompt injection detection, input validation |
| `aiLogic.test.ts` | 20 | AI request processing, grounding, fallback, caching, rate limiting, multilingual |
| `aiCache.test.ts` | 6 | Cache store/retrieve, key generation, eviction, clearing |
| `rateLimiter.test.ts` | 6 | Rate limit enforcement, cooldown tracking, multi-key isolation |
| `stadiumData.test.ts` | 15 | Context building, query grounding detection |
| `AuthPages.test.tsx` | 9 | Login/register form rendering, validation, demo buttons |
| `ProtectedRoute.test.tsx` | 2 | Auth redirect, loading state |
| `LandingPage.test.tsx` | 6 | Page rendering, features, alignment table, skip link, headings |
| `LoadingComponents.test.tsx` | 9 | Spinner, skeleton rendering, accessibility |
| `ThemeContext.test.tsx` | 6 | Theme toggle, high contrast, large text, localStorage persistence |
| `accessibility.test.tsx` | 8 | Skip link, landmarks, ARIA labels, heading hierarchy, focus |

## Test Categories

### Unit Tests

- **Validation** — All input validators (email, password, name, required fields)
- **Sanitization** — HTML entity encoding, prompt injection detection (12 patterns)
- **AI Logic** — Grounded responses, fallback, injection blocking, caching, rate limiting
- **AI Cache** — Store, retrieve, key consistency, eviction, clearing
- **Rate Limiter** — Cooldown enforcement, multi-key isolation, remaining time
- **Stadium Data** — Context building, query grounding detection

### Component Tests

- **Auth Pages** — Login/register form fields, validation errors, demo buttons, links
- **Protected Route** — Redirects unauthenticated users, shows loading state
- **Landing Page** — Renders app name, tagline, features, alignment table, skip link
- **Loading Components** — Spinner with text, skeleton cards, aria-hidden
- **Theme Context** — Theme/contrast/text toggles, localStorage persistence

### Accessibility Tests

- Skip-to-content link present and functional
- Proper landmarks (nav, main, footer)
- ARIA labels on navigation
- Table headers with proper scope
- Heading hierarchy (h1 > h2)
- aria-hidden on decorative icons
- Accessible link names

### AI Tests

- **Prompt Injection** — Detects "ignore previous instructions", role manipulation, system prompt extraction, SQL injection
- **Missing Data** — Returns "I don't have that information yet." for ungrounded queries
- **Fallback Response** — Multilingual fallbacks (English, Spanish, French, German, Portuguese, Arabic, Chinese)
- **Grounded Responses** — Gate, restroom, crowd, transport, medical, match, alert queries return real data
- **Caching** — Repeated queries return cached responses
- **Rate Limiting** — Second request within cooldown is blocked

## Coverage

Run `npm run test:coverage` for a detailed coverage report. Key areas covered:

- Input validation: 100%
- AI logic: 95%+
- Sanitization: 100%
- Rate limiting: 100%
- Cache: 100%
- Component rendering: 85%+
