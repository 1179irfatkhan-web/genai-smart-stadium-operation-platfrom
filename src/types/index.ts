export type UserRole = 'fan' | 'volunteer' | 'venue_staff' | 'organizer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  language_preference: string;
  accessibility_needs: string[];
  created_at: string;
  updated_at: string;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  coordinates: { lat: number; lng: number } | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Gate {
  id: string;
  stadium_id: string;
  name: string;
  code: string;
  type: 'general' | 'vip' | 'accessible' | 'emergency';
  is_accessible: boolean;
  current_queue: number;
  max_capacity: number | null;
  status: 'open' | 'closed' | 'restricted' | 'emergency';
  coordinates: { lat: number; lng: number } | null;
}

export interface SeatingSection {
  id: string;
  stadium_id: string;
  name: string;
  section_code: string;
  level: number;
  row_start: number | null;
  row_end: number | null;
  seat_start: number | null;
  seat_end: number | null;
  capacity: number | null;
  is_accessible: boolean;
  has_shade: boolean;
  price_tier: string;
  coordinates: { lat: number; lng: number } | null;
}

export interface Facility {
  id: string;
  stadium_id: string;
  name: string;
  type: FacilityType;
  description: string | null;
  location: string | null;
  is_accessible: boolean;
  status: 'operational' | 'maintenance' | 'closed';
  hours_open: string | null;
  coordinates: { lat: number; lng: number } | null;
}

export type FacilityType =
  | 'restroom'
  | 'food_stall'
  | 'beverage'
  | 'medical_center'
  | 'prayer_room'
  | 'water_refill'
  | 'recycling_bin'
  | 'first_aid'
  | 'information'
  | 'merchandise'
  | 'accessible_seating'
  | 'other';

export interface CrowdDensity {
  id: string;
  stadium_id: string;
  zone_name: string;
  zone_type: 'gate' | 'section' | 'concourse' | 'facility' | 'parking';
  density_level: 'low' | 'moderate' | 'high' | 'critical';
  people_count: number;
  max_capacity: number | null;
  temperature: number | null;
  noise_level: number | null;
  coordinates: { lat: number; lng: number } | null;
  recorded_at: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  stadium_id: string;
  assigned_zones: string[];
  shift_start: string | null;
  shift_end: string | null;
  status: 'active' | 'break' | 'off_duty' | 'emergency';
  skills: string[];
  contact_number: string | null;
}

export interface VolunteerTask {
  id: string;
  volunteer_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  location: string | null;
  assigned_at: string;
  completed_at: string | null;
}

export interface Alert {
  id: string;
  stadium_id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  location: string | null;
  action_required: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export type AlertType =
  | 'crowd'
  | 'weather'
  | 'medical'
  | 'security'
  | 'facility'
  | 'transport'
  | 'sustainability'
  | 'general'
  | 'emergency';

export interface Incident {
  id: string;
  stadium_id: string;
  reported_by: string;
  type: IncidentType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string | null;
  location: string | null;
  coordinates: { lat: number; lng: number } | null;
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export type IncidentType =
  | 'medical'
  | 'security'
  | 'facility'
  | 'crowd'
  | 'accessibility'
  | 'lost_property'
  | 'other';

export interface Transportation {
  id: string;
  stadium_id: string;
  name: string;
  type: TransportType;
  location: string;
  distance_meters: number | null;
  capacity: number | null;
  current_availability: number | null;
  operating_hours: string | null;
  accessibility_features: string[];
  coordinates: { lat: number; lng: number } | null;
}

export type TransportType = 'metro' | 'bus' | 'taxi' | 'parking' | 'shuttle' | 'rideshare';

export interface SustainabilityMetric {
  id: string;
  stadium_id: string;
  metric_type: SustainabilityMetricType;
  value: number;
  unit: string;
  period: 'hourly' | 'daily' | 'match_day';
  recorded_at: string;
  notes: string | null;
}

export type SustainabilityMetricType =
  | 'water_usage'
  | 'energy_usage'
  | 'waste_recycled'
  | 'waste_total'
  | 'carbon_footprint'
  | 'water_refills'
  | 'reusable_cups';

export interface Match {
  id: string;
  stadium_id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_type: MatchType;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  attendance: number | null;
}

export type MatchType =
  | 'group_stage'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface NavigationRoute {
  start: string;
  end: string;
  distance: number;
  duration: number;
  waypoints: { lat: number; lng: number }[];
  is_accessible: boolean;
  instructions: string[];
}
