import type {
  CrowdDensity, Facility, Gate, Transportation, Match, Alert,
  Volunteer, SustainabilityMetric, SeatingSection,
} from '../types';

export interface StadiumDataContext {
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

export function buildStadiumDataContext(data: StadiumDataContext): string {
  const parts: string[] = [`Stadium: ${data.stadiumName}`];

  if (data.gates.length > 0) {
    parts.push('Gates: ' + data.gates.map((g) =>
      `${g.name} (${g.code}, ${g.type}, ${g.status}, queue: ${g.current_queue}${g.is_accessible ? ', accessible' : ''})`,
    ).join('; '));
  }

  if (data.seatingSections.length > 0) {
    parts.push('Seating: ' + data.seatingSections.map((s) =>
      `${s.name} (${s.section_code}, level ${s.level}${s.is_accessible ? ', accessible' : ''}${s.has_shade ? ', shaded' : ''})`,
    ).join('; '));
  }

  if (data.facilities.length > 0) {
    parts.push('Facilities: ' + data.facilities.map((f) =>
      `${f.name} (${f.type}, ${f.status}${f.is_accessible ? ', accessible' : ''})`,
    ).join('; '));
  }

  if (data.crowdDensity.length > 0) {
    parts.push('Crowd: ' + data.crowdDensity.map((c) =>
      `${c.zone_name} (${c.density_level}, ${c.people_count} people${c.max_capacity ? ` of ${c.max_capacity}` : ''})`,
    ).join('; '));
  }

  if (data.transportation.length > 0) {
    parts.push('Transport: ' + data.transportation.map((t) =>
      `${t.name} (${t.type}, availability: ${t.current_availability ?? 'unknown'}${t.accessibility_features.length > 0 ? `, accessible: ${t.accessibility_features.join('/')}` : ''})`,
    ).join('; '));
  }

  if (data.matches.length > 0) {
    parts.push('Matches: ' + data.matches.map((m) =>
      `${m.home_team} vs ${m.away_team} (${m.status})`,
    ).join('; '));
  }

  if (data.alerts.length > 0) {
    const active = data.alerts.filter((a) => !a.is_resolved);
    if (active.length > 0) {
      parts.push('Active Alerts: ' + active.map((a) =>
        `${a.title} (${a.severity})`,
      ).join('; '));
    }
  }

  if (data.volunteers.length > 0) {
    parts.push('Volunteers: ' + data.volunteers.map((v) =>
      `${v.status} (${v.assigned_zones.join(', ') || 'no zones'})`,
    ).join('; '));
  }

  if (data.sustainabilityMetrics.length > 0) {
    parts.push('Sustainability: ' + data.sustainabilityMetrics.map((s) =>
      `${s.metric_type}: ${s.value} ${s.unit}`,
    ).join('; '));
  }

  return parts.join('\n');
}

const GROUNDING_KEYWORDS = [
  'gate', 'entrance', 'facility', 'restroom', 'food', 'medical', 'water',
  'crowd', 'density', 'queue', 'transport', 'bus', 'metro', 'parking',
  'match', 'game', 'stadium', 'seat', 'section', 'accessib', 'emergency',
  'alert', 'sustainability', 'help', 'volunteer', 'recycle', 'shuttle',
  'taxi', 'rideshare', 'concourse', 'navigation', 'route', 'exit',
];

export function isQueryGrounded(query: string, context: StadiumDataContext): boolean {
  const lower = query.toLowerCase();
  const keywords: string[] = [];

  context.gates.forEach((g) => { keywords.push(g.name.toLowerCase(), g.code.toLowerCase()); });
  context.facilities.forEach((f) => { keywords.push(f.name.toLowerCase(), f.type.toLowerCase()); });
  context.crowdDensity.forEach((c) => { keywords.push(c.zone_name.toLowerCase()); });
  context.transportation.forEach((t) => { keywords.push(t.name.toLowerCase(), t.type.toLowerCase()); });
  context.matches.forEach((m) => {
    keywords.push(m.home_team.toLowerCase(), m.away_team.toLowerCase());
  });

  return keywords.some((kw) => lower.includes(kw)) || GROUNDING_KEYWORDS.some((kw) => lower.includes(kw));
}
