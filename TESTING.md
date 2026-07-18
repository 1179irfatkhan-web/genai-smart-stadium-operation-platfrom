# Testing

StadiumIQ uses **Vitest** with **React Testing Library** and **jsdom** for a comprehensive test suite.

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `validation.test.ts` | 13 | Input validators (email, password, name, required fields) |
| `sanitization.test.ts` | 12 | HTML entity encoding, 12 prompt injection patterns, sanitizeAndValidateInput |
| `aiCache.test.ts` | 6 | LRU cache operations, buildCacheKey, eviction |
| `rateLimiter.test.ts` | 6 | Rate limiting, cooldown, clearing |
| `stadiumData.test.ts` | 15 | Context building, grounding checks |
| `aiLogic.test.ts` | 12+ | Injection rejection, fallback, Gemini success, error handling, caching, multilingual, role-aware, secret exposure |
| `edgeFunction.test.ts` | 7 | Auth, injection, grounding, role-aware, multilingual, secret exposure |
| `LoadingComponents.test.tsx` | 9 | LoadingSpinner, ErrorBoundary, Skeletons |
| `ThemeContext.test.tsx` | 6 | Theme, high contrast, large text, persistence |
| `ProtectedRoute.test.tsx` | 2 | Auth redirect, authenticated access |
| `AuthPages.test.tsx` | 9 | Login, register, demo accounts, role selection |
| `LandingPage.test.tsx` | 7 | Hero, features, Gemini section, heading hierarchy |
| `accessibility.test.tsx` | 8 | Skip link, landmarks, ARIA labels, heading hierarchy |

## AI Testing Strategy

The AI assistant is tested with a mocked `supabase.functions.invoke` to verify:

- **Prompt injection rejection**: 12 patterns blocked on client and server
- **Fallback behavior**: Ungrounded queries return deterministic fallback
- **Gemini success path**: Structured response validated and cached
- **Error fallback**: Network errors, invalid JSON, and edge function failures
- **Role-aware responses**: Fan, volunteer, venue staff, organizer get tailored answers
- **Multilingual**: 7 languages produce native-language responses
- **Secret exposure prevention**: `GEMINI_API_KEY` never appears in any response

## Mocking

- `supabase.functions.invoke` is mocked in `aiLogic.test.ts` and `edgeFunction.test.ts`
- `fetch` is stubbed for Gemini API calls
- `IntersectionObserver` is mocked in `vitest.setup.ts`
- `localStorage` is cleared between tests

## CI Integration

Tests run in CI via GitHub Actions on every push and pull request (`.github/workflows/ci.yml`).
