import type { UserRole } from '../types';

export const APP_NAME = 'StadiumIQ';
export const APP_TAGLINE = 'Smart Stadium Platform for FIFA World Cup 2026';

export const DEMO_PASSWORD = 'StadiumIQ2026!Demo';

export const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; fullName: string }> = {
  fan: { email: 'demo.fan@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Fan' },
  volunteer: { email: 'demo.volunteer@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Volunteer' },
  venue_staff: { email: 'demo.staff@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Staff' },
  organizer: { email: 'demo.organizer@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Organizer' },
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
] as const;

export const DENSITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
  emergency: 'bg-red-200 text-red-900',
};

export const AI_FALLBACK_RESPONSE = "I don't have that information yet.";

export const AI_RATE_LIMIT_MS = 3000;
export const AI_MAX_CACHE_ENTRIES = 50;

export const PROBLEM_STATEMENT_MAPPING = [
  { challenge: 'Navigation', feature: 'Smart Navigation', route: '/dashboard/map' },
  { challenge: 'Crowd Management', feature: 'Crowd Dashboard', route: '/dashboard/crowd' },
  { challenge: 'Accessibility', feature: 'Accessibility Assistant', route: '/dashboard/ai' },
  { challenge: 'Transportation', feature: 'Transport Planner', route: '/dashboard/transport' },
  { challenge: 'Operational Intelligence', feature: 'Admin Dashboard', route: '/dashboard' },
  { challenge: 'Multilingual', feature: 'Gemini AI', route: '/dashboard/ai' },
  { challenge: 'Real-Time Decision Support', feature: 'AI Recommendations', route: '/dashboard/ai' },
  { challenge: 'Sustainability', feature: 'Sustainability Dashboard', route: '/dashboard/sustainability' },
] as const;
