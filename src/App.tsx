import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage, RegisterPage } from './components/auth/AuthPages';
import { LandingPage } from './components/landing/HeroSection';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { FanDashboard } from './components/dashboard/FanDashboard';
import { AIAssistant } from './components/ai/AIAssistant';
import { StadiumMap } from './components/maps/StadiumMap';
import { CrowdIntelligence } from './components/crowd/CrowdIntelligence';
import { TransportHub } from './components/transport/TransportHub';
import { SustainabilityDashboard } from './components/sustainability/SustainabilityDashboard';
import { VolunteerDashboard } from './components/volunteer/VolunteerDashboard';
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { useAuth } from './contexts/AuthContext';

function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'organizer':
      return <OrganizerDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'venue_staff':
      return <OrganizerDashboard />;
    default:
      return <FanDashboard />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardRouter />} />
              <Route path="map" element={<StadiumMap />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="crowd" element={<CrowdIntelligence />} />
              <Route path="transport" element={<TransportHub />} />
              <Route path="sustainability" element={<SustainabilityDashboard />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              <Route
                path="volunteers"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <VolunteerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="incidents"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'venue_staff']}>
                    <IncidentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="matches"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="facilities"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'venue_staff']}>
                    <FacilitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

import { AlertTriangle, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import type { Alert as AlertType, Incident, Volunteer, Match, Facility } from './types';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
      if (data) setAlerts(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Alerts & Notifications</h1>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card ${alert.is_resolved ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 ${
                alert.severity === 'critical' || alert.severity === 'emergency'
                  ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-primary">{alert.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    alert.is_resolved ? 'bg-gray-100 text-gray-600' :
                    alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.is_resolved ? 'Resolved' : alert.severity}
                  </span>
                </div>
                <p className="text-sm text-secondary mt-1">{alert.message}</p>
                <p className="text-xs text-tertiary mt-2">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [language, setLanguage] = useState(profile?.language_preference || 'en');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: fullName, language_preference: language });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="pt">Portuguese</option>
            <option value="ar">Arabic</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">Email</label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
            className="input-field opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">Role</label>
          <input
            type="text"
            value={profile?.role?.replace('_', ' ') || ''}
            disabled
            className="input-field opacity-60 capitalize"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('volunteers').select('*');
      if (data) setVolunteers(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Volunteer Management</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((vol) => (
          <div key={vol.id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center">
                <UserCog className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-primary">Volunteer</p>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  vol.status === 'active' ? 'bg-green-100 text-green-700' :
                  vol.status === 'break' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {vol.status}
                </span>
              </div>
            </div>
            <div className="text-sm text-secondary">
              <p>Zones: {vol.assigned_zones?.join(', ') || 'Unassigned'}</p>
              {vol.shift_start && <p>Shift: {new Date(vol.shift_start).toLocaleTimeString()}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (data) setIncidents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Incident Reports</h1>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-primary">{incident.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-sm text-secondary mt-1">{incident.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-tertiary">
                  <span className="capitalize">{incident.type}</span>
                  <span className="capitalize">{incident.status}</span>
                  {incident.location && <span>{incident.location}</span>}
                </div>
              </div>
              <span className="text-xs text-tertiary">
                {new Date(incident.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('matches').select('*').order('match_date');
      if (data) setMatches(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Match Schedule</h1>
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary text-lg">
                  {match.home_team} vs {match.away_team}
                </h3>
                <p className="text-sm text-secondary mt-1 capitalize">{match.match_type.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary">
                  {new Date(match.match_date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-secondary">
                  {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                  match.status === 'live' ? 'bg-green-100 text-green-700' :
                  match.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {match.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('facilities').select('*');
      if (data) setFacilities(data as Facility[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = filter === 'all' ? facilities : facilities.filter(f => f.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Facilities</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Types</option>
          <option value="restroom">Restrooms</option>
          <option value="food_stall">Food</option>
          <option value="medical_center">Medical</option>
          <option value="water_refill">Water Refill</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((facility) => (
          <div key={facility.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-primary">{facility.name}</h3>
                <p className="text-sm text-secondary capitalize">{facility.type.replace('_', ' ')}</p>
                {facility.location && (
                  <p className="text-xs text-tertiary mt-1">{facility.location}</p>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${
                facility.status === 'operational' ? 'bg-green-100 text-green-700' :
                facility.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {facility.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
