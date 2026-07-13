/*
# StadiumIQ Seed Data

1. Overview
This migration populates the database with realistic FIFA World Cup 2026 data including:
- Sample stadium (SoFi Stadium, Los Angeles - one of the host venues)
- Stadium gates with various types
- Seating sections
- Facilities throughout the stadium
- Transportation options
- Sample match data
- Sustainability metrics
- Sample crowd density data

2. Important Notes
- Uses realistic coordinates and data for SoFi Stadium
- Includes accessible facilities and routes
- Represents a live match scenario
- Supports all challenge objectives: navigation, accessibility, transportation, sustainability, crowd management

3. Data Coverage
- 1 Stadium (SoFi Stadium, LA)
- 8 Gates (general, VIP, accessible, emergency)
- 10 Seating sections
- 25+ Facilities (restrooms, food stalls, medical, prayer rooms, water refills, recycling)
- 8 Transportation hubs
- 3 Sample matches
- Sustainability metrics
- Crowd density readings
*/

-- Insert SoFi Stadium (Los Angeles - FIFA World Cup 2026 host venue)
INSERT INTO stadiums (id, name, city, country, capacity, coordinates, description, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'SoFi Stadium', 'Los Angeles', 'United States', 70240, 
 '{"lat": 33.9535, "lng": -118.3388}',
 'State-of-the-art stadium hosting FIFA World Cup 2026 matches including the opening game.',
 'https://images.pexels.com/photos/161555/pexels-photo-161555.jpeg') ON CONFLICT DO NOTHING;

-- Insert Gates
INSERT INTO gates (stadium_id, name, code, type, is_accessible, current_queue, max_capacity, status, coordinates) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Main Entrance North', 'A1', 'general', false, 245, 500, 'open', '{"lat": 33.9550, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Main Entrance South', 'A2', 'general', false, 312, 500, 'open', '{"lat": 33.9520, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'VIP Entrance West', 'B1', 'vip', true, 45, 200, 'open', '{"lat": 33.9535, "lng": -118.3405}'),
('550e8400-e29b-41d4-a716-446655440001', 'Accessible Entrance East', 'C1', 'accessible', true, 28, 150, 'open', '{"lat": 33.9535, "lng": -118.3371}'),
('550e8400-e29b-41d4-a716-446655440001', 'Emergency Exit North', 'E1', 'emergency', true, 0, 1000, 'open', '{"lat": 33.9555, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Emergency Exit South', 'E2', 'emergency', true, 0, 1000, 'open', '{"lat": 33.9515, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'General Entrance East', 'A3', 'general', false, 189, 400, 'restricted', '{"lat": 33.9535, "lng": -118.3368}'),
('550e8400-e29b-41d4-a716-446655440001', 'General Entrance West', 'A4', 'general', false, 156, 400, 'open', '{"lat": 33.9535, "lng": -118.3405}') ON CONFLICT DO NOTHING;

-- Insert Seating Sections
INSERT INTO seating_sections (stadium_id, name, section_code, level, row_start, row_end, seat_start, seat_end, capacity, is_accessible, has_shade, price_tier, coordinates) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Lower Bowl North', '100N', 1, 1, 30, 1, 40, 1200, false, false, 'premium', '{"lat": 33.9545, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Lower Bowl South', '100S', 1, 1, 30, 1, 40, 1200, false, true, 'premium', '{"lat": 33.9525, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Lower Bowl East', '100E', 1, 1, 30, 1, 40, 1200, true, false, 'premium', '{"lat": 33.9535, "lng": -118.3375}'),
('550e8400-e29b-41d4-a716-446655440001', 'Lower Bowl West', '100W', 1, 1, 30, 1, 40, 1200, false, false, 'premium', '{"lat": 33.9535, "lng": -118.3400}'),
('550e8400-e29b-41d4-a716-446655440001', 'Club Level North', '200N', 2, 1, 20, 1, 50, 1000, false, true, 'vip', '{"lat": 33.9548, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Club Level South', '200S', 2, 1, 20, 1, 50, 1000, true, true, 'vip', '{"lat": 33.9522, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Upper Bowl North', '300N', 3, 1, 40, 1, 60, 2400, false, false, 'standard', '{"lat": 33.9552, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Upper Bowl South', '300S', 3, 1, 40, 1, 60, 2400, false, true, 'standard', '{"lat": 33.9518, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Accessible Seating East', 'ACC', 1, 1, 5, 1, 20, 100, true, false, 'accessible', '{"lat": 33.9535, "lng": -118.3372}'),
('550e8400-e29b-41d4-a716-446655440001', 'Accessible Seating West', 'ACCW', 1, 1, 5, 1, 20, 100, true, true, 'accessible', '{"lat": 33.9535, "lng": -118.3402}') ON CONFLICT DO NOTHING;

-- Insert Facilities
INSERT INTO facilities (stadium_id, name, type, description, location, is_accessible, status, hours_open, coordinates) VALUES
-- Restrooms
('550e8400-e29b-41d4-a716-446655440001', 'Restroom Level 1 North', 'restroom', 'Main level restrooms with accessible stalls', 'Section 100N, Concourse Level', true, 'operational', 'Open during events', '{"lat": 33.9548, "lng": -118.3390}'),
('550e8400-e29b-41d4-a716-446655440001', 'Restroom Level 1 South', 'restroom', 'Main level restrooms', 'Section 100S, Concourse Level', true, 'operational', 'Open during events', '{"lat": 33.9522, "lng": -118.3390}'),
('550e8400-e29b-41d4-a716-446655440001', 'Restroom Level 2 North', 'restroom', 'Club level restrooms', 'Section 200N, Club Level', true, 'operational', 'Open during events', '{"lat": 33.9550, "lng": -118.3390}'),
('550e8400-e29b-41d4-a716-446655440001', 'Restroom Level 3 North', 'restroom', 'Upper level restrooms', 'Section 300N, Upper Concourse', true, 'operational', 'Open during events', '{"lat": 33.9555, "lng": -118.3390}'),
-- Food Stalls
('550e8400-e29b-41d4-a716-446655440001', 'World Cup Kitchen', 'food_stall', 'International cuisine and local favorites', 'Main Concourse, Section 100', false, 'operational', '2 hours before kickoff - end of event', '{"lat": 33.9540, "lng": -118.3385}'),
('550e8400-e29b-41d4-a716-446655440001', 'LA Street Tacos', 'food_stall', 'Authentic LA street tacos', 'Main Concourse, Section 100S', false, 'operational', '2 hours before kickoff - end of event', '{"lat": 33.9530, "lng": -118.3385}'),
('550e8400-e29b-41d4-a716-446655440001', 'Burger Zone', 'food_stall', 'Classic American burgers and fries', 'Upper Concourse, Section 300N', false, 'operational', '2 hours before kickoff - end of event', '{"lat": 33.9553, "lng": -118.3385}'),
('550e8400-e29b-41d4-a716-446655440001', 'Healthy Options', 'food_stall', 'Salads, wraps, and healthy snacks', 'Club Level, Section 200S', true, 'operational', '2 hours before kickoff - end of event', '{"lat": 33.9525, "lng": -118.3385}'),
-- Beverage
('550e8400-e29b-41d4-a716-446655440001', 'Craft Beer Garden', 'beverage', 'Local craft beers and selections', 'Upper Concourse, Section 300S', false, 'operational', '2 hours before kickoff - 75th minute', '{"lat": 33.9520, "lng": -118.3395}'),
('550e8400-e29b-41d4-a716-446655440001', 'Soft Drinks Station', 'beverage', 'Coca-Cola products and refreshments', 'Main Concourse, Section 100E', true, 'operational', 'Open during events', '{"lat": 33.9535, "lng": -118.3380}'),
('550e8400-e29b-41d4-a716-446655440001', 'Coffee Corner', 'beverage', 'Premium coffee and hot beverages', 'Club Level, Section 200N', true, 'operational', 'Open during events', '{"lat": 33.9548, "lng": -118.3395}'),
-- Medical Centers
('550e8400-e29b-41d4-a716-446655440001', 'First Aid Station North', 'medical_center', 'Full medical facility with trained staff', 'Ground Level, Section 100N', true, 'operational', '24/7 during events', '{"lat": 33.9545, "lng": -118.3395}'),
('550e8400-e29b-41d4-a716-446655440001', 'First Aid Station South', 'medical_center', 'Emergency medical services', 'Ground Level, Section 100S', true, 'operational', '24/7 during events', '{"lat": 33.9525, "lng": -118.3395}'),
('550e8400-e29b-41d4-a716-446655440001', 'Emergency Response Unit', 'medical_center', 'Rapid response medical team', 'Central Location, Field Level', true, 'operational', '24/7 during events', '{"lat": 33.9535, "lng": -118.3388}'),
-- Prayer Rooms
('550e8400-e29b-41d4-a716-446655440001', 'Multi-Faith Prayer Room', 'prayer_room', 'Quiet space for prayer and meditation', 'Level 2, Southeast Corner', true, 'operational', 'Open during events', '{"lat": 33.9530, "lng": -118.3375}'),
('550e8400-e29b-41d4-a716-446655440001', 'Meditation Room', 'prayer_room', 'Peaceful meditation space', 'Level 3, Northwest Corner', true, 'operational', 'Open during events', '{"lat": 33.9550, "lng": -118.3400}'),
-- Water Refill Stations
('550e8400-e29b-41d4-a716-446655440001', 'Water Station 1', 'water_refill', 'Free filtered water refill', 'Main Concourse, Gate A1', true, 'operational', 'Open during events', '{"lat": 33.9548, "lng": -118.3392}'),
('550e8400-e29b-41d4-a716-446655440001', 'Water Station 2', 'water_refill', 'Free filtered water refill', 'Main Concourse, Gate A2', true, 'operational', 'Open during events', '{"lat": 33.9522, "lng": -118.3392}'),
('550e8400-e29b-41d4-a716-446655440001', 'Water Station 3', 'water_refill', 'Free filtered water refill', 'Upper Concourse, Section 300', true, 'operational', 'Open during events', '{"lat": 33.9555, "lng": -118.3392}'),
('550e8400-e29b-41d4-a716-446655440001', 'Water Station 4', 'water_refill', 'Free filtered water refill', 'Club Level, Section 200', true, 'operational', 'Open during events', '{"lat": 33.9538, "lng": -118.3392}'),
-- Recycling Bins
('550e8400-e29b-41d4-a716-446655440001', 'Recycling Center North', 'recycling_bin', 'Recycling and compost bins', 'Main Concourse, Section 100N', true, 'operational', 'Open during events', '{"lat": 33.9546, "lng": -118.3398}'),
('550e8400-e29b-41d4-a716-446655440001', 'Recycling Center South', 'recycling_bin', 'Recycling and compost bins', 'Main Concourse, Section 100S', true, 'operational', 'Open during events', '{"lat": 33.9524, "lng": -118.3398}'),
-- Information
('550e8400-e29b-41d4-a716-446655440001', 'Fan Information Desk', 'information', 'Stadium assistance and wayfinding help', 'Main Lobby, Ground Level', true, 'operational', 'Open during events', '{"lat": 33.9535, "lng": -118.3390}'),
-- Merchandise
('550e8400-e29b-41d4-a716-446655440001', 'Official FIFA Store', 'merchandise', 'Official FIFA World Cup 2026 merchandise', 'Main Concourse, North Entry', false, 'operational', '3 hours before kickoff - 2 hours after final whistle', '{"lat": 33.9549, "lng": -118.3378}'),
('550e8400-e29b-41d4-a716-446655440001', 'Team Store', 'merchandise', 'Team jerseys and memorabilia', 'Upper Concourse, Section 300N', false, 'operational', '3 hours before kickoff - 2 hours after final whistle', '{"lat": 33.9554, "lng": -118.3378}') ON CONFLICT DO NOTHING;

-- Insert Transportation
INSERT INTO transportation (stadium_id, name, type, location, distance_meters, capacity, current_availability, operating_hours, accessibility_features, coordinates) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'SoFi Stadium Metro Station', 'metro', 'K Line Direct Connection', 200, 5000, 3500, 'Extended hours on match days', ARRAY['wheelchair_accessible', 'elevator', 'braille_signage'], '{"lat": 33.9515, "lng": -118.3410}'),
('550e8400-e29b-41d4-a716-446655440001', 'Stadium Shuttle Hub', 'shuttle', 'Dedicated Stadium Shuttle', 100, 2000, 1500, '3 hours before - 2 hours after event', ARRAY['wheelchair_lift', 'audio_announcements'], '{"lat": 33.9520, "lng": -118.3420}'),
('550e8400-e29b-41d4-a716-446655440001', 'Official Parking Garage A', 'parking', 'Main Parking Structure', 300, 8000, 2500, 'Open 4 hours before kickoff', ARRAY['accessible_spots', 'elevator', 'shuttle_to_venue'], '{"lat": 33.9560, "lng": -118.3410}'),
('550e8400-e29b-41d4-a716-446655440001', 'Official Parking Garage B', 'parking', 'Overflow Parking', 500, 6000, 4200, 'Open 4 hours before kickoff', ARRAY['accessible_spots', 'shuttle_to_venue'], '{"lat": 33.9510, "lng": -118.3420}'),
('550e8400-e29b-41d4-a716-446655440001', 'Taxi Stand', 'taxi', 'Official Taxi Pickup Zone', 150, 50, 35, 'Extended hours on match days', ARRAY['wheelchair_accessible_vehicles'], '{"lat": 33.9525, "lng": -118.3415}'),
('550e8400-e29b-41d4-a716-446655440001', 'Rideshare Zone', 'rideshare', 'Uber/Lyft Designated Area', 200, 100, 75, 'Open during events', ARRAY['accessible_pickup'], '{"lat": 33.9528, "lng": -118.3418}'),
('550e8400-e29b-41d4-a716-446655440001', 'Metro Bus Terminal', 'bus', 'Metro Lines 40, 710, 740', 350, 3000, 2200, 'Extended service on match days', ARRAY['wheelchair_accessible', 'kneeling_bus', 'audio_announcements'], '{"lat": 33.9505, "lng": -118.3405}'),
('550e8400-e29b-41d4-a716-446655440001', 'VIP Valet', 'parking', 'Premium Valet Service', 50, 200, 85, 'VIP ticket holders only', ARRAY['premium_service', 'car_return'], '{"lat": 33.9538, "lng": -118.3420}') ON CONFLICT DO NOTHING;

-- Insert Matches
INSERT INTO matches (stadium_id, home_team, away_team, match_date, match_type, status, attendance) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'United States', 'Mexico', '2026-06-15 13:00:00+00', 'group_stage', 'completed', 68542),
('550e8400-e29b-41d4-a716-446655440001', 'Brazil', 'Argentina', '2026-06-20 16:00:00+00', 'group_stage', 'live', 0),
('550e8400-e29b-41d4-a716-446655440001', 'Germany', 'Spain', '2026-06-25 19:00:00+00', 'round_of_32', 'scheduled', 0) ON CONFLICT DO NOTHING;

-- Insert Sustainability Metrics
INSERT INTO sustainability_metrics (stadium_id, metric_type, value, unit, period, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'water_refills', 15234, 'liters', 'match_day', 'Water refill stations usage'),
('550e8400-e29b-41d4-a716-446655440001', 'waste_recycled', 45, 'percent', 'match_day', 'Recycling rate achieved'),
('550e8400-e29b-41d4-a716-446655440001', 'energy_usage', 2850, 'kWh', 'match_day', 'Renewable energy credits applied'),
('550e8400-e29b-41d4-a716-446655440001', 'carbon_footprint', 12.5, 'tons_co2', 'match_day', 'Offset through verified programs'),
('550e8400-e29b-41d4-a716-446655440001', 'reusable_cups', 28000, 'units', 'match_day', 'Reusable cup program participation'),
('550e8400-e29b-41d4-a716-446655440001', 'waste_total', 18.5, 'tons', 'match_day', 'Total waste generated') ON CONFLICT DO NOTHING;

-- Insert Crowd Density (Live Match Scenario)
INSERT INTO crowd_density (stadium_id, zone_name, zone_type, density_level, people_count, max_capacity, coordinates) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Gate A1 Entrance', 'gate', 'high', 245, 500, '{"lat": 33.9550, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Gate A2 Entrance', 'gate', 'critical', 312, 500, '{"lat": 33.9520, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Gate C1 Accessible', 'gate', 'low', 28, 150, '{"lat": 33.9535, "lng": -118.3371}'),
('550e8400-e29b-41d4-a716-446655440001', 'Section 100N', 'section', 'high', 1050, 1200, '{"lat": 33.9545, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Section 100S', 'section', 'moderate', 890, 1200, '{"lat": 33.9525, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Section 200N Club', 'section', 'moderate', 720, 1000, '{"lat": 33.9548, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Section 300N Upper', 'section', 'low', 1450, 2400, '{"lat": 33.9552, "lng": -118.3388}'),
('550e8400-e29b-41d4-a716-446655440001', 'Main Concourse', 'concourse', 'high', 2800, 4000, '{"lat": 33.9535, "lng": -118.3390}'),
('550e8400-e29b-41d4-a716-446655440001', 'Food Court Area', 'facility', 'critical', 450, 500, '{"lat": 33.9540, "lng": -118.3385}'),
('550e8400-e29b-41d4-a716-446655440001', 'Parking Garage A', 'parking', 'moderate', 5500, 8000, '{"lat": 33.9560, "lng": -118.3410}') ON CONFLICT DO NOTHING;