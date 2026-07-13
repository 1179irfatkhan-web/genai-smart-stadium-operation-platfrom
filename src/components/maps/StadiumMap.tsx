import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Accessibility } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SkeletonList } from '../common/Skeletons';
import type { Gate, Facility, CrowdDensity } from '../../types';

export function StadiumMap() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [crowd, setCrowd] = useState<CrowdDensity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Gate | Facility | null>(null);

  const fetchData = useCallback(async () => {
    const [gatesRes, facRes, crowdRes] = await Promise.all([
      supabase.from('gates').select('*'),
      supabase.from('facilities').select('*'),
      supabase.from('crowd_density').select('*').order('recorded_at', { ascending: false }),
    ]);
    setGates((gatesRes.data as Gate[]) || []);
    setFacilities((facRes.data as Facility[]) || []);
    setCrowd((crowdRes.data as CrowdDensity[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <MapPin className="w-6 h-6" aria-hidden="true" />
          Stadium Map
        </h1>
        <p className="text-sm text-secondary mt-1">Interactive map of gates, facilities, and crowd density.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card min-h-[500px] relative overflow-hidden" role="region" aria-label="Stadium map view">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-secondary-800 dark:to-secondary-900" aria-hidden="true" />
          <div className="relative h-full p-4">
            <div className="grid grid-cols-3 gap-2 h-full">
              {gates.map((gate) => {
                const crowdInfo = crowd.find((c) => c.zone_name === gate.name);
                return (
                  <motion.button
                    key={gate.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelected(gate)}
                    className={`rounded-lg p-3 text-center border-2 transition-all ${
                      gate.status === 'open' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      gate.status === 'closed' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    }`}
                    aria-label={`Gate ${gate.name}, status ${gate.status}, queue ${gate.current_queue}`}
                  >
                    <p className="text-sm font-bold text-primary">{gate.name}</p>
                    <p className="text-xs text-secondary">{gate.code}</p>
                    <p className="text-xs text-tertiary mt-1">Queue: {gate.current_queue}</p>
                    {crowdInfo && (
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs ${
                        crowdInfo.density_level === 'low' ? 'bg-green-100 text-green-700' :
                        crowdInfo.density_level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        crowdInfo.density_level === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {crowdInfo.density_level}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {facilities.map((facility) => (
                <motion.button
                  key={facility.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelected(facility)}
                  className={`rounded-lg p-3 text-center border-2 transition-all ${
                    facility.status === 'operational' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                    'border-gray-400 bg-gray-50 dark:bg-gray-800/20'
                  }`}
                  aria-label={`Facility ${facility.name}, type ${facility.type}, status ${facility.status}`}
                >
                  <p className="text-sm font-bold text-primary">{facility.name}</p>
                  <p className="text-xs text-secondary capitalize">{facility.type.replace('_', ' ')}</p>
                  {facility.is_accessible && (
                    <Accessibility className="w-3.5 h-3.5 text-blue-600 mx-auto mt-1" aria-label="Accessible" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="card space-y-4" role="region" aria-label="Selected location details">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Navigation className="w-5 h-5" aria-hidden="true" />
            Details
          </h2>

          {!selected ? (
            <p className="text-sm text-secondary">Select a gate or facility to see details.</p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <h3 className="font-medium text-primary">
                {'name' in selected ? selected.name : ''}
              </h3>
              <dl className="space-y-2 text-sm">
                {'code' in selected ? (
                  <>
                    <div><dt className="text-tertiary inline">Code: </dt><dd className="text-primary inline">{selected.code}</dd></div>
                    <div><dt className="text-tertiary inline">Type: </dt><dd className="text-primary inline capitalize">{selected.type}</dd></div>
                    <div><dt className="text-tertiary inline">Status: </dt><dd className="text-primary inline capitalize">{selected.status}</dd></div>
                    <div><dt className="text-tertiary inline">Queue: </dt><dd className="text-primary inline">{selected.current_queue}</dd></div>
                    {selected.is_accessible && <div><dt className="text-tertiary inline">Accessible: </dt><dd className="text-primary inline">Yes</dd></div>}
                  </>
                ) : (
                  <>
                    <div><dt className="text-tertiary inline">Type: </dt><dd className="text-primary inline capitalize">{selected.type.replace('_', ' ')}</dd></div>
                    <div><dt className="text-tertiary inline">Status: </dt><dd className="text-primary inline capitalize">{selected.status}</dd></div>
                    {selected.location && <div><dt className="text-tertiary inline">Location: </dt><dd className="text-primary inline">{selected.location}</dd></div>}
                    {selected.is_accessible && <div><dt className="text-tertiary inline">Accessible: </dt><dd className="text-primary inline">Yes</dd></div>}
                  </>
                )}
              </dl>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
