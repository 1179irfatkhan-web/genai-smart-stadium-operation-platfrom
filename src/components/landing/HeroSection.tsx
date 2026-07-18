import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Map, Users, MessageSquare, Bus, Leaf, Globe,
  Accessibility, AlertTriangle, ArrowRight, CheckCircle, Sparkles,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE, PROBLEM_STATEMENT_MAPPING } from '../../constants';

const FEATURES = [
  { icon: Map, title: 'Smart Navigation', desc: 'Interactive stadium maps with accessible routing' },
  { icon: Users, title: 'Crowd Intelligence', desc: 'Real-time crowd density monitoring across zones' },
  { icon: MessageSquare, title: 'AI Assistant', desc: 'Gemini-powered multilingual stadium guide' },
  { icon: Bus, title: 'Transport Planner', desc: 'Live transport options and availability' },
  { icon: Leaf, title: 'Sustainability', desc: 'Environmental impact tracking dashboard' },
  { icon: Accessibility, title: 'Accessibility', desc: 'High contrast, large text, and accessible routes' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <nav className="sticky top-0 z-50 bg-primary border-b border-default" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center" aria-hidden="true">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-primary">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <main id="main-content" tabIndex={-1}>
        <section className="max-w-6xl mx-auto px-4 py-20 text-center" aria-labelledby="hero-title">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <Globe className="w-4 h-4" aria-hidden="true" />
              FIFA World Cup 2026
            </div>
            <h1 id="hero-title" className="text-4xl md:text-6xl font-bold text-primary">
              {APP_NAME}
            </h1>
            <p className="text-lg text-secondary max-w-2xl mx-auto">{APP_TAGLINE}</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register" className="btn-primary text-base">
                Get Started <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/login" className="btn-secondary text-base">Sign In</Link>
            </div>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="features-title">
          <h2 id="features-title" className="text-2xl font-bold text-primary text-center mb-8">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card space-y-3"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center" aria-hidden="true">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
                <p className="text-sm text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="genai-title">
          <div className="card text-center space-y-4">
            <Sparkles className="w-10 h-10 text-blue-500 mx-auto" aria-hidden="true" />
            <h2 id="genai-title" className="text-2xl font-bold text-primary">Powered by Google Gemini</h2>
            <p className="text-sm text-secondary max-w-2xl mx-auto">
              StadiumIQ uses Google Gemini 1.5 Flash via a secure Supabase Edge Function.
              The AI is grounded in structured stadium data and provides role-aware, multilingual recommendations.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="alignment-title">
          <h2 id="alignment-title" className="text-2xl font-bold text-primary text-center mb-8">
            Problem Statement Alignment
          </h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-default">
                  <th scope="col" className="text-left p-3 font-semibold text-primary">Challenge</th>
                  <th scope="col" className="text-left p-3 font-semibold text-primary">StadiumIQ Feature</th>
                  <th scope="col" className="text-left p-3 font-semibold text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {PROBLEM_STATEMENT_MAPPING.map((item) => (
                  <tr key={item.challenge} className="border-b border-default last:border-0">
                    <td className="p-3 text-primary font-medium">{item.challenge}</td>
                    <td className="p-3 text-secondary">{item.feature}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        Implemented
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="cta-title">
          <div className="card text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" aria-hidden="true" />
            <h2 id="cta-title" className="text-2xl font-bold text-primary">Ready to Experience the Future of Stadiums?</h2>
            <p className="text-sm text-secondary">Create a free account or try a demo to explore all features.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register" className="btn-primary">Create Account</Link>
              <Link to="/login" className="btn-secondary">Try Demo</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-default bg-primary" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-tertiary">
            {APP_NAME} — GenAI Smart Stadium Platform for FIFA World Cup 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
