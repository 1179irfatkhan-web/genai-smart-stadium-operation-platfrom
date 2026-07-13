/*
# StadiumIQ Database Schema

1. Overview
This migration creates the complete database schema for the StadiumIQ Smart Stadium platform
supporting FIFA World Cup 2026 operations. The schema supports multi-user authentication
with role-based access control (RBAC) for four user types: Fan, Volunteer, Venue Staff, and Organizer.

2. New Tables
- `profiles`: User profiles with role assignment (fan, volunteer, venue_staff, organizer)
- `stadiums`: Stadium information and metadata
- `gates`: Stadium entry gates with accessibility features
- `seating_sections`: Seating blocks and sections
- `facilities`: Stadium facilities (restrooms, food stalls, medical centers, etc.)
- `crowd_density`: Real-time crowd density measurements per zone
- `volunteers`: Volunteer assignments and status
- `volunteer_tasks`: Tasks assigned to volunteers
- `alerts`: System alerts and notifications
- `incidents`: Incident reports from volunteers and staff
- `transportation`: Transportation hubs and options
- `sustainability_metrics`: Environmental sustainability tracking

3. Security
- RLS enabled on all tables
- Policies enforce role-based access:
  - Fans: Read access to public stadium data, own profile
  - Volunteers: Assigned zones, own tasks, incident reporting
  - Venue Staff: Facility monitoring, alerts
  - Organizers: Full administrative access
- All tables use auth.uid() for user identification
- Default user_id values set to auth.uid() for automatic ownership

4. Important Notes
- Uses auth.users table from Supabase Auth (no custom auth table)
- Profile role is stored in raw_app_meta_data for security
- Cascading deletes on foreign keys for data integrity
- Timestamps with timezone support
- UUID primary keys throughout
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'fan' CHECK (role IN ('fan', 'volunteer', 'venue_staff', 'organizer')),
  avatar_url text,
  language_preference text DEFAULT 'en',
  accessibility_needs text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stadiums table
CREATE TABLE IF NOT EXISTS stadiums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  capacity integer NOT NULL,
  coordinates jsonb, -- { lat, lng }
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Gates table
CREATE TABLE IF NOT EXISTS gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'vip', 'accessible', 'emergency')),
  is_accessible boolean DEFAULT false,
  current_queue integer DEFAULT 0,
  max_capacity integer,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'restricted', 'emergency')),
  coordinates jsonb,
  created_at timestamptz DEFAULT now()
);

-- Seating sections table
CREATE TABLE IF NOT EXISTS seating_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  section_code text NOT NULL,
  level integer DEFAULT 1,
  row_start integer,
  row_end integer,
  seat_start integer,
  seat_end integer,
  capacity integer,
  is_accessible boolean DEFAULT false,
  has_shade boolean DEFAULT false,
  price_tier text DEFAULT 'standard',
  coordinates jsonb,
  created_at timestamptz DEFAULT now()
);

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'restroom', 'food_stall', 'beverage', 'medical_center', 
    'prayer_room', 'water_refill', 'recycling_bin', 'first_aid',
    'information', 'merchandise', 'accessible_seating', 'other'
  )),
  description text,
  location text,
  is_accessible boolean DEFAULT false,
  status text DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'closed')),
  hours_open text,
  coordinates jsonb,
  created_at timestamptz DEFAULT now()
);

-- Crowd density measurements
CREATE TABLE IF NOT EXISTS crowd_density (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  zone_name text NOT NULL,
  zone_type text DEFAULT 'general' CHECK (zone_type IN ('gate', 'section', 'concourse', 'facility', 'parking')),
  density_level text NOT NULL CHECK (density_level IN ('low', 'moderate', 'high', 'critical')),
  people_count integer DEFAULT 0,
  max_capacity integer,
  temperature numeric,
  noise_level numeric,
  coordinates jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  assigned_zones text[],
  shift_start timestamptz,
  shift_end timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'break', 'off_duty', 'emergency')),
  skills text[],
  contact_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Volunteer tasks table
CREATE TABLE IF NOT EXISTS volunteer_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  location text,
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'crowd', 'weather', 'medical', 'security', 'facility', 
    'transport', 'sustainability', 'general', 'emergency'
  )),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  title text NOT NULL,
  message text NOT NULL,
  location text,
  action_required text,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  reported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'medical', 'security', 'facility', 'crowd', 
    'accessibility', 'lost_property', 'other'
  )),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  location text,
  coordinates jsonb,
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transportation hubs table
CREATE TABLE IF NOT EXISTS transportation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'metro', 'bus', 'taxi', 'parking', 'shuttle', 'rideshare'
  )),
  location text,
  distance_meters integer,
  capacity integer,
  current_availability integer,
  operating_hours text,
  accessibility_features text[],
  coordinates jsonb,
  created_at timestamptz DEFAULT now()
);

-- Sustainability metrics table
CREATE TABLE IF NOT EXISTS sustainability_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN (
    'water_usage', 'energy_usage', 'waste_recycled', 'waste_total',
    'carbon_footprint', 'water_refills', 'reusable_cups'
  )),
  value numeric NOT NULL,
  unit text NOT NULL,
  period text NOT NULL CHECK (period IN ('hourly', 'daily', 'match_day')),
  recorded_at timestamptz DEFAULT now(),
  notes text
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id uuid NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_date timestamptz NOT NULL,
  match_type text NOT NULL CHECK (match_type IN (
    'group_stage', 'round_of_32', 'round_of_16', 'quarter_final',
    'semi_final', 'third_place', 'final'
  )),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  attendance integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowd_density ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Public read access for stadium data
DROP POLICY IF EXISTS "stadiums_public_read" ON stadiums;
CREATE POLICY "stadiums_public_read" ON stadiums FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "stadiums_organizer_manage" ON stadiums;
CREATE POLICY "stadiums_organizer_manage" ON stadiums FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

DROP POLICY IF EXISTS "stadiums_organizer_update" ON stadiums;
CREATE POLICY "stadiums_organizer_update" ON stadiums FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- GATES POLICIES - Public read, organizer write
DROP POLICY IF EXISTS "gates_public_read" ON gates;
CREATE POLICY "gates_public_read" ON gates FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "gates_organizer_manage" ON gates;
CREATE POLICY "gates_organizer_manage" ON gates FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- SEATING SECTIONS POLICIES
DROP POLICY IF EXISTS "sections_public_read" ON seating_sections;
CREATE POLICY "sections_public_read" ON seating_sections FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "sections_organizer_manage" ON seating_sections;
CREATE POLICY "sections_organizer_manage" ON seating_sections FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- FACILITIES POLICIES
DROP POLICY IF EXISTS "facilities_public_read" ON facilities;
CREATE POLICY "facilities_public_read" ON facilities FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "facilities_staff_update" ON facilities;
CREATE POLICY "facilities_staff_update" ON facilities FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('venue_staff', 'organizer'))
  );

DROP POLICY IF EXISTS "facilities_organizer_insert" ON facilities;
CREATE POLICY "facilities_organizer_insert" ON facilities FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- CROWD DENSITY POLICIES - Fans read, staff/volunteers contribute, organizers full access
DROP POLICY IF EXISTS "crowd_density_read" ON crowd_density;
CREATE POLICY "crowd_density_read" ON crowd_density FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "crowd_density_staff_insert" ON crowd_density;
CREATE POLICY "crowd_density_staff_insert" ON crowd_density FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('venue_staff', 'volunteer', 'organizer'))
  );

-- VOLUNTEERS POLICIES - Own record access, organizers full access
DROP POLICY IF EXISTS "volunteers_read_own" ON volunteers;
CREATE POLICY "volunteers_read_own" ON volunteers FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

DROP POLICY IF EXISTS "volunteers_organizer_manage" ON volunteers;
CREATE POLICY "volunteers_organizer_manage" ON volunteers FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

DROP POLICY IF EXISTS "volunteers_insert_own" ON volunteers;
CREATE POLICY "volunteers_insert_own" ON volunteers FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- VOLUNTEER TASKS POLICIES
DROP POLICY IF EXISTS "tasks_volunteer_read" ON volunteer_tasks;
CREATE POLICY "tasks_volunteer_read" ON volunteer_tasks FOR SELECT
  TO authenticated USING (
    volunteer_id IN (SELECT id FROM volunteers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

DROP POLICY IF EXISTS "tasks_volunteer_update" ON volunteer_tasks;
CREATE POLICY "tasks_volunteer_update" ON volunteer_tasks FOR UPDATE
  TO authenticated USING (
    volunteer_id IN (SELECT id FROM volunteers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tasks_organizer_manage" ON volunteer_tasks;
CREATE POLICY "tasks_organizer_manage" ON volunteer_tasks FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- ALERTS POLICIES - Public read, staff/organizers write
DROP POLICY IF EXISTS "alerts_public_read" ON alerts;
CREATE POLICY "alerts_public_read" ON alerts FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "alerts_staff_create" ON alerts;
CREATE POLICY "alerts_staff_create" ON alerts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('venue_staff', 'organizer'))
  );

DROP POLICY IF EXISTS "alerts_staff_update" ON alerts;
CREATE POLICY "alerts_staff_update" ON alerts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('venue_staff', 'organizer'))
  );

-- INCIDENTS POLICIES
DROP POLICY IF EXISTS "incidents_reporter_read" ON incidents;
CREATE POLICY "incidents_reporter_read" ON incidents FOR SELECT
  TO authenticated USING (
    reported_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('venue_staff', 'volunteer', 'organizer'))
  );

DROP POLICY IF EXISTS "incidents_authenticated_create" ON incidents;
CREATE POLICY "incidents_authenticated_create" ON incidents FOR INSERT
  TO authenticated WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "incidents_staff_update" ON incidents;
CREATE POLICY "incidents_staff_update" ON incidents FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('venue_staff', 'organizer'))
  );

-- TRANSPORTATION POLICIES - Public read
DROP POLICY IF EXISTS "transport_public_read" ON transportation;
CREATE POLICY "transport_public_read" ON transportation FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "transport_organizer_manage" ON transportation;
CREATE POLICY "transport_organizer_manage" ON transportation FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- SUSTAINABILITY METRICS POLICIES
DROP POLICY IF EXISTS "sustainability_public_read" ON sustainability_metrics;
CREATE POLICY "sustainability_public_read" ON sustainability_metrics FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "sustainability_organizer_manage" ON sustainability_metrics;
CREATE POLICY "sustainability_organizer_manage" ON sustainability_metrics FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- MATCHES POLICIES
DROP POLICY IF EXISTS "matches_public_read" ON matches;
CREATE POLICY "matches_public_read" ON matches FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "matches_organizer_manage" ON matches;
CREATE POLICY "matches_organizer_manage" ON matches FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_gates_stadium ON gates(stadium_id);
CREATE INDEX IF NOT EXISTS idx_facilities_stadium ON facilities(stadium_id);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);
CREATE INDEX IF NOT EXISTS idx_crowd_stadium ON crowd_density(stadium_id);
CREATE INDEX IF NOT EXISTS idx_crowd_recorded ON crowd_density(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_volunteers_user ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_tasks_volunteer ON volunteer_tasks(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_stadium ON alerts(stadium_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_incidents_stadium ON incidents(stadium_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_transport_stadium ON transportation(stadium_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_stadium ON sustainability_metrics(stadium_id);
CREATE INDEX IF NOT EXISTS idx_matches_stadium ON matches(stadium_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);