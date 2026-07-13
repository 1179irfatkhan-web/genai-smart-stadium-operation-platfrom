import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Car, Train, Clock, Accessibility, Navigation, RefreshCw, ParkingCircle, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Transportation } from '../../types';
import { Skeleton } from '../common/LoadingSpinner';

const transportIcons: Record<string, typeof Bus> = {
  metro: Train,
  bus: Bus,
  taxi: Car,
  parking: ParkingCircle,
  shuttle: Bus,
  rideshare: Car,
};

export function TransportHub() {
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState<Transportation[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTransportData();
    const interval = setInterval(fetchTransportData, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTransportData() {
    try {
      const { data } = await supabase.from('transportation').select('*').order('distance_meters');
      if (data) setTransport(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching transport data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTransport = transport.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'accessible') return t.accessibility_features.length > 0;
    return t.type === filter;
  });

  const availableSpots = transport.find((t) => t.type === 'parking' && t.name.includes('A'));
  const metroCapacity = transport.find((t) => t.type === 'metro');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Transportation Hub</h1>
          <p className="text-secondary mt-1">Real-time transit and parking information</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-sm text-tertiary flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchTransportData}
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
              <ParkingCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Parking Available</p>
              <p className="text-2xl font-bold text-primary">
                {availableSpots?.current_availability?.toLocaleString() || '6,700'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <Train className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Metro Capacity</p>
              <p className="text-2xl font-bold text-primary">
                {metroCapacity?.current_availability?.toLocaleString() || '3,500'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Taxis Ready</p>
              <p className="text-2xl font-bold text-primary">35</p>
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
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Accessibility className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Accessible Options</p>
              <p className="text-2xl font-bold text-primary">
                {transport.filter((t) => t.accessibility_features.length > 0).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { type: 'all', label: 'All', icon: MapPin },
          { type: 'metro', label: 'Metro', icon: Train },
          { type: 'bus', label: 'Bus', icon: Bus },
          { type: 'parking', label: 'Parking', icon: ParkingCircle },
          { type: 'shuttle', label: 'Shuttle', icon: Bus },
          { type: 'taxi', label: 'Taxi', icon: Car },
          { type: 'rideshare', label: 'Rideshare', icon: Car },
          { type: 'accessible', label: 'Accessible', icon: Accessibility },
        ].map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              filter === type ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-secondary text-secondary hover:bg-tertiary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTransport.map((t, index) => {
          const Icon = transportIcons[t.type] || Bus;
          const usagePercent = t.capacity && t.current_availability
            ? ((t.capacity - t.current_availability) / t.capacity) * 100
            : 0;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{t.name}</h3>
                    <p className="text-xs text-tertiary capitalize">{t.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">
                    {t.current_availability?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-xs text-tertiary">
                    {t.capacity ? `/ ${t.capacity.toLocaleString()}` : 'available'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <MapPin className="w-4 h-4 text-tertiary" />
                  <span>{t.location}</span>
                  {t.distance_meters && (
                    <span className="text-tertiary">({t.distance_meters}m)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Clock className="w-4 h-4 text-tertiary" />
                  <span>{t.operating_hours || 'Extended hours'}</span>
                </div>
              </div>

              {t.accessibility_features.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {t.accessibility_features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-0.5 rounded bg-accent-100 text-accent-700 text-xs font-medium"
                    >
                      {feature.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {t.capacity && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-secondary">Capacity Usage</span>
                    <span className={usagePercent > 80 ? 'text-red-600' : usagePercent > 60 ? 'text-amber-600' : 'text-accent-600'}>
                      {Math.round(usagePercent)}%
                    </span>
                  </div>
                  <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        usagePercent > 80 ? 'bg-red-500' :
                        usagePercent > 60 ? 'bg-amber-500' :
                        'bg-accent-500'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <button className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                <Navigation className="w-4 h-4" />
                Get Directions
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="card bg-primary-50 border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Recommended Exit Strategy</h3>
            <p className="text-sm text-secondary mt-1">
              For faster exit after the match, consider using the Metro K Line (200m walk) or the Stadium Shuttle.
              Parking Garage A is expected to clear in approximately 45 minutes after final whistle.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-primary-700">
                Metro: 8 min wait
              </span>
              <span className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-primary-700">
                Shuttle: 5 min wait
              </span>
              <span className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-primary-700">
                Taxi: 2 min wait
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
