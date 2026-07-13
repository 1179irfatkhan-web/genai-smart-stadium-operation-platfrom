import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Zap, Recycle, Wind } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SkeletonDashboard } from '../common/Skeletons';
import type { SustainabilityMetric } from '../../types';

const METRIC_ICONS: Record<string, typeof Leaf> = {
  water_usage: Droplets,
  energy_usage: Zap,
  waste_recycled: Recycle,
  waste_total: Recycle,
  carbon_footprint: Wind,
  water_refills: Droplets,
  reusable_cups: Recycle,
};

export function SustainabilityDashboard() {
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('sustainability_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(50);
    setMetrics((data as SustainabilityMetric[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonDashboard />;

  const latest = metrics.reduce<Record<string, SustainabilityMetric>>((acc, m) => {
    if (!acc[m.metric_type]) acc[m.metric_type] = m;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Leaf className="w-6 h-6" aria-hidden="true" />
          Sustainability Dashboard
        </h1>
        <p className="text-sm text-secondary mt-1">Environmental impact tracking for FIFA World Cup 2026.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(latest).map(([key, metric], i) => {
          const Icon = METRIC_ICONS[key] ?? Leaf;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card space-y-2"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center" aria-hidden="true">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-tertiary capitalize">{key.replace('_', ' ')}</p>
              <p className="text-xl font-bold text-primary">
                {metric.value.toLocaleString()} <span className="text-sm font-normal text-secondary">{metric.unit}</span>
              </p>
              <p className="text-xs text-tertiary capitalize">{metric.period.replace('_', ' ')}</p>
            </motion.div>
          );
        })}
      </div>

      {metrics.length === 0 && (
        <div className="card text-center py-8">
          <Leaf className="w-8 h-8 text-tertiary mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-secondary">No sustainability data available yet.</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-primary mb-3">Recent Measurements</h2>
        <div className="space-y-3">
          {metrics.slice(0, 10).map((metric, i) => {
            const Icon = METRIC_ICONS[metric.metric_type] ?? Leaf;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center" aria-hidden="true">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary capitalize">{metric.metric_type.replace('_', ' ')}</p>
                    <p className="text-xs text-tertiary">{new Date(metric.recorded_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{metric.value.toLocaleString()} {metric.unit}</p>
                  {metric.notes && <p className="text-xs text-tertiary">{metric.notes}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
