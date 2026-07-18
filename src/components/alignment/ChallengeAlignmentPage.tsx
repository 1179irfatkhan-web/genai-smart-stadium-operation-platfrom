import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, CheckCircle, ArrowRight, Users, Sparkles } from 'lucide-react';
import { PROBLEM_STATEMENT_MAPPING, CHALLENGE_4_STATEMENT } from '../../constants';

export function ChallengeAlignmentPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Target className="w-6 h-6" aria-hidden="true" />
          How StadiumIQ Solves Challenge 4
        </h1>
        <p className="text-sm text-secondary mt-1">
          Explicit mapping of every feature to the official FIFA World Cup 2026 smart stadium challenge.
        </p>
      </div>

      <div className="card space-y-3" role="region" aria-labelledby="challenge-statement">
        <h2 id="challenge-statement" className="text-lg font-semibold text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" aria-hidden="true" />
          Official Challenge 4 Statement
        </h2>
        <blockquote className="text-sm text-secondary italic border-l-4 border-primary pl-4">
          {CHALLENGE_4_STATEMENT}
        </blockquote>
      </div>

      <div className="card overflow-x-auto" role="region" aria-labelledby="alignment-table-title">
        <h2 id="alignment-table-title" className="text-lg font-semibold text-primary mb-4">
          Implementation Mapping
        </h2>
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-default">
              <th scope="col" className="text-left p-3 font-semibold text-primary">Challenge Requirement</th>
              <th scope="col" className="text-left p-3 font-semibold text-primary">StadiumIQ Implementation</th>
              <th scope="col" className="text-left p-3 font-semibold text-primary">Primary Users</th>
              <th scope="col" className="text-left p-3 font-semibold text-primary">GenAI Contribution</th>
              <th scope="col" className="text-left p-3 font-semibold text-primary">Explore</th>
            </tr>
          </thead>
          <tbody>
            {PROBLEM_STATEMENT_MAPPING.map((item, i) => (
              <motion.tr
                key={item.challenge}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-default last:border-0"
              >
                <td className="p-3 text-primary font-medium">{item.challenge}</td>
                <td className="p-3 text-secondary">{item.feature}</td>
                <td className="p-3 text-tertiary text-xs">{item.users}</td>
                <td className="p-3 text-secondary text-xs">{item.genai}</td>
                <td className="p-3">
                  <Link
                    to={item.route}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                    aria-label={`Go to ${item.feature}`}
                  >
                    Open <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card space-y-3" role="region" aria-labelledby="genai-central">
        <h2 id="genai-central" className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="w-5 h-5" aria-hidden="true" />
          Why GenAI Is Central, Not Decorative
        </h2>
        <ul className="text-sm text-secondary space-y-2 list-disc list-inside">
          <li>The AI assistant is grounded in structured stadium data — it cannot invent gates, facilities, or transport points.</li>
          <li>Responses are role-aware: fans get navigation help, volunteers get task suggestions, organizers get crowd redirection plans.</li>
          <li>Multilingual support generates genuine responses in 7 languages, not just translations.</li>
          <li>The AI provides confidence scores and reasoning summaries for operational decision support.</li>
          <li>Fallback behavior ensures users always get a safe response when data is unavailable.</li>
        </ul>
      </div>

      <div className="card space-y-3" role="region" aria-labelledby="use-cases">
        <h2 id="use-cases" className="text-lg font-semibold text-primary">Realistic Match-Day Use Cases</h2>
        <ul className="text-sm text-secondary space-y-2 list-disc list-inside">
          <li><strong>Fan:</strong> "Which gate has the shortest queue?" — AI recommends Gate A based on live crowd data.</li>
          <li><strong>Organizer:</strong> "How should I redirect crowds from Concourse B?" — AI suggests alternative routes based on density levels.</li>
          <li><strong>Volunteer:</strong> "What should I do next?" — AI prioritizes tasks based on incident severity and location.</li>
          <li><strong>Venue Staff:</strong> "Which facilities need maintenance?" — AI flags facilities with operational issues.</li>
          <li><strong>Multilingual Fan:</strong> "¿Dónde está el baño más cercano?" — AI responds in Spanish with restroom locations.</li>
        </ul>
      </div>

      <div className="card space-y-3" role="region" aria-labelledby="simulated-data">
        <h2 id="simulated-data" className="text-lg font-semibold text-primary">Simulated Real-Time Data</h2>
        <p className="text-sm text-secondary">
          StadiumIQ uses Supabase database tables to simulate real-time stadium conditions including crowd density,
          gate queues, facility status, transportation availability, and active alerts. In a production deployment,
          these tables would be fed by IoT sensors, ticketing systems, and transport APIs. The AI processes this
          structured data to provide context-aware recommendations.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link to="/dashboard/ai" className="btn-primary">
          <CheckCircle className="w-4 h-4" aria-hidden="true" />
          Try the AI Assistant
        </Link>
        <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
}
