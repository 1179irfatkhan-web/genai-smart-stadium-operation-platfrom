import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Map, Users, MessageSquare, Bus, Leaf, TriangleAlert as AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { SkeletonDashboard } from '../common/Skeletons';
import type { Alert, CrowdDensity, Match } from '../../types';

interface DashboardStats {
  crowdLevel: string;
  activeAlerts: number;
  upcomingMatches: number;
  facilitiesOpen: number;
}

export function FanDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [alertsRes, matchesRes, crowdRes, facilitiesRes] = await Promise.all([
      supabase.from('alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('matches').select('*').order('match_date').limit(3),
      supabase.from('crowd_density').select('*').order('recorded_at', { ascending: false }).limit(10),
      supabase.from('facilities').select('*').eq('status', 'operational'),
    ]);

    const crowdData = crowdRes.data as CrowdDensity[] | null;
    const dominantLevel = crowdData && crowdData.length > 0
      ? crowdData[0].density_level
      : 'low';

    setStats({
      crowdLevel: dominantLevel,
      activeAlerts: alertsRes.data?.length ?? 0,
      upcomingMatches: matchesRes.data?.length ?? 0,
      facilitiesOpen: facilitiesRes.data?.length ?? 0,
    });
    setAlerts((alertsRes.data as Alert[]) || []);
    setMatches((matchesRes.data as Match[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonDashboard />;
  if (!stats) return <LoadingSpinner size="lg" />;

  const quickActions = [
    { icon: Map, label: 'Find My Seat', color: 'bg-blue-100 text-blue-600' },
    { icon: Users, label: 'Crowd Status', color: 'bg-green-100 text-green-600' },
    { icon: MessageSquare, label: 'Ask AI', color: 'bg-purple-100 text-purple-600' },
    { icon: Bus, label: 'Transport', color: 'bg-orange-100 text-orange-600' },
    { icon: Leaf, label: 'Sustainability', color: 'bg-emerald-100 text-emerald-600' },
    { icon: AlertTriangle, label: 'Report Issue', color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Welcome, {profile?.full_name?.split(' ')[0] || 'Fan'}!
        </h1>
        <p className="text-sm text-secondary mt-1">Here's your stadium overview for today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Crowd Level" value={stats.crowdLevel} color="bg-blue-100 text-blue-600" />
        <StatCard icon={AlertTriangle} label="Active Alerts" value={String(stats.activeAlerts)} color="bg-red-100 text-red-600" />
        <StatCard icon={Map} label="Facilities Open" value={String(stats.facilitiesOpen)} color="bg-green-100 text-green-600" />
        <StatCard icon={Users} label="Upcoming Matches" value={String(stats.upcomingMatches)} color="bg-orange-100 text-orange-600" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-primary mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="card flex flex-col items-center gap-2 p-4 cursor-pointer"
              aria-label={action.label}
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-primary text-center">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card flex items-start gap-3"
              >
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  alert.severity === 'critical' || alert.severity === 'emergency'
                    ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                }`} aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-primary">{alert.title}</h3>
                  <p className="text-sm text-secondary mt-1">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Upcoming Matches</h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary">{match.home_team} vs {match.away_team}</h3>
                  <p className="text-sm text-secondary capitalize">{match.match_type.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">
                    {new Date(match.match_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                    match.status === 'live' ? 'bg-green-100 text-green-700' :
                    match.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Map; label: string; value: string; color: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-tertiary">{label}</p>
        <p className="text-lg font-bold text-primary capitalize truncate">{value}</p>
      </div>
    </div>
  );
}
