import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bus, Car, Train, Accessibility, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SkeletonList } from '../common/Skeletons';
import type { Transportation } from '../../types';

const TRANSPORT_ICONS: Record<string, typeof Bus> = {
  metro: Train,
  bus: Bus,
  taxi: Car,
  parking: Car,
  shuttle: Bus,
  rideshare: Car,
};

export function TransportHub() {
  const [transport, setTransport] = useState<Transportation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from('transportation').select('*');
    setTransport((data as Transportation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Bus className="w-6 h-6" aria-hidden="true" />
          Transport Hub
        </h1>
        <p className="text-sm text-secondary mt-1">Transportation options and simulated real-time availability.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transport.length === 0 ? (
          <p className="text-sm text-secondary">No transport data available.</p>
        ) : (
          transport.map((t, i) => {
            const Icon = TRANSPORT_ICONS[t.type] ?? Bus;
            const availabilityPct = t.capacity && t.current_availability !== null
              ? Math.round((t.current_availability / t.capacity) * 100)
              : null;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center" aria-hidden="true">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">{t.name}</h3>
                    <p className="text-xs text-tertiary capitalize">{t.type}</p>
                  </div>
                </div>

                {t.location && <p className="text-sm text-secondary">{t.location}</p>}
                {t.distance_meters !== null && (
                  <p className="text-xs text-tertiary">{(t.distance_meters / 1000).toFixed(1)} km away</p>
                )}

                {availabilityPct !== null && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-tertiary">Availability</span>
                      <span className="text-primary font-medium">{availabilityPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-tertiary overflow-hidden" role="progressbar" aria-valuenow={availabilityPct} aria-valuemax={100} aria-label="Availability">
                      <div
                        className={`h-full ${availabilityPct > 50 ? 'bg-green-500' : availabilityPct > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${availabilityPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {t.operating_hours && (
                  <p className="text-xs text-tertiary flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.operating_hours}
                  </p>
                )}

                {t.accessibility_features.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.accessibility_features.join(', ')}</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
