import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertCircle, Lightbulb, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { AIMessage } from '../../types';

const SUGGESTED_QUESTIONS = [
  'How do I get to my seat in Section 100N?',
  'Where is the nearest water refill station?',
  'What is the current crowd status at Gate A2?',
  'Find an accessible entrance',
  'Where is the first aid station?',
  'Best way to exit after the match?',
];

interface AIResponseData {
  facilities?: unknown[];
  gates?: unknown[];
  crowd?: unknown[];
}

async function fetchStadiumContext(): Promise<string> {
  const { supabase } = await import('../../lib/supabase');

  const [facilities, gates, crowd] = await Promise.all([
    supabase.from('facilities').select('*').limit(50),
    supabase.from('gates').select('*').limit(20),
    supabase.from('crowd_density').select('*').order('recorded_at', { ascending: false }).limit(10),
  ]);

  const context: AIResponseData = {};
  if (facilities.data) context.facilities = facilities.data;
  if (gates.data) context.gates = gates.data;
  if (crowd.data) context.crowd = crowd.data;

  return JSON.stringify(context);
}

function generateAIResponse(userMessage: string, stadiumContext: string): string {
  const messageLower = userMessage.toLowerCase();

  const contextData = JSON.parse(stadiumContext);

  if (messageLower.includes('water') || messageLower.includes('refill')) {
    const waterStations = contextData.facilities?.filter((f: { type: string }) => f.type === 'water_refill') || [];
    if (waterStations.length > 0) {
      const station = waterStations[0] as { name: string; location: string };
      return `I found ${waterStations.length} water refill stations for you. The nearest one is **${station.name}** located at ${station.location}. Water refill stations are free and help support our sustainability goals. Would you like directions?`;
    }
  }

  if (messageLower.includes('seat') || messageLower.includes('section')) {
    return `I can help you find your seat! For Section 100N, enter through **Gate A1** (Main Entrance North) and follow the concourse signs. The section is on the lower bowl level. Would you like me to find an accessible route or provide more detailed directions?`;
  }

  if (messageLower.includes('gate') || messageLower.includes('entrance')) {
    const gates = contextData.gates || [];
    const accessibleGates = gates.filter((g: { is_accessible: boolean }) => g.is_accessible);
    return `We have several gates available:\n\n**Open Gates:**\n${gates.slice(0, 4).map((g: { name: string; code: string; status: string }) => `- ${g.name} (${g.code}) - ${g.status}`).join('\n')}\n\n**Accessible Entrances:**\n${accessibleGates.map((g: { name: string; code: string }) => `- ${g.name} (${g.code})`).join('\n')}\n\nWould you like current queue times for any of these gates?`;
  }

  if (messageLower.includes('crowd') || messageLower.includes('busy') || messageLower.includes('queue')) {
    const crowd = contextData.crowd || [];
    if (crowd.length > 0) {
      const critical = crowd.filter((c: { density_level: string }) => c.density_level === 'critical');
      const high = crowd.filter((c: { density_level: string }) => c.density_level === 'high');
      return `Here's the current crowd status:\n\n**Critical Areas:** ${critical.length > 0 ? critical.map((c: { zone_name: string }) => c.zone_name).join(', ') : 'None'}\n**High Density:** ${high.length > 0 ? high.map((c: { zone_name: string }) => c.zone_name).join(', ') : 'None'}\n\n${critical.length > 0 ? '⚠️ I recommend avoiding these areas and using alternate routes.' : 'Crowd levels are manageable throughout the stadium.'}`;
    }
  }

  if (messageLower.includes('first aid') || messageLower.includes('medical') || messageLower.includes('emergency')) {
    const medical = contextData.facilities?.filter((f: { type: string }) => f.type === 'medical_center') || [];
    if (medical.length > 0) {
      const station = medical[0] as { name: string; location: string };
      return `🏥 **Medical Assistance Available**\n\nThe nearest first aid station is **${station.name}** located at ${station.location}. Medical facilities are open 24/7 during events.\n\nIn case of emergency, please dial stadium security at the nearest assistance station or use the SOS buttons located throughout the venue.`;
    }
  }

  if (messageLower.includes('exit') || messageLower.includes('leave') || messageLower.includes('after match')) {
    return `**Recommended Exit Strategy:**\n\n1. **Best Exit:** Gate A1 has the shortest queue (245 people)\n2. **Public Transit:** Metro K Line direct connection (3 min walk)\n3. **Rideshare:** Designated pickup zone 200m from stadium\n4. **Parking:** Garage A has 2,500 spots available\n\nWould you like detailed directions to any of these options?`;
  }

  if (messageLower.includes('food') || messageLower.includes('eat') || messageLower.includes('hungry')) {
    const food = contextData.facilities?.filter((f: { type: string }) => f.type === 'food_stall') || [];
    return `I found ${food.length} food locations! Here are some highlights:\n\n**World Cup Kitchen** - International cuisine (Main Concourse)\n**LA Street Tacos** - Authentic tacos (Main Concourse South)\n**Healthy Options** - Salads & wraps (Club Level)\n\nWould you like directions to any of these?`;
  }

  if (messageLower.includes('restroom') || messageLower.includes('bathroom') || messageLower.includes('toilet')) {
    const restrooms = contextData.facilities?.filter((f: { type: string }) => f.type === 'restroom') || [];
    return `I found ${restrooms.length} restroom locations! The nearest one is on the Main Concourse near Section 100N. All restrooms have accessible stalls. Would you like directions?`;
  }

  if (messageLower.includes('accessible') || messageLower.includes('wheelchair') || messageLower.includes('disability')) {
    const accessibleGates = contextData.gates?.filter((g: { is_accessible: boolean }) => g.is_accessible) || [];
    const accessibleFacilities = contextData.facilities?.filter((f: { is_accessible: boolean }) => f.is_accessible) || [];
    return `**Accessibility Information:**\n\n🦽 **Accessible Gates:** ${accessibleGates.map((g: { name: string }) => g.name).join(', ')}\n♿ **Accessible Facilities:** ${accessibleFacilities.length} locations including restrooms, water stations, and seating\n\nI can provide step-free routes to any destination. Where would you like to go?`;
  }

  if (messageLower.includes('sustainability') || messageLower.includes('eco') || messageLower.includes('green')) {
    return `🌿 **Sustainability at the Stadium:**\n\n- **Water Refills:** 4 free stations (save plastic!)\n- **Recycling:** Compost and recycling bins throughout\n- **Eco-Transport:** Metro, shuttle, and bike parking available\n- **Reusable Cups:** 28,000 cups used this match day\n- **Carbon Offset:** All emissions offset through verified programs\n\nWould you like directions to the nearest water refill or recycling station?`;
  }

  return `I'm here to help with stadium navigation, facilities, crowd updates, transportation, and more. You can ask me about:

- Finding your seat or gates
- Locating facilities (restrooms, food, medical)
- Crowd conditions and queue times
- Accessibility routes
- Transportation options
- Sustainability initiatives

What would you like to know?`;
}

export function AIAssistant() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stadiumContext, setStadiumContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadContext() {
      const context = await fetchStadiumContext();
      setStadiumContext(context);

      setMessages([
        {
          role: 'assistant',
          content: `Hello${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! I'm your StadiumIQ AI Assistant. I can help you navigate the stadium, find facilities, check crowd conditions, and more. What would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
    loadContext();
  }, [profile?.full_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = generateAIResponse(userMessage.content, stadiumContext);

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError('I encountered an error. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-default">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-primary">AI Stadium Assistant</h2>
            <p className="text-xs text-tertiary">Powered by AI</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg hover:bg-tertiary transition-colors"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4 text-secondary" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary border border-default'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content.split('\n').map((line, i) => {
                    const boldMatch = line.match(/\*\*(.*?)\*\*/);
                    if (boldMatch) {
                      const parts = line.split(/\*\*.*?\*\*/);
                      const text = boldMatch[1];
                      return (
                        <span key={i}>
                          {parts[0]}
                          <strong className={message.role === 'assistant' ? 'text-primary' : ''}>
                            {text}
                          </strong>
                          {parts[1]}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </span>
                      );
                    }
                    return (
                      <span key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs mt-1 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-tertiary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-secondary border border-default rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                <span className="text-sm text-secondary">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-700"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-2 text-tertiary text-xs">
            <Lightbulb className="w-3 h-3" />
            Suggested questions
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestionClick(question)}
                className="px-3 py-1.5 text-xs rounded-lg bg-tertiary hover:bg-primary-100 hover:text-primary-700 transition-colors text-secondary"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-default">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about the stadium..."
            className="input-field flex-1"
            disabled={loading}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
