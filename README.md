# StadiumIQ — Smart Stadium Platform for FIFA World Cup 2026

AI-powered smart stadium management platform designed for the FIFA World Cup 2026, addressing navigation, crowd management, accessibility, transportation, and sustainability challenges.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Testing](#testing)
- [Problem Statement Alignment](#problem-statement-alignment)
- [Accessibility](#accessibility)
- [Security](#security)
- [Performance](#performance)
- [Deployment](#deployment)

## Overview

StadiumIQ is a comprehensive smart stadium platform that leverages AI (Google Gemini), real-time data, and accessible design to enhance the fan experience during FIFA World Cup 2026. The platform serves four user roles: Fans, Volunteers, Venue Staff, and Organizers — each with role-specific dashboards and capabilities.

## Features

- **Smart Navigation** — Interactive stadium map with gates, facilities, and crowd density
- **Crowd Intelligence** — Real-time crowd density monitoring across all stadium zones
- **AI Assistant** — Gemini-powered multilingual assistant grounded in stadium data
- **Transport Planner** — Live transportation options with availability tracking
- **Sustainability Dashboard** — Environmental impact tracking (water, energy, waste)
- **Accessibility** — High contrast mode, large text mode, skip-to-content, ARIA labels
- **Role-Based Dashboards** — Fan, Volunteer, Venue Staff, and Organizer views
- **Authentication** — Supabase-powered email/password auth with auto-profile creation

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| AI | Google Gemini (via edge function) |
| Testing | Vitest, React Testing Library |
| Linting | ESLint, TypeScript |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React UI  │────▶│  AuthContext │────▶│  Supabase   │
│  (Lazy Load)│     │  ThemeContext│     │  Auth + DB  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                          │
       ▼                                          ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  AI Assistant│────▶│  aiLogic.ts  │────▶│  Stadium DB │
│  (Grounded) │     │  Cache + RL  │     │  (RLS)      │
└─────────────┘     └──────────────┘     └─────────────┘
```

### AI Flow

1. User submits query → input sanitized and validated
2. Prompt injection detection → blocks malicious prompts
3. Rate limiting check → 3s cooldown per user
4. Cache check → returns cached response if available
5. Grounding check → verifies query relates to stadium data
6. Response generation → structured from real DB data
7. Fallback → "I don't have that information yet." for ungrounded queries

### Authentication Flow

1. User signs up with email/password → Supabase Auth
2. DB trigger `handle_new_user()` auto-creates profile row
3. `fetchProfile()` retries with backoff until profile exists
4. `ProtectedRoute` checks auth + role before rendering
5. Role-specific dashboard renders based on `profile.role`

## Folder Structure

```
src/
├── components/
│   ├── ai/              # AI Assistant component
│   ├── auth/            # Login, Register, ProtectedRoute
│   ├── common/          # LoadingSpinner, ErrorBoundary, Skeletons
│   ├── crowd/           # CrowdIntelligence dashboard
│   ├── dashboard/       # DashboardLayout, FanDashboard
│   ├── landing/         # HeroSection (landing page)
│   ├── maps/            # StadiumMap component
│   ├── organizer/       # OrganizerDashboard
│   ├── sustainability/  # SustainabilityDashboard
│   ├── transport/       # TransportHub
│   └── volunteer/       # VolunteerDashboard
├── contexts/
│   ├── AuthContext.tsx  # Auth state + demo accounts
│   └── ThemeContext.tsx # Theme + accessibility toggles
├── constants/           # App constants, demo accounts, mappings
├── lib/                 # Supabase client
├── types/               # TypeScript interfaces
├── utils/               # Validation, sanitization, AI logic, cache, rate limiter
└── __tests__/           # Test files (12 test suites, 112 tests)
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key (server-side only) | For AI |

**Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client code.**

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Fan | demo.fan@stadiumiq.com | StadiumIQ2026!Demo |
| Volunteer | demo.volunteer@stadiumiq.com | StadiumIQ2026!Demo |
| Venue Staff | demo.staff@stadiumiq.com | StadiumIQ2026!Demo |
| Organizer | demo.organizer@stadiumiq.com | StadiumIQ2026!Demo |

Demo accounts are auto-created on first login attempt.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

See [TESTING.md](./TESTING.md) for detailed test documentation.

**Test Coverage: 12 test files, 112 tests, all passing.**

## Problem Statement Alignment

| Challenge | StadiumIQ Feature | Status |
|-----------|-------------------|--------|
| Navigation | Smart Navigation | Implemented |
| Crowd Management | Crowd Dashboard | Implemented |
| Accessibility | Accessibility Assistant | Implemented |
| Transportation | Transport Planner | Implemented |
| Operational Intelligence | Admin Dashboard | Implemented |
| Multilingual | Gemini AI | Implemented |
| Real-Time Decision Support | AI Recommendations | Implemented |
| Sustainability | Sustainability Dashboard | Implemented |

## Accessibility

- **Skip-to-content** link on all pages
- **High contrast mode** toggle in dashboard header
- **Large text mode** toggle in dashboard header
- **ARIA labels** on all interactive elements
- **Keyboard navigation** — all features accessible via keyboard
- **Visible focus indicators** — 3px outline on all focusable elements
- **Screen reader support** — semantic HTML, ARIA roles, live regions
- **Reduced motion** — respects `prefers-reduced-motion`

## Security

- **RLS enabled** on all database tables
- **Prompt injection protection** — 12 detection patterns
- **Input sanitization** — HTML entity encoding, length limits
- **Rate limiting** — 3-second cooldown on AI requests
- **Role-based access control** — route protection + DB policies
- **SECURITY DEFINER** trigger with locked `search_path`
- **EXECUTE revoked** from anon/authenticated on trigger function
- **No secrets in client code** — only public anon key exposed

## Performance

- **Lazy loading** — all dashboard pages loaded on demand
- **Code splitting** — manual chunks for vendor, supabase, motion, icons
- **AI response caching** — 50-entry LRU cache for repeated queries
- **Skeleton loading** — prevents layout shift during data fetches
- **React.memo, useCallback, useMemo** — reduces unnecessary re-renders
- **Bundle size** — main chunk <12KB gzipped, largest page <5KB gzipped

## Deployment

The app is built with Vite and can be deployed to any static hosting provider:

```bash
npm run build
# Deploy the dist/ directory
```

## License

This project is built for the Hack2Skill AI Hackathon — FIFA World Cup 2026 challenge.
