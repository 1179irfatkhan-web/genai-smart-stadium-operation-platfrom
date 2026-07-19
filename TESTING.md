# Testing Strategy and Architecture

StadiumIQ uses **Vitest** with **React Testing Library** and **jsdom** for verification. 

---

## 🧪 Test Architecture

All tests are implemented in the `src/__tests__/` directory. The test files are structured as follows:

| File | Tests | Coverage Scope |
| :--- | :--- | :--- |
| [security.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/security.test.ts) | 9 | Unit tests for server-side code: CORS method/origin checks, Bearer JWT validation, zero-trust role fetching via service client, and atomic rate limit RPC triggers with database fallbacks. |
| [ChallengeAlignmentPage.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/ChallengeAlignmentPage.test.tsx) | 5 | Verification of the Challenge 4 alignment page, including headings, mapping grids, interactive tab selectors, and simulated data warning cards. |
| [edgeFunction.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/edgeFunction.test.ts) | 10 | Frontend integration tests validating response mapping for 401 unauthorized, 405 method not allowed, 429 rate limits, role-based outputs, multilingual outputs, and prompt-injection flags. |
| [aiLogic.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/aiLogic.test.ts) | 18 | Deep validation of `processAIRequest` including caching mechanisms, input validations, injection pattern blocks, and grounding checks. |
| [stadiumData.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/stadiumData.test.ts) | 15 | Verifies stadium context syntax construction and determines if queries are grounded. |
| [sanitization.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/sanitization.test.ts) | 12 | Validates HTML entity encoding and blocks 12 distinct prompt injection payloads. |
| [validation.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/validation.test.ts) | 13 | Tests email validation, password strengths, and empty field sanitizations. |
| [rateLimiter.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/rateLimiter.test.ts) | 6 | Checks client-side 3-second cooldown behaviors. |
| [aiCache.test.ts](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/aiCache.test.ts) | 6 | Verifies LRU cache hit, miss, eviction, and size control operations. |
| [AuthPages.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/AuthPages.test.tsx) | 9 | Tests Login/Register forms, demo account buttons, and role validations. |
| [LandingPage.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/LandingPage.test.tsx) | 7 | Verifies hero layouts, features, and header tags. |
| [accessibility.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/accessibility.test.tsx) | 8 | Validates skip links, landmark regions, accessibility roles, and label associations. |
| [LoadingComponents.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/LoadingComponents.test.tsx) | 9 | Verifies error boundary triggers, spinners, and dashboard skeletons. |
| [ThemeContext.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/ThemeContext.test.tsx) | 6 | Validates high-contrast mode, persistent local settings, and size selections. |
| [ProtectedRoute.test.tsx](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/__tests__/ProtectedRoute.test.tsx) | 2 | Ensures unauthorized visitors are redirected to the log in panel. |

**Total verified test cases: 135**

---

## ⚙️ Running Tests Locally

Use the following commands inside the project root:

```bash
npm test              # Run the full test suite once (Vitest runs in CI/single-run mode)
npm run test:watch    # Start the test runner in watch mode for development
npm run test:coverage # Generate a coverage report for all source files
```

---

## 🤖 CI Integration

Every push or pull request triggers the GitHub Actions CI pipeline (`.github/workflows/ci.yml`), which executes:

1. **Dependency Installation**: `npm ci`
2. **Lint Audit**: `npm run lint` (ESLint strict verification with `--max-warnings 0`)
3. **Type check validation**: `npm run typecheck` (`tsc --noEmit`)
4. **Test run execution**: `npm test`
5. **Production Build**: `npm run build`
