import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { UserRole } from '../../types';

const DEMO_ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: 'fan', label: 'Fan', description: 'Explore the stadium experience' },
  { role: 'volunteer', label: 'Volunteer', description: 'View tasks and assist attendees' },
  { role: 'venue_staff', label: 'Venue Staff', description: 'Monitor facilities and alerts' },
  { role: 'organizer', label: 'Organizer', description: 'Full operational access' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInAsDemo, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    const { error: demoError } = await signInAsDemo(role);
    if (demoError) {
      setError(demoError);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-secondary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                StadiumIQ
              </h1>
            </Link>
            <p className="mt-2 text-secondary">Sign in to your account</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-primary text-tertiary">or continue with demo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DEMO_ROLES.map(({ role, label, description }) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  disabled={loading}
                  className="p-4 rounded-xl border border-default hover:border-primary-400 hover:bg-tertiary transition-all text-left group"
                >
                  <div className="font-medium text-primary group-hover:text-primary-600">
                    {label}
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-800 via-primary-900 to-accent-900 items-center justify-center p-12">
        <div className="max-w-lg text-white text-center">
          <h2 className="text-4xl font-bold mb-4">FIFA World Cup 2026</h2>
          <p className="text-lg opacity-90 mb-8">
            Experience the beautiful game with AI-powered stadium navigation, real-time crowd insights, and personalized assistance.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold">16</div>
              <div className="text-sm opacity-75">Host Cities</div>
            </div>
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold">48</div>
              <div className="text-sm opacity-75">Teams</div>
            </div>
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold">104</div>
              <div className="text-sm opacity-75">Matches</div>
            </div>
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold">5B+</div>
              <div className="text-sm opacity-75">Expected Viewers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, signInAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('fan');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters and not a commonly used password.');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const handleDemoLogin = async (selectedRole: UserRole) => {
    setError(null);
    setLoading(true);
    const { error: demoError } = await signInAsDemo(selectedRole);
    if (demoError) {
      setError(demoError);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Account Created!</h2>
          <p className="text-secondary">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              StadiumIQ
            </h1>
          </Link>
          <p className="mt-2 text-secondary">Create your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_ROLES.map(({ role: r, label }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      role === r
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-default hover:border-primary-300'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-primary text-tertiary">or try demo</span>
            </div>
          </div>

          <button
            onClick={() => handleDemoLogin('fan')}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Try Fan Demo'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
