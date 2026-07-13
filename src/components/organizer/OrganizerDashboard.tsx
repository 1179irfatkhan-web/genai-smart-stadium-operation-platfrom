import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, AlertTriangle, Activity, TrendingUp,
  Clock, Shield, CheckCircle, ArrowRight,
  Leaf, Settings, ChevronRight, Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { CrowdDensity, Alert, Volunteer, Incident, Match, SustainabilityMetric } from '../../types';
import { Skeleton } from '../common/LoadingSpinner';

export function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const [crowdData, setCrowdData] = useState<CrowdDensity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sustainability, setSustainability] = useState<SustainabilityMetric[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [crowdRes, alertsRes, volunteersRes, incidentsRes, matchesRes, sustainabilityRes] = await Promise.all([
          supabase.from('crowd_density').select('*').order('recorded_at', { ascending: false }),
          supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10),
          supabase.from('volunteers').select('*').limit(20),
          supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('matches').select('*').order('match_date', { ascending: true }),
          supabase.from('sustainability_metrics').select('*').order('recorded_at', { ascending: false }).limit(10),
        ]);

        if (crowdRes.data) setCrowdData(crowdRes.data);
        if (alertsRes.data) setAlerts(alertsRes.data);
        if (volunteersRes.data) setVolunteers(volunteersRes.data);
        if (incidentsRes.data) setIncidents(incidentsRes.data);
        if (matchesRes.data) setMatches(matchesRes.data);
        if (sustainabilityRes.data) setSustainability(sustainabilityRes.data);
      } catch (error) {
        console.error('Error fetching organizer data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (!error) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  const stats = {
    totalPeople: crowdData.reduce((sum, d) => sum + d.people_count, 0),
    criticalZones: crowdData.filter((c) => c.density_level === 'critical').length,
    activeVolunteers: volunteers.filter((v) => v.status === 'active').length,
    openIncidents: incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length,
    activeAlerts: alerts.filter((a) => !a.is_resolved).length,
    liveMatch: matches.find((m) => m.status === 'live'),
  };

  const recentSustainability = sustainability.slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Operations Dashboard</h1>
          <p className="text-secondary mt-1">FIFA World Cup 2026 Stadium Operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-secondary">
            <Clock className="w-4 h-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <Link to="/dashboard/settings" className="btn-ghost flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Total Crowd</p>
              <p className="text-xl font-bold text-primary">{stats.totalPeople.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Critical Zones</p>
              <p className="text-xl font-bold text-red-600">{stats.criticalZones}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Active Volunteers</p>
              <p className="text-xl font-bold text-primary">{stats.activeVolunteers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Active Alerts</p>
              <p className="text-xl font-bold text-amber-600">{stats.activeAlerts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Open Incidents</p>
              <p className="text-xl font-bold text-primary">{stats.openIncidents}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {stats.liveMatch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card gradient-primary text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded bg-white/20 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                LIVE MATCH
              </div>
              <div>
                <h3 className="text-xl font-bold">{stats.liveMatch.home_team} vs {stats.liveMatch.away_team}</h3>
                <p className="text-sm opacity-75">{stats.liveMatch.match_type.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">2 - 1</p>
              <p className="text-sm opacity-75">67th minute</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Active Alerts & AI Recommendations</h2>
              <Link to="/dashboard/alerts" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {alerts.filter(a => !a.is_resolved).length > 0 ? (
                alerts.filter(a => !a.is_resolved).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'emergency' || alert.severity === 'critical'
                        ? 'bg-red-50 border-red-500'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            alert.severity === 'emergency' || alert.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-tertiary">{alert.type}</span>
                        </div>
                        <h3 className="font-medium text-primary">{alert.title}</h3>
                        <p className="text-sm text-secondary mt-1">{alert.message}</p>
                        {alert.action_required && (
                          <p className="text-sm text-primary mt-2 font-medium">
                            Action: {alert.action_required}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded bg-white text-sm font-medium text-accent-700 hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-accent-500 mb-2" />
                  <p className="text-secondary">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4">Crowd Distribution</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['low', 'moderate', 'high', 'critical'].map((level) => {
                const count = crowdData.filter((c) => c.density_level === level).length;
                const percentages = crowdData.length > 0 ? Math.round((count / crowdData.length) * 100) : 0;
                return (
                  <div key={level} className="p-4 rounded-lg bg-secondary text-center">
                    <p className={`text-2xl font-bold ${
                      level === 'critical' ? 'text-red-600' :
                      level === 'high' ? 'text-amber-600' :
                      level === 'moderate' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {count}
                    </p>
                    <p className="text-sm text-secondary capitalize">{level}</p>
                    <p className="text-xs text-tertiary">{percentages}%</p>
                  </div>
                );
              })}
            </div>
            <Link
              to="/dashboard/crowd"
              className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700"
            >
              View detailed crowd intelligence <ChevronRight className="w-4 h-4 inline" />
            </Link>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Upcoming Matches</h2>
              <Link to="/dashboard/matches" className="text-sm text-primary-600">View Schedule</Link>
            </div>
            <div className="space-y-3">
              {matches.slice(0, 3).map((match) => (
                <div key={match.id} className="p-4 rounded-lg bg-secondary flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">{match.home_team} vs {match.away_team}</p>
                    <p className="text-sm text-secondary">{match.match_type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      match.status === 'live' ? 'bg-green-100 text-green-700' :
                      match.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Volunteer Status</h2>
              <Link to="/dashboard/volunteers" className="text-sm text-primary-600">Manage</Link>
            </div>
            <div className="space-y-3">
              {['active', 'break', 'off_duty'].map((status) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm text-primary capitalize">{status.replace('_', ' ')}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'active' ? 'bg-green-100 text-green-700' :
                    status === 'break' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {volunteers.filter((v) => v.status === status).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Recent Incidents</h2>
              <Link to="/dashboard/incidents" className="text-sm text-primary-600">View All</Link>
            </div>
            <div className="space-y-3">
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <div key={incident.id} className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">{incident.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        incident.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-xs text-tertiary capitalize">{incident.type} - {incident.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary py-4">No recent incidents</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Leaf className="w-5 h-5 text-accent-600" />
                Sustainability
              </h2>
              <Link to="/dashboard/sustainability" className="text-sm text-primary-600">Details</Link>
            </div>
            <div className="space-y-3">
              {recentSustainability.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm text-secondary">{metric.metric_type.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-primary">
                    {metric.value.toLocaleString()} {metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary">AI Operational Insights</h3>
            <p className="text-sm text-secondary mt-1">
              Based on current crowd patterns, recommend redeploying 2 volunteers from Section 100N (low traffic)
              to Gate A2 (critical queue). Consider opening alternate Gate C1 to reduce congestion.
            </p>
          </div>
          <button className="btn-primary">Apply Recommendations</button>
        </div>
      </div>
    </div>
  );
}
