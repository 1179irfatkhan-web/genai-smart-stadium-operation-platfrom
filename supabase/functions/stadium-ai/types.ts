export interface Gate {
  id: string;
  stadium_id: string;
  name: string;
  code: string;
  type: "general" | "vip" | "accessible" | "emergency";
  is_accessible: boolean;
  current_queue: number;
  max_capacity: number | null;
  status: "open" | "closed" | "restricted" | "emergency";
  coordinates: { lat: number; lng: number } | null;
  created_at?: string;
}

export interface SeatingSection {
  id: string;
  stadium_id: string;
  name: string;
  section_code: string;
  level: number;
  row_start?: number | null;
  row_end?: number | null;
  seat_start?: number | null;
  seat_end?: number | null;
  capacity?: number | null;
  is_accessible: boolean;
  has_shade: boolean;
  price_tier?: string;
  coordinates: { lat: number; lng: number } | null;
  created_at?: string;
}

export interface Facility {
  id: string;
  stadium_id: string;
  name: string;
  type: string;
  description: string | null;
  location: string | null;
  is_accessible: boolean;
  status: "operational" | "maintenance" | "closed";
  hours_open: string | null;
  coordinates: { lat: number; lng: number } | null;
  created_at?: string;
}

export interface CrowdDensity {
  id: string;
  stadium_id: string;
  zone_name: string;
  zone_type: string;
  density_level: "low" | "moderate" | "high" | "critical";
  people_count: number;
  max_capacity?: number | null;
  temperature?: number | null;
  noise_level?: number | null;
  coordinates?: { lat: number; lng: number } | null;
  recorded_at?: string;
}

export interface Transportation {
  id: string;
  stadium_id: string;
  name: string;
  type: string;
  location: string;
  distance_meters?: number | null;
  capacity?: number | null;
  current_availability?: number | null;
  operating_hours?: string | null;
  accessibility_features: string[];
  coordinates?: { lat: number; lng: number } | null;
}

export interface Match {
  id: string;
  stadium_id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_type: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  attendance?: number | null;
}

export interface Alert {
  id: string;
  stadium_id: string;
  type: string;
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  message: string;
  location: string | null;
  action_required?: string | null;
  is_resolved: boolean;
  resolved_at?: string | null;
  created_at?: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  stadium_id: string;
  assigned_zones: string[];
  shift_start?: string | null;
  shift_end?: string | null;
  status: "active" | "break" | "off_duty" | "emergency";
  skills: string[];
  contact_number?: string | null;
}

export interface SustainabilityMetric {
  id: string;
  stadium_id: string;
  metric_type: string;
  value: number;
  unit: string;
  period: string;
  recorded_at: string;
}

export interface StadiumContext {
  stadiumName: string;
  gates: Gate[];
  seatingSections: SeatingSection[];
  facilities: Facility[];
  crowdDensity: CrowdDensity[];
  transportation: Transportation[];
  matches: Match[];
  alerts: Alert[];
  volunteers: Volunteer[];
  sustainabilityMetrics: SustainabilityMetric[];
}

export interface AIRequestBody {
  query: string;
  language: string;
  role: string;
  stadiumContext: StadiumContext;
}

export interface StructuredAIResponse {
  answer: string;
  confidence: number;
  reasoningSummary: string;
  recommendedActions: string[];
  sources: string[];
  language: string;
  isFallback: boolean;
}
