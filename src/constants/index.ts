import type { UserRole, LanguageCode } from '../types';

export const APP_NAME = 'StadiumIQ';
export const APP_TAGLINE = 'GenAI Smart Stadium Platform for FIFA World Cup 2026';

export const DEMO_PASSWORD = 'StadiumIQ2026!Demo';

export const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; fullName: string }> = {
  fan: { email: 'demo.fan@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Fan' },
  volunteer: { email: 'demo.volunteer@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Volunteer' },
  venue_staff: { email: 'demo.staff@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Staff' },
  organizer: { email: 'demo.organizer@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Organizer' },
};

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
];

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
export const AI_MAX_QUESTION_LENGTH = 1000;

export const GEMINI_MODEL = 'gemini-1.5-flash';

export const PROBLEM_STATEMENT_MAPPING: {
  challenge: string;
  feature: string;
  route: string;
  users: string;
  genai: string;
}[] = [
  {
    challenge: 'Navigation',
    feature: 'Smart Navigation',
    route: '/dashboard/map',
    users: 'Fans, volunteers',
    genai: 'Generates context-aware routes using structured stadium data',
  },
  {
    challenge: 'Crowd Management',
    feature: 'Crowd Dashboard',
    route: '/dashboard/crowd',
    users: 'Organizers, venue staff',
    genai: 'Produces operational recommendations based on live conditions',
  },
  {
    challenge: 'Accessibility',
    feature: 'Accessibility Assistant',
    route: '/dashboard/ai',
    users: 'Fans with accessibility needs',
    genai: 'Adapts guidance based on mobility and accessibility requirements',
  },
  {
    challenge: 'Transportation',
    feature: 'Transport Planner',
    route: '/dashboard/transport',
    users: 'Fans, organizers',
    genai: 'Suggests less crowded post-match travel options',
  },
  {
    challenge: 'Sustainability',
    feature: 'Sustainability Dashboard',
    route: '/dashboard/sustainability',
    users: 'Fans, organizers',
    genai: 'Generates context-aware sustainability recommendations',
  },
  {
    challenge: 'Multilingual Assistance',
    feature: 'Gemini AI',
    route: '/dashboard/ai',
    users: 'International fans and staff',
    genai: 'Generates genuine multilingual responses in 7 languages',
  },
  {
    challenge: 'Operational Intelligence',
    feature: 'Admin Dashboard',
    route: '/dashboard',
    users: 'Organizers, venue staff',
    genai: 'Converts operational data into recommended actions',
  },
  {
    challenge: 'Real-Time Decision Support',
    feature: 'AI Recommendations',
    route: '/dashboard/ai',
    users: 'Organizers, staff',
    genai: 'Produces role-aware decisions from changing stadium conditions',
  },
  {
    challenge: 'Volunteer Assistance',
    feature: 'Volunteer Dashboard',
    route: '/dashboard/tasks',
    users: 'Volunteers',
    genai: 'Prioritizes role-specific actions and task suggestions',
  },
  {
    challenge: 'Venue Operations',
    feature: 'Facility & Alert Management',
    route: '/dashboard',
    users: 'Venue staff',
    genai: 'Assists with incident and facility response',
  },
];

export const CHALLENGE_4_STATEMENT = `Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff. The solution must leverage Generative AI to improve navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support during the FIFA World Cup 2026.`;
