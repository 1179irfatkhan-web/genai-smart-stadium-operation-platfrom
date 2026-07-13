import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Zap, Recycle, Footprints, ArrowRight, Award, TrendingUp, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Facility, SustainabilityMetric } from '../../types';
import { Skeleton } from '../common/LoadingSpinner';

export function SustainabilityDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>([]);
  const [waterStations, setWaterStations] = useState<Facility[]>([]);
  const [recyclingBins, setRecyclingBins] = useState<Facility[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, waterRes, recyclingRes] = await Promise.all([
          supabase.from('sustainability_metrics').select('*').order('recorded_at', { ascending: false }),
          supabase.from('facilities').select('*').eq('type', 'water_refill').eq('status', 'operational'),
          supabase.from('facilities').select('*').eq('type', 'recycling_bin').eq('status', 'operational'),
        ]);

        if (metricsRes.data) setMetrics(metricsRes.data);
        if (waterRes.data) setWaterStations(waterRes.data as Facility[]);
        if (recyclingRes.data) setRecyclingBins(recyclingRes.data as Facility[]);
      } catch (error) {
        console.error('Error fetching sustainability data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const metricsByKey = metrics.reduce((acc, m) => {
    if (!acc[m.metric_type]) acc[m.metric_type] = [];
    acc[m.metric_type].push(m);
    return acc;
  }, {} as Record<string, SustainabilityMetric[]>);

  const latestMetrics = {
    waterRefills: metricsByKey.water_refills?.[0]?.value || 15234,
    recyclingRate: metricsByKey.waste_recycled?.[0]?.value || 45,
    energyUsage: metricsByKey.energy_usage?.[0]?.value || 2850,
    carbonOffset: metricsByKey.carbon_footprint?.[0]?.value || 12.5,
    reusableCups: metricsByKey.reusable_cups?.[0]?.value || 28000,
    totalWaste: metricsByKey.waste_total?.[0]?.value || 18.5,
  };

  const tips = [
    {
      icon: Droplets,
      title: 'Free Water Refills',
      description: 'Refill your bottle at any of 4 water stations. Save plastic and stay hydrated!',
      action: 'Find Nearest Station',
    },
    {
      icon: Recycle,
      title: 'Recycle Your Waste',
      description: 'Use the recycling bins throughout the stadium. Look for green bins for compost, blue for recyclables.',
      action: 'Locate Recycling Bins',
    },
    {
      icon: Zap,
      title: 'Eco-Friendly Transport',
      description: 'Take the Metro or shuttle to reduce your carbon footprint. The K Line connects directly.',
      action: 'View Transport Options',
    },
    {
      icon: Footprints,
      title: 'Carbon Offset',
      description: 'This event is carbon-neutral. All emissions are offset through verified programs.',
      action: 'Learn More',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Sustainability</h1>
        <p className="text-secondary mt-1">Environmental impact and eco-friendly options</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center flex-shrink-0">
            <Globe className="w-7 h-7 text-accent-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary">Green Stadium Initiative</h2>
            <p className="text-secondary mt-1">
              FIFA World Cup 2026 is committed to sustainability. This stadium uses renewable energy,
              offsets all carbon emissions, and promotes recycling and reusable materials.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Award className="w-5 h-5 text-gold-500" />
              <span className="text-sm font-medium text-primary">ISO 20121 Certified Sustainable Event</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card text-center">
          <Droplets className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-primary">{latestMetrics.waterRefills.toLocaleString()}</p>
          <p className="text-xs text-secondary">Liters Refilled</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card text-center">
          <Recycle className="w-8 h-8 mx-auto text-accent-500 mb-2" />
          <p className="text-2xl font-bold text-primary">{latestMetrics.recyclingRate}%</p>
          <p className="text-xs text-secondary">Recycling Rate</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card text-center">
          <Zap className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-primary">{latestMetrics.energyUsage.toLocaleString()}</p>
          <p className="text-xs text-secondary">kWh (renewable)</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card text-center">
          <Leaf className="w-8 h-8 mx-auto text-accent-600 mb-2" />
          <p className="text-2xl font-bold text-primary">{latestMetrics.carbonOffset}</p>
          <p className="text-xs text-secondary">Tons CO2 Offset</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card text-center">
          <TrendingUp className="w-8 h-8 mx-auto text-primary-500 mb-2" />
          <p className="text-2xl font-bold text-primary">{latestMetrics.reusableCups.toLocaleString()}</p>
          <p className="text-xs text-secondary">Reusable Cups</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card text-center">
          <Footprints className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <p className="text-2xl font-bold text-primary">{latestMetrics.totalWaste}</p>
          <p className="text-xs text-secondary">Tons Waste</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Water Refill Stations ({waterStations.length})
          </h2>
          <p className="text-sm text-secondary mb-4">
            Stay hydrated and reduce plastic waste! All water stations provide free filtered water.
          </p>
          <div className="space-y-3">
            {waterStations.map((station) => (
              <div key={station.id} className="p-3 rounded-lg bg-secondary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary text-sm">{station.name}</p>
                    <p className="text-xs text-tertiary">{station.location}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-accent-100 text-accent-700 text-xs font-medium">
                  Free
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-accent-500" />
            Recycling Bins ({recyclingBins.length})
          </h2>
          <p className="text-sm text-secondary mb-4">
            Help us keep the stadium green! Sort your waste into the correct bins.
          </p>
          <div className="space-y-3">
            {recyclingBins.slice(0, 5).map((bin) => (
              <div key={bin.id} className="p-3 rounded-lg bg-secondary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary text-sm">{bin.name}</p>
                    <p className="text-xs text-tertiary">{bin.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-4">Sustainability Tips</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-secondary hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center mb-3">
                <tip.icon className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="font-medium text-primary mb-1">{tip.title}</h3>
              <p className="text-sm text-secondary mb-3">{tip.description}</p>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {tip.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card bg-tertiary">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-accent-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary">Your Impact Today</h3>
            <p className="text-sm text-secondary mt-1">
              By using the water refill stations, choosing eco-transport, and recycling,
              you've helped save {' '}
              <span className="font-medium text-accent-600">2.5kg of CO2</span> and{' '}
              <span className="font-medium text-blue-600">3 single-use bottles</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
