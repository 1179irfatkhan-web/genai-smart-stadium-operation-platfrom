import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SkeletonDashboard } from '../common/Skeletons';
import type { Alert, Incident, Volunteer, Match } from '../../types';

export function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const fetchData = useCallback(async () => {
    const [volRes, incRes, alertRes, matchRes] = await Promise.all([
      supabase.from('volunteers').select('*'),
      supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('matches').select('*').order('match_date').limit(5),
    ]);

    setVolunteers((volRes.data as Volunteer[]) || []);
    setIncidents((incRes.data as Incident[]) || []);
    setAlerts((alertRes.data as Alert[]) || []);
    setMatches((matchRes.data as Match[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonDashboard />;

  const activeVolunteers = volunteers.filter((v) => v.status === 'active').length;
  const openIncidents = incidents.filter((i) => i.status === 'reported' || i.status === 'acknowledged').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Organizer Dashboard</h1>
        <p className="text-sm text-secondary mt-1">Full operational overview for FIFA World Cup 2026.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Volunteers" value={String(activeVolunteers)} color="bg-blue-100 text-blue-600" />
        <StatCard icon={AlertTriangle} label="Open Incidents" value={String(openIncidents)} color="bg-red-100 text-red-600" />
        <StatCard icon={Activity} label="Active Alerts" value={String(alerts.length)} color="bg-amber-100 text-amber-600" />
        <StatCard icon={Calendar} label="Scheduled Matches" value={String(matches.length)} color="bg-green-100 text-green-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Recent Incidents</h2>
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <p className="text-sm text-secondary">No incidents reported.</p>
            ) : (
              incidents.map((inc, i) => (
                <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-primary">{inc.title}</h3>
                      <p className="text-sm text-secondary mt-1">{inc.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      inc.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      inc.severity === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>{inc.severity}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Active Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-secondary">No active alerts.</p>
            ) : (
              alerts.map((alert, i) => (
                <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    }`} aria-hidden="true" />
                    <div>
                      <h3 className="font-medium text-primary">{alert.title}</h3>
                      <p className="text-sm text-secondary mt-1">{alert.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-tertiary">{label}</p>
        <p className="text-lg font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}
