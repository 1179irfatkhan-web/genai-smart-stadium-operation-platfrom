import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, MapPin, Activity, RefreshCw, TrendingUp, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { CrowdDensity, Gate } from '../../types';
import { Skeleton } from '../common/LoadingSpinner';

export function CrowdIntelligence() {
  const [loading, setLoading] = useState(true);
  const [crowdData, setCrowdData] = useState<CrowdDensity[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchCrowdData();
    const interval = setInterval(fetchCrowdData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCrowdData() {
    try {
      const [crowdRes, gatesRes] = await Promise.all([
        supabase
          .from('crowd_density')
          .select('*')
          .order('zone_name'),
        supabase
          .from('gates')
          .select('*')
          .order('current_queue', { ascending: false }),
      ]);

      if (crowdRes.data) setCrowdData(crowdRes.data);
      if (gatesRes.data) setGates(gatesRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching crowd data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getDensityColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      case 'moderate': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
      case 'high': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
      case 'critical': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };

  const stats = {
    total: crowdData.reduce((sum, d) => sum + d.people_count, 0),
    critical: crowdData.filter((d) => d.density_level === 'critical').length,
    high: crowdData.filter((d) => d.density_level === 'high').length,
    avgDensity: crowdData.length > 0
      ? Math.round(crowdData.reduce((sum, d) => sum + (d.people_count / (d.max_capacity || 1)) * 100, 0) / crowdData.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Crowd Intelligence</h1>
          <p className="text-secondary mt-1">Real-time crowd density and flow analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-sm text-tertiary flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchCrowdData}
            className="btn-ghost flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Total People</p>
              <p className="text-2xl font-bold text-primary">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card border-l-4 border-l-red-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Critical Zones</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card border-l-4 border-l-amber-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">High Density</p>
              <p className="text-2xl font-bold text-amber-600">{stats.high}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Avg. Occupancy</p>
              <p className="text-2xl font-bold text-primary">{stats.avgDensity}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4">Gate Queue Status</h2>
          <div className="space-y-3">
            {gates.map((gate) => {
              const percentage = gate.max_capacity ? (gate.current_queue / gate.max_capacity) * 100 : 0;
              const colors = getDensityColor(
                percentage > 80 ? 'critical' : percentage > 60 ? 'high' : percentage > 40 ? 'moderate' : 'low'
              );

              return (
                <div key={gate.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-tertiary flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary text-sm truncate">{gate.name}</p>
                      <p className="text-xs text-tertiary">{gate.code}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-secondary">{gate.current_queue} people</span>
                      <span className={colors.text}>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bg.replace('100', '500')} transition-all duration-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gate.status === 'open' ? 'bg-green-100 text-green-700' :
                    gate.status === 'restricted' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {gate.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4">Zone Heatmap</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {crowdData.map((zone) => {
              const colors = getDensityColor(zone.density_level);
              return (
                <div
                  key={zone.id}
                  className={`p-4 rounded-xl ${colors.bg} ${colors.border} border`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-tertiary uppercase">
                      {zone.zone_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.text}`}>
                      {zone.density_level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary truncate">{zone.zone_name}</p>
                  <p className="text-lg font-bold mt-1">
                    {zone.people_count.toLocaleString()}
                    {zone.max_capacity && (
                      <span className="text-sm font-normal text-tertiary">
                        /{zone.max_capacity.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(stats.critical > 0 || stats.high > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card border-l-4 border-l-amber-500"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary">AI Recommendations</h3>
              <ul className="mt-2 space-y-2 text-sm text-secondary">
                {crowdData
                  .filter((d) => d.density_level === 'critical' || d.density_level === 'high')
                  .map((zone) => (
                    <li key={zone.id} className="flex items-start gap-2">
                      <ArrowDownRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{zone.zone_name}</strong>: {zone.density_level === 'critical' ? 'Redirect traffic to alternate routes' : 'Monitor closely'}
                      </span>
                    </li>
                  ))}
                {gates
                  .filter((g) => g.current_queue > (g.max_capacity || 0) * 0.6)
                  .slice(0, 2)
                  .map((gate) => (
                    <li key={gate.id} className="flex items-start gap-2">
                      <ArrowUpRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{gate.name}</strong>: Suggest visitors use Gate C1 (Accessible Entrance) - shortest queue
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
