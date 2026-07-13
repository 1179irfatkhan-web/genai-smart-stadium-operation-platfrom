import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin, Users, Accessibility, Bus, Leaf, Globe,
  Brain, Activity, ArrowRight, Shield, Clock, Sparkles,
  Menu, X, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';

const features = [
  {
    icon: MapPin,
    title: 'Smart Navigation',
    description: 'AI-powered directions to your seat, facilities, and amenities with real-time updates.',
    challenge: 'Navigation',
  },
  {
    icon: Users,
    title: 'Crowd Intelligence',
    description: 'Live crowd density heatmaps and predictions to avoid congestion.',
    challenge: 'Crowd Management',
  },
  {
    icon: Accessibility,
    title: 'Accessibility First',
    description: 'Wheelchair routes, accessible facilities, voice controls, and WCAG 2.1 AA compliance.',
    challenge: 'Accessibility',
  },
  {
    icon: Bus,
    title: 'Transport Hub',
    description: 'Real-time transit info, parking availability, and AI-optimized exit routes.',
    challenge: 'Transportation',
  },
  {
    icon: Leaf,
    title: 'Sustainability Tracking',
    description: 'Water refill locators, eco-transport options, and carbon footprint dashboard.',
    challenge: 'Sustainability',
  },
  {
    icon: Globe,
    title: 'Multilingual AI',
    description: 'Converse in 20+ languages with context-aware stadium assistance.',
    challenge: 'Multilingual Assistance',
  },
  {
    icon: Brain,
    title: 'Operational Intelligence',
    description: 'AI recommendations for crowd, facilities, and resource allocation.',
    challenge: 'Operational Intelligence',
  },
  {
    icon: Activity,
    title: 'Real-Time Alerts',
    description: 'Instant notifications for emergencies, weather, and important updates.',
    challenge: 'Real-Time Decision Support',
  },
];

const stats = [
  { value: '70,000+', label: 'Stadium Capacity' },
  { value: '48', label: 'Teams' },
  { value: '104', label: 'Matches' },
  { value: '16', label: 'Host Cities' },
];

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">StadiumIQ</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="btn-ghost">Features</a>
              <a href="#challenge" className="btn-ghost">Challenge</a>
              <a href="#about" className="btn-ghost">About</a>
              <Link to="/login" className="btn-ghost">Sign In</Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-tertiary transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-tertiary"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-default"
            >
              <div className="flex flex-col gap-2">
                <a href="#features" className="btn-ghost">Features</a>
                <a href="#challenge" className="btn-ghost">Challenge</a>
                <a href="#about" className="btn-ghost">About</a>
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      <main id="main-content">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/161555/pexels-photo-161555.jpeg?auto=compress&cs=tinysrgb&w=1920)',
              }}
            />
            <div className="absolute inset-0 gradient-hero" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-medium text-white/90">FIFA World Cup 2026</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6"
              >
                Smart Stadium Operations
                <br />
                <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                  Powered by AI
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10"
              >
                Enhance your FIFA World Cup 2026 experience with AI-powered navigation,
                real-time crowd intelligence, accessibility support, and multilingual assistance.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center justify-center gap-2 text-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary inline-flex items-center justify-center text-lg bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Sign In
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-secondary to-transparent" />
        </section>

        <section id="features" className="py-24 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Everything You Need for Smart Stadium Operations
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Built specifically for FIFA World Cup 2026 challenge requirements
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-medium text-primary-600 mb-2">
                    {feature.challenge}
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-secondary">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="challenge" className="py-24 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                  FIFA World Cup 2026
                  <br />
                  <span className="text-primary-600">Challenge 4</span>
                </h2>
                <blockquote className="text-lg text-secondary border-l-4 border-primary-500 pl-6 mb-6 italic">
                  "Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff."
                </blockquote>
                <p className="text-secondary mb-6">
                  Our platform leverages Generative AI to address all eight challenge objectives:
                  Navigation, Crowd Management, Accessibility, Transportation, Sustainability,
                  Multilingual Assistance, Operational Intelligence, and Real-Time Decision Support.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Navigation', 'Crowd Management', 'Accessibility', 'Transportation', 'Sustainability', 'Multilingual', 'Operations', 'Real-Time'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-sm rounded-full bg-tertiary text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary">AI Features</h3>
                </div>
                <ul className="space-y-4 text-secondary">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent-500 mt-0.5" />
                    <span>Grounded responses using real stadium data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-accent-500 mt-0.5" />
                    <span>Real-time crowd and facility updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-accent-500 mt-0.5" />
                    <span>20+ language support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-accent-500 mt-0.5" />
                    <span>AI-powered recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Accessibility className="w-5 h-5 text-accent-500 mt-0.5" />
                    <span>Accessibility-first design</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="about" className="py-24 bg-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                Ready to Experience the Future?
              </h2>
              <p className="text-lg text-secondary mb-8">
                Join us in revolutionizing the stadium experience for FIFA World Cup 2026.
                Get started with our demo or create your account today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary">
                  Try Demo Mode
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-primary border-t border-default py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-primary">StadiumIQ</span>
              </div>
              <p className="text-sm text-secondary">
                AI-powered Smart Stadium platform for FIFA World Cup 2026.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-secondary">
                <li>Smart Navigation</li>
                <li>Crowd Intelligence</li>
                <li>AI Assistant</li>
                <li>Accessibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Users</h4>
              <ul className="space-y-2 text-sm text-secondary">
                <li>Fans</li>
                <li>Volunteers</li>
                <li>Venue Staff</li>
                <li>Organizers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Challenge</h4>
              <ul className="space-y-2 text-sm text-secondary">
                <li>FIFA World Cup 2026</li>
                <li>Challenge 4</li>
                <li>Smart Stadiums</li>
                <li>Tournament Operations</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-default text-center text-sm text-secondary">
            <p>Built for FIFA World Cup 2026 Hackathon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
