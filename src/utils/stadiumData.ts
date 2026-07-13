import type {
  CrowdDensity, Facility, Gate, Transportation, Match, Alert,
} from '../types';

export interface StadiumDataContext {
  stadiumName: string;
  gates: Gate[];
  facilities: Facility[];
  crowdDensity: CrowdDensity[];
  transportation: Transportation[];
  matches: Match[];
  alerts: Alert[];
}

export function buildStadiumDataContext(data: StadiumDataContext): string {
  const parts: string[] = [`Stadium: ${data.stadiumName}`];

  if (data.gates.length > 0) {
    parts.push('Gates: ' + data.gates.map((g) =>
      `${g.name} (${g.code}, ${g.type}, ${g.status}, queue: ${g.current_queue})`,
    ).join('; '));
  }

  if (data.facilities.length > 0) {
    parts.push('Facilities: ' + data.facilities.map((f) =>
      `${f.name} (${f.type}, ${f.status}${f.is_accessible ? ', accessible' : ''})`,
    ).join('; '));
  }

  if (data.crowdDensity.length > 0) {
    parts.push('Crowd: ' + data.crowdDensity.map((c) =>
      `${c.zone_name} (${c.density_level}, ${c.people_count} people)`,
    ).join('; '));
  }

  if (data.transportation.length > 0) {
    parts.push('Transport: ' + data.transportation.map((t) =>
      `${t.name} (${t.type}, availability: ${t.current_availability ?? 'unknown'})`,
    ).join('; '));
  }

  if (data.matches.length > 0) {
    parts.push('Matches: ' + data.matches.map((m) =>
      `${m.home_team} vs ${m.away_team} (${m.status})`,
    ).join('; '));
  }

  if (data.alerts.length > 0) {
    parts.push('Active Alerts: ' + data.alerts.filter((a) => !a.is_resolved).map((a) =>
      `${a.title} (${a.severity})`,
    ).join('; '));
  }

  return parts.join('\n');
}

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

  const generalKeywords = [
    'gate', 'entrance', 'facility', 'restroom', 'food', 'medical', 'water',
    'crowd', 'density', 'queue', 'transport', 'bus', 'metro', 'parking',
    'match', 'game', 'stadium', 'seat', 'section', 'accessib', 'emergency',
    'alert', 'sustainability', 'help',
  ];

  return keywords.some((kw) => lower.includes(kw)) || generalKeywords.some((kw) => lower.includes(kw));
}
