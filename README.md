# StadiumIQ - Smart Stadium Operations Platform

**AI-Powered Smart Stadium Platform for FIFA World Cup 2026**

## Overview

StadiumIQ is a production-ready, AI-powered Smart Stadium platform that enhances the FIFA World Cup 2026 experience for fans, volunteers, venue staff, and organizers. The platform leverages Generative AI to improve navigation, accessibility, crowd management, transportation, sustainability, multilingual assistance, operational intelligence, and real-time decision support.

## Challenge Alignment

This project addresses **FIFA World Cup 2026 - Challenge 4: Smart Stadiums & Tournament Operations**.

All implemented features directly support the eight challenge objectives:

1. **Navigation** - Interactive stadium map, facility finder, seat guidance
2. **Crowd Management** - Real-time crowd density monitoring, heatmaps, AI recommendations
3. **Accessibility** - WCAG 2.1 AA compliant, wheelchair routes, accessible facilities
4. **Transportation** - Real-time transit info, parking availability, optimal exit routes
5. **Sustainability** - Water refill locators, recycling bins, carbon offset tracking
6. **Multilingual Assistance** - AI assistant supporting 20+ languages
7. **Operational Intelligence** - AI-powered recommendations for resource allocation
8. **Real-Time Decision Support** - Live alerts, incident management, instant notifications

## Features

### For Fans
- Personalized dashboard with live match information
- AI Stadium Assistant for instant help
- Interactive stadium map with facility finder
- Real-time crowd conditions
- Transportation guidance
- Sustainability tips

### For Volunteers
- Task management and assignments
- Zone monitoring
- Incident reporting
- Communication with command center
- Active alert notifications

### For Venue Staff
- Facility monitoring
- Alert management
- Status updates
- Operational dashboards

### For Organizers
- Comprehensive operations dashboard
- Crowd analytics and predictions
- Volunteer management
- Incident tracking
- AI-powered operational insights
- Sustainability metrics

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database with Row Level Security
  - Authentication with role-based access control
  - Real-time subscriptions support

### AI
- **Google Gemini** - AI assistant capabilities
- Structured stadium data for grounded responses
- Context-aware recommendations

## Architecture

```
src/
├── components/           # React components
│   ├── ai/               # AI Assistant
│   ├── auth/             # Authentication
│   ├── common/           # Shared components
│   ├── crowd/            # Crowd Intelligence
│   ├── dashboard/        # Dashboard layouts
│   ├── landing/          # Landing page
│   ├── maps/             # Stadium map
│   ├── organizer/        # Organizer tools
│   ├── sustainability/   # Sustainability tracking
│   ├── transport/        # Transportation hub
│   └── volunteer/        # Volunteer tools
├── contexts/             # React contexts
├── data/                 # Mock data
├── hooks/                # Custom hooks
├── lib/                  # Utilities
├── types/                # TypeScript types
└── App.tsx               # Main application
```

## Database Schema

The database includes:
- **profiles** - User profiles with roles
- **stadiums** - Stadium information
- **gates** - Entry gates with queue data
- **seating_sections** - Seating blocks
- **facilities** - Restrooms, food, medical, etc.
- **crowd_density** - Real-time crowd measurements
- **volunteers** - Volunteer assignments
- **volunteer_tasks** - Task management
- **alerts** - System alerts
- **incidents** - Incident reports
- **transportation** - Transit options
- **sustainability_metrics** - Environmental tracking
- **matches** - Match schedule

All tables have Row Level Security (RLS) policies enforcing role-based access.

## Security

- Environment variables for secrets
- Row Level Security on all tables
- Role-based access control (RBAC)
- Input validation
- No exposed credentials
- Secure session management
- Protected routes

## Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard navigation
- ARIA labels
- Focus indicators
- Color contrast compliance
- Screen reader support
- Skip links
- Reduced motion support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type check
npm run typecheck

# Run linter
npm run lint
```

### Demo Accounts

Quick access demo accounts are available:

| Role | Access Level |
|------|-------------|
| Fan | Dashboard, AI Assistant, Map, Crowd, Transport, Sustainability |
| Volunteer | All Fan features + Tasks, Zone Management |
| Venue Staff | All Fan features + Facilities, Alerts |
| Organizer | Full administrative access |

Click "Try Demo" on the login page to experience any role.

## Performance

Target metrics:
- Lighthouse Performance >= 90
- Best Practices >= 95
- Accessibility >= 95

Optimizations:
- Lazy loading
- Code splitting
- Memoization
- Optimized assets
- Efficient rendering

## Deployment

The application is ready for deployment on Vercel or similar platforms.

```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

## Future Improvements

- Real-time WebSocket updates for crowd data
- Push notifications for mobile
- Offline map support
- Integration with actual stadium IoT sensors
- Multi-stadium support for all World Cup venues
- Ticket integration
- Parking reservation system

## License

MIT License - Built for FIFA World Cup 2026 Hackathon

---

**StadiumIQ** - Enhancing the beautiful game experience through intelligent technology.
