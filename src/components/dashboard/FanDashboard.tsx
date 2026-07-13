import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin, Clock, Users, Thermometer, Droplets, Bus, Leaf,
  MessageSquare, ArrowRight, AlertTriangle, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Match, CrowdDensity, Alert, Facility } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../common/LoadingSpinner';

export function FanDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [crowdData, setCrowdData] = useState<CrowdDensity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [waterStations, setWaterStations] = useState<Facility[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [matchRes, crowdRes, alertsRes, waterRes] = await Promise.all([
          supabase
            .from('matches')
            .select('*')
            .eq('status', 'live')
            .maybeSingle(),
          supabase
            .from('crowd_density')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(5),
          supabase
            .from('alerts')
            .select('*')
            .eq('is_resolved', false)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('facilities')
            .select('*')
            .eq('type', 'water_refill')
            .eq('status', 'operational')
            .limit(5),
        ]);

        if (matchRes.data) setCurrentMatch(matchRes.data);
        if (crowdRes.data) setCrowdData(crowdRes.data);
        if (alertsRes.data) setAlerts(alertsRes.data);
        if (waterRes.data) setWaterStations(waterRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const getDensityColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-amber-600 bg-amber-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Fan'}!
          </h1>
          <p className="text-secondary mt-1">SoFi Stadium</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tertiary">
          <Thermometer className="w-4 h-4 text-accent-500" />
          <span className="text-sm font-medium">24C Sunny</span>
        </div>
      </div>

      {currentMatch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2 py-1 rounded bg-white/20 text-xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                LIVE
              </div>
              <span className="text-sm opacity-80">{currentMatch.match_type.replace('_', ' ').toUpperCase()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {currentMatch.home_team.slice(0, 3).toUpperCase()}
                </div>
                <p className="font-medium">{currentMatch.home_team}</p>
              </div>

              <div className="px-6 text-center">
                <div className="text-3xl font-bold">2 - 1</div>
                <div className="text-sm opacity-75 mt-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  67'
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {currentMatch.away_team.slice(0, 3).toUpperCase()}
                </div>
                <p className="font-medium">{currentMatch.away_team}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-default bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Calendar className="w-4 h-4" />
              {new Date(currentMatch.match_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/map" className="stat-card hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Find Your Way</p>
              <p className="font-semibold text-primary">Stadium Map</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-tertiary group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/dashboard/ai" className="stat-card hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Get Instant Help</p>
              <p className="font-semibold text-primary">AI Assistant</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-tertiary group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/dashboard/crowd" className="stat-card hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Check Conditions</p>
              <p className="font-semibold text-primary">Crowd Status</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-tertiary group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/dashboard/transport" className="stat-card hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Plan Your Trip</p>
              <p className="font-semibold text-primary">Transport</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-tertiary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Crowd Updates</h2>
            <Link to="/dashboard/crowd" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {crowdData.length > 0 ? (
              crowdData.map((crowd) => (
                <div key={crowd.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tertiary flex items-center justify-center">
                      <Users className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary text-sm">{crowd.zone_name}</p>
                      <p className="text-xs text-tertiary">{crowd.zone_type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDensityColor(crowd.density_level)}`}>
                    {crowd.density_level.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-secondary py-4">No crowd data available</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Quick Access</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {waterStations.slice(0, 3).map((station) => (
              <div key={station.id} className="p-3 rounded-lg bg-secondary text-center">
                <Droplets className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className="text-xs font-medium text-primary truncate">{station.name}</p>
                <p className="text-xs text-accent-500">Free Water</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-default">
            <Link
              to="/dashboard/sustainability"
              className="flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              <Leaf className="w-4 h-4" />
              View Sustainability Tips
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-2">Active Alerts</h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="text-sm">
                    <span className="font-medium text-primary">{alert.title}:</span>{' '}
                    <span className="text-secondary">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
