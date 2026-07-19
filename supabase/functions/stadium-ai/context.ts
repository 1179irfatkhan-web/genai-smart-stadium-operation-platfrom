import { SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";
import {
  Gate, SeatingSection, Facility, CrowdDensity, Transportation,
  Match, Alert, Volunteer, SustainabilityMetric, StadiumContext
} from "./types.ts";

export function getRoleContext(role: string): string {
  const roleContexts: Record<string, string> = {
    fan: "The user is a FAN. Focus on: navigation, seats, gates, restrooms, medical help, accessibility, transport.",
    volunteer: "The user is a VOLUNTEER. Focus on: assigned tasks, crowd support, incident handling, suggested actions.",
    venue_staff: "The user is VENUE STAFF. Focus on: facility status, operational alerts, incident response.",
    organizer: "The user is an ORGANIZER. Focus on: crowd redirection, volunteer deployment, congestion response, transport planning, operational intelligence.",
  };
  return roleContexts[role] ?? roleContexts.fan;
}

export function buildStadiumContextStr(stadiumContext: StadiumContext): string {
  const contextParts: string[] = [`Stadium: ${stadiumContext?.stadiumName ?? "Unknown"}`];

  if (stadiumContext?.gates?.length) {
    contextParts.push(`Gates: ${JSON.stringify(stadiumContext.gates)}`);
  }
  if (stadiumContext?.seatingSections?.length) {
    contextParts.push(`Seating: ${JSON.stringify(stadiumContext.seatingSections)}`);
  }
  if (stadiumContext?.facilities?.length) {
    contextParts.push(`Facilities: ${JSON.stringify(stadiumContext.facilities)}`);
  }
  if (stadiumContext?.crowdDensity?.length) {
    contextParts.push(`Crowd Density: ${JSON.stringify(stadiumContext.crowdDensity)}`);
  }
  if (stadiumContext?.transportation?.length) {
    contextParts.push(`Transportation: ${JSON.stringify(stadiumContext.transportation)}`);
  }
  if (stadiumContext?.matches?.length) {
    contextParts.push(`Matches: ${JSON.stringify(stadiumContext.matches)}`);
  }
  if (stadiumContext?.alerts?.length) {
    contextParts.push(`Alerts: ${JSON.stringify(stadiumContext.alerts)}`);
  }
  if (stadiumContext?.volunteers?.length) {
    contextParts.push(`Volunteers: ${JSON.stringify(stadiumContext.volunteers)}`);
  }
  if (stadiumContext?.sustainabilityMetrics?.length) {
    contextParts.push(`Sustainability: ${JSON.stringify(stadiumContext.sustainabilityMetrics)}`);
  }

  return contextParts.join("\n");
}

export async function fetchAuthoritativeContext(supabaseClient: SupabaseClient): Promise<StadiumContext> {
  const [stadiumsRes, gates, seats, facilities, crowd, transport, matches, alerts, volunteers, sustainability] = await Promise.all([
    supabaseClient.from("stadiums").select("name").limit(1),
    supabaseClient.from("gates").select("*"),
    supabaseClient.from("seating_sections").select("*"),
    supabaseClient.from("facilities").select("*"),
    supabaseClient.from("crowd_density").select("*").order("recorded_at", { ascending: false }).limit(20),
    supabaseClient.from("transportation").select("*"),
    supabaseClient.from("matches").select("*").order("match_date").limit(5),
    supabaseClient.from("alerts").select("*").eq("is_resolved", false).order("created_at", { ascending: false }).limit(5),
    supabaseClient.from("volunteers").select("*"),
    supabaseClient.from("sustainability_metrics").select("*").order("recorded_at", { ascending: false }).limit(10),
  ]);

  const stadiumName = stadiumsRes.data && stadiumsRes.data.length > 0 
    ? stadiumsRes.data[0].name 
    : "SoFi Stadium";

  return {
    stadiumName,
    gates: (gates.data as Gate[]) || [],
    seatingSections: (seats.data as SeatingSection[]) || [],
    facilities: (facilities.data as Facility[]) || [],
    crowdDensity: (crowd.data as CrowdDensity[]) || [],
    transportation: (transport.data as Transportation[]) || [],
    matches: (matches.data as Match[]) || [],
    alerts: (alerts.data as Alert[]) || [],
    volunteers: (volunteers.data as Volunteer[]) || [],
    sustainabilityMetrics: (sustainability.data as SustainabilityMetric[]) || [],
  };
}
