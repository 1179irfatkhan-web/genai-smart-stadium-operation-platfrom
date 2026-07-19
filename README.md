# StadiumIQ

**GenAI Smart Stadium Platform for FIFA World Cup 2026**

StadiumIQ is a Generative AI decision-support platform designed to enhance stadium operations and the overall tournament experience for fans, organizers, volunteers, and venue staff. It leverages Google Gemini 1.5 Flash to provide grounded, role-aware, and multilingual assistance across navigation, crowd management, accessibility, transportation, and sustainability.

---

## 🎯 FIFA World Cup 2026 Challenge 4 Alignment

StadiumIQ directly addresses **Challenge 4: GenAI-Enabled Stadium Operations**:

> *"Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff. The solution must leverage Generative AI to improve navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support during the FIFA World Cup 2026."*

An in-app **Challenge Alignment** matrix page is available at `/dashboard/alignment` to visualize this mapping.

### Requirement-to-Feature Mapping

| Challenge Area | Existing StadiumIQ Feature | Target Users | GenAI Role & Contribution | Working Module Link |
| :--- | :--- | :--- | :--- | :--- |
| **Navigation** | Interactive Stadium Map | Fans, Volunteers | Generates grounded path directions based on live queue times and user profile constraints. | [/dashboard/map](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/maps/StadiumMap.tsx) |
| **Crowd Management** | Crowd Density Heatmap & Telemetry | Organizers, Venue Staff | Analyzes critical crowd density levels to formulate volunteer dispatch suggestions. | [/dashboard/crowd](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/crowd/CrowdIntelligence.tsx) |
| **Accessibility** | Accessibility AI Assistant | Fans with accessibility needs | Adapts guidance to physical requirements, highlighting step-free paths and elevators. | [/dashboard/ai](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/ai/AIAssistant.tsx) |
| **Transportation** | Transit Hub Dashboard | Fans, Organizers | Suggests optimal post-match travel times and routes to avoid peak egress crowd surges. | [/dashboard/transport](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/transport/TransportHub.tsx) |
| **Sustainability** | Sustainability Metrics Tracker | Fans, Organizers | Recommends dynamic recycling and operational instructions based on live attendance. | [/dashboard/sustainability](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/sustainability/SustainabilityDashboard.tsx) |
| **Multilingual Assistance** | Multilingual Gemini AI | International Fans & Staff | Generates native response JSON in English, Spanish, French, German, Portuguese, Arabic, and Chinese. | [/dashboard/ai](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/ai/AIAssistant.tsx) |
| **Operational Intelligence** | Unified Organizer Dashboard | Tournament Organizers | Synthesizes multi-source telemetry to recommend cross-functional mitigations. | [/dashboard](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/organizer/OrganizerDashboard.tsx) |
| **Real-Time Decision Support**| AI Recommendations Feed | Organizers, Staff | Combines active match events, unresolved alerts, and density levels into prioritized actions. | [/dashboard/ai](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/ai/AIAssistant.tsx) |
| **Volunteer Assistance** | Volunteer Tasks & Shifts | Event Volunteers | Customizes concourse duties based on the volunteer's assigned shift zone. | [/dashboard/tasks](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/volunteer/VolunteerDashboard.tsx) |
| **Venue Operations** | Facilities Status Tracker | Venue Staff | Prioritizes facility repair work orders based on telemetry alert severities. | [/dashboard](file:///c:/Users/admin/Desktop/genai-smart-stadium-operation-platfrom/src/components/organizer/OrganizerDashboard.tsx) |

---

## 🏗️ Technical Architecture Overview

StadiumIQ is built on a split client-server architecture using React, Supabase, and Google Gemini AI.

```
Client (React + Vite) ──(HTTPS)──> Supabase Edge Function (Deno) ──(HTTPS)──> Google Gemini API
                                        │
                                        └──> Supabase DB (PostgreSQL + RLS)
```

For system topologies, sequential diagrams, and data flows, check [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

For GenAI design, role-aware prompts, caching details, and fallback behaviors, check [docs/GENAI.md](docs/GENAI.md).

For authentication, service role lookup, atomic rate limiting, and CORS parameters, check [docs/SECURITY.md](docs/SECURITY.md).

---

## 🚦 Simulated Data Boundaries

To support immediate verification without localized IoT hardware deployments:
- **Simulated Feeds**: Stadium telemetry (crowd density, gate queues, transport availability, facility statuses) are simulated dynamically inside database tables using Supabase.
- **Mock Interfaces**: These mock tables mimic actual IoT telemetry, ticketing systems, and cameras.
- **Production Integration Path**: In a live tournament environment, these database layers would be replaced with real-time hardware webhooks, ticketing registries, and local transport API feeds.

---

## 🛠️ Tech Stack & Scripts

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Engine**: Google Gemini 1.5 Flash
- **Test Framework**: Vitest, React Testing Library, jsdom

### Commands

```bash
npm install                # Install project dependencies
npm run dev                # Start local development server
npm run lint               # Run ESLint validation checks
npm run typecheck          # Run strict TypeScript compiler check
npm test                   # Run the test suite once
npm run build              # Compile and bundle code for production
```

### Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Fan** | `demo.fan@stadiumiq.com` | `StadiumIQ2026!Demo` |
| **Volunteer** | `demo.volunteer@stadiumiq.com` | `StadiumIQ2026!Demo` |
| **Venue Staff** | `demo.staff@stadiumiq.com` | `StadiumIQ2026!Demo` |
| **Organizer** | `demo.organizer@stadiumiq.com` | `StadiumIQ2026!Demo` |

For detailed test coverage and test design, see [TESTING.md](TESTING.md).

---

## 📄 License

MIT
