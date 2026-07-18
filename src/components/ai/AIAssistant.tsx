import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Globe, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { processAIRequest } from '../../utils/aiLogic';
import { getRemainingCooldown } from '../../utils/rateLimiter';
import { SUPPORTED_LANGUAGES, AI_RATE_LIMIT_MS } from '../../constants';
import type { AIMessage, Gate, Facility, CrowdDensity, Transportation, Match, Alert, SeatingSection, Volunteer, SustainabilityMetric, LanguageCode } from '../../types';

const SAMPLE_QUESTIONS = [
  'Which gate has the shortest queue?',
  'Where is the nearest accessible restroom?',
  'How is the crowd at Concourse B?',
  'What transport options are available?',
  'Are there any active alerts?',
];

export function AIAssistant() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [cooldown, setCooldown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stadiumData = useMemo(() => ({
    stadiumName: 'MetLife Stadium',
    gates: [] as Gate[],
    seatingSections: [] as SeatingSection[],
    facilities: [] as Facility[],
    crowdDensity: [] as CrowdDensity[],
    transportation: [] as Transportation[],
    matches: [] as Match[],
    alerts: [] as Alert[],
    volunteers: [] as Volunteer[],
    sustainabilityMetrics: [] as SustainabilityMetric[],
  }), []);

  useEffect(() => {
    async function fetchData() {
      const [gates, seats, facilities, crowd, transport, matches, alerts, volunteers, sustainability] = await Promise.all([
        supabase.from('gates').select('*'),
        supabase.from('seating_sections').select('*'),
        supabase.from('facilities').select('*'),
        supabase.from('crowd_density').select('*').order('recorded_at', { ascending: false }).limit(20),
        supabase.from('transportation').select('*'),
        supabase.from('matches').select('*').order('match_date').limit(5),
        supabase.from('alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('volunteers').select('*'),
        supabase.from('sustainability_metrics').select('*').order('recorded_at', { ascending: false }).limit(10),
      ]);

      stadiumData.gates = (gates.data as Gate[]) || [];
      stadiumData.seatingSections = (seats.data as SeatingSection[]) || [];
      stadiumData.facilities = (facilities.data as Facility[]) || [];
      stadiumData.crowdDensity = (crowd.data as CrowdDensity[]) || [];
      stadiumData.transportation = (transport.data as Transportation[]) || [];
      stadiumData.matches = (matches.data as Match[]) || [];
      stadiumData.alerts = (alerts.data as Alert[]) || [];
      stadiumData.volunteers = (volunteers.data as Volunteer[]) || [];
      stadiumData.sustainabilityMetrics = (sustainability.data as SustainabilityMetric[]) || [];
    }
    fetchData();
  }, [stadiumData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(0), cooldown);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSend = useCallback(async (queryText?: string) => {
    const text = queryText ?? input;
    if (!text.trim() || loading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await processAIRequest({
      query: text,
      language,
      stadiumData,
      userId: user?.id ?? 'anonymous',
      userRole: profile?.role ?? 'fan',
    });

    const assistantMessage: AIMessage = {
      role: 'assistant',
      content: response.answer,
      timestamp: new Date(),
      language: response.language,
      confidence: response.confidence,
      sources: response.sources,
      reasoningSummary: response.reasoningSummary,
      recommendedActions: response.recommendedActions,
      isFallback: response.isFallback,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);

    const remaining = getRemainingCooldown(`ai:${user?.id ?? 'anonymous'}`);
    if (remaining > 0) setCooldown(remaining);
  }, [input, loading, language, stadiumData, user, profile]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MessageSquare className="w-6 h-6" aria-hidden="true" />
            AI Assistant
          </h1>
          <p className="text-sm text-secondary mt-1">
            Powered by Google Gemini. Grounded in real-time stadium data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-secondary" aria-hidden="true" />
          <label htmlFor="language-select" className="sr-only">Select language</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="input-field w-40"
            aria-label="Select response language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-tertiary flex-wrap">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Google Gemini 1.5 Flash
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Injection-protected
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          Rate-limited ({AI_RATE_LIMIT_MS / 1000}s cooldown)
        </span>
        <span className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label}
        </span>
      </div>

      <div
        className="card min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-thin space-y-4"
        role="log"
        aria-label="AI chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-secondary">Try asking me:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="btn-secondary text-xs px-3 py-1.5"
                  aria-label={`Ask: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'gradient-primary text-white'
                  : 'bg-tertiary text-primary'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && msg.confidence !== undefined && msg.confidence > 0 && (
                <div className="flex items-center gap-2 mt-2 text-xs opacity-70 flex-wrap">
                  <span>Confidence: {Math.round(msg.confidence * 100)}%</span>
                  {msg.sources && msg.sources.length > 0 && (
                    <span>Sources: {msg.sources.join(', ')}</span>
                  )}
                  {msg.reasoningSummary && (
                    <span className="italic">{msg.reasoningSummary}</span>
                  )}
                </div>
              )}
              {msg.role === 'assistant' && msg.recommendedActions && msg.recommendedActions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium opacity-70">Recommended actions:</p>
                  <ul className="text-xs list-disc list-inside opacity-70">
                    {msg.recommendedActions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              {msg.role === 'assistant' && msg.isFallback && (
                <p className="text-xs mt-1 opacity-60 italic">Fallback response — data may be limited.</p>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-tertiary rounded-xl px-4 py-3">
              <LoadingSpinner size="sm" text="Gemini is thinking..." />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2"
      >
        <label htmlFor="ai-input" className="sr-only">Ask the AI assistant</label>
        <input
          id="ai-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field flex-1"
          placeholder="Ask about gates, facilities, crowd, transport..."
          maxLength={1000}
          aria-label="Ask the AI assistant"
          disabled={cooldown > 0}
        />
        <button
          type="submit"
          disabled={loading || cooldown > 0 || !input.trim()}
          className="btn-primary"
          aria-label="Send message"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" aria-hidden="true" />}
        </button>
      </form>

      {cooldown > 0 && (
        <p className="text-xs text-tertiary text-center" role="status">
          Please wait {Math.ceil(cooldown / 1000)} seconds before sending another message.
        </p>
      )}
    </div>
  );
}
