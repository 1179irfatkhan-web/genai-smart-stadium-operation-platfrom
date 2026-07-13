import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { validateEmail, validatePassword, validateFullName } from '../../utils/validation';
import type { UserRole } from '../../types';

const DEMO_ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: 'fan', label: 'Fan', description: 'Explore the stadium experience' },
  { role: 'volunteer', label: 'Volunteer', description: 'View tasks and assist attendees' },
  { role: 'venue_staff', label: 'Venue Staff', description: 'Monitor facilities and alerts' },
  { role: 'organizer', label: 'Organizer', description: 'Full operational access' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.error!); return; }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.error!); return; }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
          <p className="text-sm text-secondary">Sign in to StadiumIQ</p>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-error-50 border border-error-500 text-error-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              aria-required="true"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="space-y-3">
          <p className="text-center text-sm text-secondary">Or try a demo account:</p>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_ROLES.map(({ role, label, description }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                disabled={loading}
                className="btn-secondary flex-col items-start text-left p-3"
                aria-label={`Try ${label} demo account`}
              >
                <span className="font-medium">{label}</span>
                <span className="text-xs text-tertiary">{description}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
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

    const nameCheck = validateFullName(fullName);
    if (!nameCheck.valid) { setError(nameCheck.error!); return; }
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.error!); return; }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.error!); return; }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card w-full max-w-md text-center space-y-4"
        >
          <h1 className="text-2xl font-bold text-primary">Account Created!</h1>
          <p className="text-sm text-secondary">
            Check your email to confirm your account, then sign in.
          </p>
          <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Create Account</h1>
          <p className="text-sm text-secondary">Join StadiumIQ for FIFA World Cup 2026</p>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-error-50 border border-error-500 text-error-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-2">Full Name</label>
            <input id="fullName" type="text" value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field" placeholder="John Doe"
              required aria-required="true" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-primary mb-2">Email</label>
            <input id="reg-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" placeholder="you@example.com"
              required aria-required="true" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-primary mb-2">Password</label>
            <input id="reg-password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" placeholder="At least 8 characters"
              required aria-required="true" autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-primary mb-2">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input-field">
              <option value="fan">Fan</option>
              <option value="volunteer">Volunteer</option>
              <option value="venue_staff">Venue Staff</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoadingSpinner size="sm" /> : 'Sign Up'}
          </button>
        </form>

        <div className="space-y-3">
          <p className="text-center text-sm text-secondary">Or try a demo account:</p>
          <button
            onClick={() => handleDemoLogin('fan')}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Try Fan Demo'}
          </button>
        </div>

        <p className="text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
