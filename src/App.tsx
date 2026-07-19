import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import type { UserRole } from './types';

const LandingPage = lazy(() => import('./components/landing/HeroSection').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./components/auth/AuthPages').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./components/auth/AuthPages').then((m) => ({ default: m.RegisterPage })));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout').then((m) => ({ default: m.DashboardLayout })));
const FanDashboard = lazy(() => import('./components/dashboard/FanDashboard').then((m) => ({ default: m.FanDashboard })));
const AIAssistant = lazy(() => import('./components/ai/AIAssistant').then((m) => ({ default: m.AIAssistant })));
const StadiumMap = lazy(() => import('./components/maps/StadiumMap').then((m) => ({ default: m.StadiumMap })));
const CrowdIntelligence = lazy(() => import('./components/crowd/CrowdIntelligence').then((m) => ({ default: m.CrowdIntelligence })));
const TransportHub = lazy(() => import('./components/transport/TransportHub').then((m) => ({ default: m.TransportHub })));
const SustainabilityDashboard = lazy(() => import('./components/sustainability/SustainabilityDashboard').then((m) => ({ default: m.SustainabilityDashboard })));
const VolunteerDashboard = lazy(() => import('./components/volunteer/VolunteerDashboard').then((m) => ({ default: m.VolunteerDashboard })));
const OrganizerDashboard = lazy(() => import('./components/organizer/OrganizerDashboard').then((m) => ({ default: m.OrganizerDashboard })));
const ChallengeAlignmentPage = lazy(() => import('./components/alignment/ChallengeAlignmentPage').then((m) => ({ default: m.ChallengeAlignmentPage })));

function DashboardRouter() {
  const { profile } = useAuth();
  if (!profile) return null;

  const roleDashboards: Record<UserRole, JSX.Element> = {
    fan: <FanDashboard />,
    volunteer: <VolunteerDashboard />,
    venue_staff: <OrganizerDashboard />,
    organizer: <OrganizerDashboard />,
  };

  return roleDashboards[profile.role] ?? <FanDashboard />;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
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
                  <Route path="alignment" element={<ChallengeAlignmentPage />} />
                  <Route
                    path="tasks"
                    element={
                      <ProtectedRoute allowedRoles={['volunteer']}>
                        <VolunteerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="alerts" element={<Navigate to="/dashboard" replace />} />
                  <Route path="facilities" element={<Navigate to="/dashboard" replace />} />
                  <Route path="volunteers" element={<Navigate to="/dashboard" replace />} />
                  <Route path="incidents" element={<Navigate to="/dashboard" replace />} />
                  <Route path="matches" element={<Navigate to="/dashboard" replace />} />
                </Route>


                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
