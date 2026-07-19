import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, Sparkles, MapPin, AlertTriangle, ShieldCheck, Accessibility, Activity } from 'lucide-react';
import { CHALLENGE_4_STATEMENT } from '../../constants';

interface AlignmentItem {
  id: string;
  challenge: string;
  requirement: string;
  feature: string;
  user: string;
  genai: string;
  value: string;
  route: string;
  moduleName: string;
}

const ALIGNMENT_DATA: AlignmentItem[] = [
  {
    id: "nav",
    challenge: "Navigation",
    requirement: "Improve indoor/outdoor navigation and route optimization during dynamic stadium events.",
    feature: "Interactive Stadium Map",
    user: "Fans, Volunteers",
    genai: "Grounded navigation instructions that suggest gates based on simulated queue times and user profile constraints.",
    value: "Guides lost fans to the nearest accessible entry, cutting transit times by up to 15 minutes.",
    route: "/dashboard/map",
    moduleName: "Stadium Map"
  },
  {
    id: "crowd",
    challenge: "Crowd Management",
    requirement: "Dynamic crowd redirection and congestion response to prevent bottlenecks.",
    feature: "Crowd Density Heatmap & Telemetry",
    user: "Organizers, Venue Staff",
    genai: "Analyzes critical crowd density levels (e.g., Concourse B) to formulate volunteer dispatch suggestions.",
    value: "Prevent crowd crush by redirecting organizer resources to blockages in under 2 minutes.",
    route: "/dashboard/crowd",
    moduleName: "Crowd Intelligence"
  },
  {
    id: "access",
    challenge: "Accessibility",
    requirement: "Support visitors with physical, visual, auditory, or cognitive requirements.",
    feature: "Accessibility AI Assistant",
    user: "Fans with accessibility needs",
    genai: "Adapts guidance based on mobility requirements, highlighting step-free paths and elevators.",
    value: "Provides step-free routing for wheelchair users without requiring auxiliary staff lookup.",
    route: "/dashboard/ai",
    moduleName: "AI Assistant"
  },
  {
    id: "transport",
    challenge: "Transportation",
    requirement: "Post-match transport optimization, queue monitoring, and egress planning.",
    feature: "Transit Hub Dashboard",
    user: "Fans, Organizers",
    genai: "Suggests departure times and modes of transit to avoid peak crowd surges at main exits.",
    value: "Fans receive realistic egress advice, reducing transit station queue times by 20%.",
    route: "/dashboard/transport",
    moduleName: "Transport Hub"
  },
  {
    id: "sustainability",
    challenge: "Sustainability",
    requirement: "Minimize waste, reduce carbon footprints, and monitor resource consumption.",
    feature: "Sustainability Metrics Tracking",
    user: "Fans, Organizers",
    genai: "Formulates operational directives to optimize HVAC loads or waste diversion rates based on simulated match-day attendance.",
    value: "Recommends waste sorting instructions dynamically, boosting diversion rates by 12%.",
    route: "/dashboard/sustainability",
    moduleName: "Sustainability Dashboard"
  },
  {
    id: "multilingual",
    challenge: "Multilingual Assistance",
    requirement: "Break language barriers for international fans, volunteers, and staff.",
    feature: "Multilingual Gemini AI Assistant",
    user: "International Fans, Volunteers, Staff",
    genai: "Generates genuine multilingual responses in 7 languages (EN, ES, FR, DE, PT, AR, ZH).",
    value: "Resolves security or logistics questions for foreign visitors without human interpreters.",
    route: "/dashboard/ai",
    moduleName: "AI Assistant"
  },
  {
    id: "ops_intel",
    challenge: "Operational Intelligence",
    requirement: "Centralize multiple operational feeds into a unified dashboard for high-level coordinators.",
    feature: "Unified Organizer Admin Dashboard",
    user: "Tournament Organizers",
    genai: "Synthesizes multi-source telemetry to recommend cross-functional mitigations.",
    value: "Organizers monitor stadium-wide health at a glance instead of checking separate legacy apps.",
    route: "/dashboard",
    moduleName: "Dashboard Overview"
  },
  {
    id: "decision",
    challenge: "Real-Time Decision Support",
    requirement: "Actionable decision formulation from changing telemetry feeds.",
    feature: "AI Recommendations Feed",
    user: "Organizers, Venue Staff",
    genai: "Combines active matches, unresolved alerts, and density levels into prioritized actions.",
    value: "Recommends gates to restrict or routes to clear during severe alerts automatically.",
    route: "/dashboard/ai",
    moduleName: "AI Assistant"
  },
  {
    id: "volunteer",
    challenge: "Volunteer Assistance",
    requirement: "Clear shifts, zone assignments, and immediate action tasks for volunteers.",
    feature: "Volunteer Task List & Shifts",
    user: "Event Volunteers",
    genai: "Adapts instructions to the volunteer's assigned zone, detailing priority actions (e.g., medical support).",
    value: "Volunteers receive real-time duties, improving support response times on the concourse.",
    route: "/dashboard/tasks",
    moduleName: "Volunteer Tasks"
  },
  {
    id: "staff",
    challenge: "Venue Staff Operations",
    requirement: "Rapid facility maintenance dispatch and active alert response.",
    feature: "Facilities Status & Alert Panels",
    user: "Venue Maintenance & Security Staff",
    genai: "Checks status updates and prioritizes work orders for operational infrastructure.",
    value: "Speeds up restroom/safety repairs by alerting staff of service drops instantly.",
    route: "/dashboard",
    moduleName: "Dashboard Overview"
  }
];

export function ChallengeAlignmentPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<'fan' | 'organizer'>('fan');

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6" role="main" aria-label="Problem Statement Alignment">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" aria-hidden="true" />
          How StadiumIQ Solves Challenge 4
        </h1>
        <p className="text-sm text-secondary mt-1">
          Explicit mapping of every feature to the official FIFA World Cup 2026 smart stadium challenge requirements.
        </p>
      </div>

      {/* Official Challenge Statement */}
      <section className="card space-y-3" aria-labelledby="challenge-statement-title">
        <h2 id="challenge-statement-title" className="text-lg font-semibold text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" aria-hidden="true" />
          Official Challenge 4 Statement
        </h2>
        <blockquote className="text-sm text-secondary italic border-l-4 border-primary pl-4 py-1">
          {CHALLENGE_4_STATEMENT}
        </blockquote>
      </section>

      {/* 10 Areas Table/Grid */}
      <section className="card space-y-4" aria-labelledby="alignment-table-title">
        <h2 id="alignment-table-title" className="text-lg font-semibold text-primary">
          Core Challenge Alignment Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" role="table">
            <thead>
              <tr className="border-b border-default text-left bg-secondary">
                <th scope="col" className="p-3 font-semibold text-primary min-w-[120px]">Challenge Area</th>
                <th scope="col" className="p-3 font-semibold text-primary min-w-[180px]">Existing Feature</th>
                <th scope="col" className="p-3 font-semibold text-primary min-w-[120px]">Target User</th>
                <th scope="col" className="p-3 font-semibold text-primary min-w-[200px]">GenAI Contribution</th>
                <th scope="col" className="p-3 font-semibold text-primary min-w-[180px]">Match-Day Value</th>
                <th scope="col" className="p-3 font-semibold text-primary">Explore</th>
              </tr>
            </thead>
            <tbody>
              {ALIGNMENT_DATA.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-default last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  <td className="p-3 text-primary font-medium">{item.challenge}</td>
                  <td className="p-3 text-secondary">
                    <span className="font-semibold block text-xs text-primary">{item.feature}</span>
                    <span className="text-xs">{item.requirement}</span>
                  </td>
                  <td className="p-3 text-tertiary text-xs">{item.user}</td>
                  <td className="p-3 text-secondary text-xs">{item.genai}</td>
                  <td className="p-3 text-secondary text-xs">{item.value}</td>
                  <td className="p-3">
                    <Link
                      to={item.route}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded text-xs font-semibold"
                      aria-label={`Go to ${item.moduleName} to see how we solve ${item.challenge}`}
                    >
                      {item.moduleName} <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Workflows */}
      <section className="card space-y-4" aria-labelledby="workflows-title">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 id="workflows-title" className="text-lg font-semibold text-primary">
            Interactive Match-Day Workflows
          </h2>
          <div className="flex gap-2 p-1 bg-secondary rounded-lg" role="tablist" aria-label="Workflow Demos">
            <button
              onClick={() => setActiveWorkflow('fan')}
              role="tab"
              aria-selected={activeWorkflow === 'fan'}
              aria-controls="fan-workflow-panel"
              id="fan-workflow-tab"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeWorkflow === 'fan' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
              }`}
            >
              Fan Egress Flow
            </button>
            <button
              onClick={() => setActiveWorkflow('organizer')}
              role="tab"
              aria-selected={activeWorkflow === 'organizer'}
              aria-controls="organizer-workflow-panel"
              id="organizer-workflow-tab"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeWorkflow === 'organizer' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
              }`}
            >
              Organizer Command Flow
            </button>
          </div>
        </div>

        <div className="p-4 bg-secondary/30 rounded-lg min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeWorkflow === 'fan' ? (
              <motion.div
                key="fan"
                id="fan-workflow-panel"
                role="tabpanel"
                aria-labelledby="fan-workflow-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Accessibility className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <h3>Accessible Egress: Seating Area to Less-Crowded Exit</h3>
                </div>
                <p className="text-xs text-secondary">
                  Demonstrating how a Fan with accessibility needs is guided from their seat to a suitable public transport entrance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
                  {[
                    { step: 1, title: "Query Assist", desc: "Fan queries AI: 'Best accessible exit route from Section 102 to transit.'" },
                    { step: 2, title: "Check Telemetry", desc: "AI checks simulated gate queues and discovers Gate B is heavily congested." },
                    { step: 3, title: "Step-free Egress", desc: "AI suggests step-free path to elevator A, exiting via low-density Gate C." },
                    { step: 4, title: "Transit Egress", desc: "AI checks rideshare/metro queue rates, routing fan to elevator B at North metro." },
                    { step: 5, title: "Safe Egress", desc: "Fan boards accessible train without getting stuck in crowd bottlenecks." }
                  ].map((s) => (
                    <div key={s.step} className="p-3 bg-card rounded border border-default flex flex-col justify-between">
                      <div>
                        <span className="text-xxs font-bold text-blue-600 uppercase block mb-1">Step {s.step}</span>
                        <h4 className="text-xs font-semibold text-primary mb-1">{s.title}</h4>
                        <p className="text-xxs text-secondary leading-normal">{s.desc}</p>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-tertiary">Telemetry context utilized: Gates, Crowd Density, Facilities, Transport.</span>
                  <Link to="/dashboard/ai" className="text-blue-600 font-semibold hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                    Try in AI Assistant <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="organizer"
                id="organizer-workflow-panel"
                role="tabpanel"
                aria-labelledby="organizer-workflow-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Activity className="w-5 h-5 text-orange-600" aria-hidden="true" />
                  <h3>Congestion Mitigation: Crowd Bottleneck Response</h3>
                </div>
                <p className="text-xs text-secondary">
                  Demonstrating how a Tournament Organizer manages crowd flow redirection and dispatches volunteer support.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
                  {[
                    { step: 1, title: "Telemetry Trigger", desc: "Crowd density monitors record 'Critical' status (95% cap) at Concourse B." },
                    { step: 2, title: "Alert Raised", desc: "A high-severity alert is dispatched automatically to the admin feed." },
                    { step: 3, title: "AI Redirection", desc: "AI formulates redirection plan: Restrict Gate B, funnel arrivals to Gate A." },
                    { step: 4, title: "Dispatch Staff", desc: "Organizer sends alert details and dispatches Volunteer 1 to Concourse B zone." },
                    { step: 5, title: "Resolution", desc: "Volunteer successfully guides flow. Crowd density falls to 'Moderate'." }
                  ].map((s) => (
                    <div key={s.step} className="p-3 bg-card rounded border border-default flex flex-col justify-between">
                      <div>
                        <span className="text-xxs font-bold text-orange-600 uppercase block mb-1">Step {s.step}</span>
                        <h4 className="text-xs font-semibold text-primary mb-1">{s.title}</h4>
                        <p className="text-xxs text-secondary leading-normal">{s.desc}</p>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-tertiary">Telemetry context utilized: Crowd Density, Volunteers, Alerts, Gates.</span>
                  <Link to="/dashboard/crowd" className="text-blue-600 font-semibold hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                    Open Crowd Dashboard <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Simulated Data Disclosure */}
      <section className="card grid grid-cols-1 md:grid-cols-3 gap-6" aria-labelledby="simulated-data-title">
        <div className="md:col-span-2 space-y-3">
          <h2 id="simulated-data-title" className="text-lg font-semibold text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
            Simulated Real-Time Data Disclosure
          </h2>
          <p className="text-xs text-secondary leading-relaxed">
            StadiumIQ currently demonstrates real-time decision-support workflows using simulated match-day stadium data. Production deployment can integrate authorized live venue, transport, incident, and crowd-monitoring feeds.
            These mock tables mimic dynamic IoT telemetry and ticketing system logs to ground the GenAI model.
          </p>
          <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20 text-xxs text-secondary flex items-start gap-2">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Production integrations with official FIFA ticketing systems, municipal transit telemetry APIs,
              and hardware-based stadium cameras are simulated inside database tables to support complete demo readiness without physical IoT deployments.
            </span>
          </div>
        </div>
        <div className="space-y-3 bg-secondary/30 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-primary flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              GenAI Security Design
            </h3>
            <p className="text-xxs text-secondary mt-1 leading-normal">
              - Grounded context from database ensures AI cannot hallucinate non-existent gates.
              - Role-specific contexts align response style to Fans vs Organizers.
              - Server-side rate limits and SQL sanitization protect against prompt injection and API abuse.
            </p>
          </div>
          <Link to="/dashboard/ai" className="btn-primary text-xs w-full text-center flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Open AI Assistant
          </Link>
        </div>
      </section>

      {/* Back navigation */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link to="/dashboard" className="btn-secondary text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
