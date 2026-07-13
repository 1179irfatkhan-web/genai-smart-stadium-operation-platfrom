import { describe, it, expect } from 'vitest';
import { buildStadiumDataContext, isQueryGrounded, type StadiumDataContext } from '../utils/stadiumData';
import type { Gate, Facility, CrowdDensity, Transportation, Match, Alert } from '../types';

const mockData: StadiumDataContext = {
  stadiumName: 'MetLife Stadium',
  gates: [
    { id: 'g1', stadium_id: 's1', name: 'Gate A', code: 'GA', type: 'general', is_accessible: true, current_queue: 5, max_capacity: 100, status: 'open', coordinates: null },
  ] as Gate[],
  facilities: [
    { id: 'f1', stadium_id: 's1', name: 'Restroom 1', type: 'restroom', description: null, location: 'A', is_accessible: true, status: 'operational', hours_open: null, coordinates: null },
  ] as Facility[],
  crowdDensity: [
    { id: 'c1', stadium_id: 's1', zone_name: 'Gate A', zone_type: 'gate', density_level: 'low', people_count: 5, max_capacity: 100, temperature: null, noise_level: null, coordinates: null, recorded_at: '' },
  ] as CrowdDensity[],
  transportation: [
    { id: 't1', stadium_id: 's1', name: 'Metro', type: 'metro', location: 'North', distance_meters: 100, capacity: 1000, current_availability: 500, operating_hours: '24/7', accessibility_features: [], coordinates: null },
  ] as Transportation[],
  matches: [
    { id: 'm1', stadium_id: 's1', home_team: 'USA', away_team: 'Canada', match_date: '', match_type: 'group_stage', status: 'scheduled', attendance: null },
  ] as Match[],
  alerts: [
    { id: 'a1', stadium_id: 's1', type: 'crowd', severity: 'warning', title: 'Test Alert', message: 'Test', location: null, action_required: null, is_resolved: false, resolved_at: null, created_at: '' },
  ] as Alert[],
};

describe('buildStadiumDataContext', () => {
  it('includes stadium name', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('MetLife Stadium');
  });

  it('includes gate information', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('Gate A');
    expect(result).toContain('GA');
  });

  it('includes facility information', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('Restroom 1');
  });

  it('includes crowd density information', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('Gate A');
    expect(result).toContain('low');
  });

  it('includes transport information', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('Metro');
  });

  it('includes match information', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('USA');
    expect(result).toContain('Canada');
  });

  it('includes alert information', () => {
    const result = buildStadiumDataContext(mockData);
    expect(result).toContain('Test Alert');
  });
});

describe('isQueryGrounded', () => {
  it('returns true for gate-related queries', () => {
    expect(isQueryGrounded('Which gate should I use?', mockData)).toBe(true);
    expect(isQueryGrounded('Where is Gate A?', mockData)).toBe(true);
  });

  it('returns true for facility-related queries', () => {
    expect(isQueryGrounded('Where is the restroom?', mockData)).toBe(true);
    expect(isQueryGrounded('I need food', mockData)).toBe(true);
  });

  it('returns true for crowd-related queries', () => {
    expect(isQueryGrounded('How is the crowd?', mockData)).toBe(true);
    expect(isQueryGrounded('Is it busy?', mockData)).toBe(true);
  });

  it('returns true for transport-related queries', () => {
    expect(isQueryGrounded('How do I get to the metro?', mockData)).toBe(true);
    expect(isQueryGrounded('Where can I find parking?', mockData)).toBe(true);
  });

  it('returns true for match-related queries', () => {
    expect(isQueryGrounded('When is the match?', mockData)).toBe(true);
    expect(isQueryGrounded('USA vs Canada?', mockData)).toBe(true);
  });

  it('returns true for accessibility queries', () => {
    expect(isQueryGrounded('Is Gate A accessible?', mockData)).toBe(true);
  });

  it('returns true for general stadium queries', () => {
    expect(isQueryGrounded('What is the stadium name?', mockData)).toBe(true);
    expect(isQueryGrounded('Where is the stadium?', mockData)).toBe(true);
  });

  it('returns false for completely unrelated queries', () => {
    expect(isQueryGrounded('What is the meaning of life?', mockData)).toBe(false);
    expect(isQueryGrounded('Tell me about quantum physics', mockData)).toBe(false);
  });
});
