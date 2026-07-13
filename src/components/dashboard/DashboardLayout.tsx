import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Users, MessageSquare, Bus, Leaf,
  Bell, Settings, LogOut, Menu, X, Sun, Moon, ChevronDown,
  User, AlertTriangle, Calendar, Activity, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/map', icon: Map, label: 'Stadium Map' },
  { to: '/dashboard/ai', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/dashboard/crowd', icon: Users, label: 'Crowd Intel' },
  { to: '/dashboard/transport', icon: Bus, label: 'Transport' },
  { to: '/dashboard/sustainability', icon: Leaf, label: 'Sustainability' },
  { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
];

const roleSpecificNav: Record<string, { to: string; icon: typeof LayoutDashboard; label: string }[]> = {
  volunteer: [
    { to: '/dashboard/tasks', icon: Activity, label: 'My Tasks' },
  ],
  venue_staff: [
    { to: '/dashboard/facilities', icon: Settings, label: 'Facilities' },
  ],
  organizer: [
    { to: '/dashboard/volunteers', icon: Users, label: 'Volunteers' },
    { to: '/dashboard/incidents', icon: AlertTriangle, label: 'Incidents' },
    { to: '/dashboard/matches', icon: Calendar, label: 'Matches' },
  ],
};

export function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const roleNav = profile?.role ? roleSpecificNav[profile.role] || [] : [];

  return (
    <div className="min-h-screen bg-secondary flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 sidebar transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-default">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-primary">StadiumIQ</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-tertiary"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {roleNav.length > 0 && (
              <div className="mt-6 pt-4 border-t border-default">
                <p className="px-4 text-xs font-medium text-tertiary uppercase tracking-wider mb-2">
                  {profile?.role === 'organizer' ? 'Admin' : 'Quick Access'}
                </p>
                <div className="space-y-1">
                  {roleNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-default">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-tertiary capitalize">
                  {profile?.role?.replace('_', ' ') || 'Guest'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-primary border-b border-default">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-tertiary lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-primary hidden sm:block">
                FIFA World Cup 2026
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-tertiary transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-tertiary transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-primary border border-default shadow-lg py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-default">
                        <p className="text-sm font-medium text-primary truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-tertiary truncate">
                          {profile?.email}
                        </p>
                      </div>
                      <NavLink
                        to="/dashboard/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-tertiary"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </NavLink>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
