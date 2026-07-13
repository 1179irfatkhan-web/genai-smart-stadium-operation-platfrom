import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SkeletonList } from '../common/Skeletons';
import { DENSITY_COLORS } from '../../constants';
import type { CrowdDensity } from '../../types';

export function CrowdIntelligence() {
  const [crowdData, setCrowdData] = useState<CrowdDensity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('crowd_density')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(50);
    setCrowdData((data as CrowdDensity[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonList count={5} />;

  const critical = crowdData.filter((c) => c.density_level === 'critical');
  const high = crowdData.filter((c) => c.density_level === 'high');
  const moderate = crowdData.filter((c) => c.density_level === 'moderate');
  const low = crowdData.filter((c) => c.density_level === 'low');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Users className="w-6 h-6" aria-hidden="true" />
          Crowd Intelligence
        </h1>
        <p className="text-sm text-secondary mt-1">Real-time crowd density monitoring across stadium zones.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Critical" value={critical.length} color="bg-red-100 text-red-600" />
        <StatCard label="High" value={high.length} color="bg-orange-100 text-orange-600" />
        <StatCard label="Moderate" value={moderate.length} color="bg-yellow-100 text-yellow-600" />
        <StatCard label="Low" value={low.length} color="bg-green-100 text-green-600" />
      </div>

      {critical.length > 0 && (
        <div role="alert" className="card border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
            <h2 className="font-semibold text-red-700">Critical Zones Require Attention</h2>
          </div>
          <p className="text-sm text-red-600">
            {critical.map((c) => c.zone_name).join(', ')} are at critical density.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-primary mb-3">All Zones</h2>
        <div className="space-y-3">
          {crowdData.length === 0 ? (
            <p className="text-sm text-secondary">No crowd data available.</p>
          ) : (
            crowdData.map((zone, i) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      zone.density_level === 'critical' ? 'bg-red-100 text-red-600' :
                      zone.density_level === 'high' ? 'bg-orange-100 text-orange-600' :
                      zone.density_level === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`} aria-hidden="true">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">{zone.zone_name}</h3>
                      <p className="text-xs text-tertiary capitalize">{zone.zone_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${DENSITY_COLORS[zone.density_level]}`} role="status">
                      {zone.density_level}
                    </span>
                    <p className="text-sm text-secondary mt-1">{zone.people_count} people</p>
                  </div>
                </div>
                {zone.max_capacity && (
                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-tertiary overflow-hidden" role="progressbar" aria-valuenow={zone.people_count} aria-valuemax={zone.max_capacity} aria-label="Crowd capacity">
                      <div
                        className={`h-full transition-all ${
                          zone.density_level === 'critical' ? 'bg-red-500' :
                          zone.density_level === 'high' ? 'bg-orange-500' :
                          zone.density_level === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (zone.people_count / zone.max_capacity) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-tertiary mt-1">
                      {Math.round((zone.people_count / zone.max_capacity) * 100)}% capacity
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`} aria-hidden="true">
        <Users className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-tertiary">{label}</p>
        <p className="text-lg font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}
