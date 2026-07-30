import { Link } from 'react-router-dom';

/**
 * Public Features Page — comprehensive feature breakdown across platform actors.
 */
export default function Features() {
  const featureList = [
    {
      actor: 'Renewable Generators',
      icon: '☀️',
      color: 'border-amber-500/30 bg-amber-500/5',
      items: [
        'Real-time energy generation telemetry integration (kW/kWh output)',
        'Solar, wind, hydro, and biomass source classification',
        'Grid and microgrid connectivity configuration',
        'AI-driven generation output curve predictions',
      ],
    },
    {
      actor: 'EV Charging Ports',
      icon: '🔌',
      color: 'border-primary-500/30 bg-primary-500/5',
      items: [
        'Multi-connector port status monitoring (CCS, Type 2, CHAdeMO, Tesla)',
        'Dynamic rate per kWh configuration and currency options',
        'Smart session management (Start / Stop / Active status tracking)',
        'AI demand forecast integration for peak load mitigation',
      ],
    },
    {
      actor: 'EV Users',
      icon: '⚡',
      color: 'border-secondary-500/30 bg-secondary-500/5',
      items: [
        'Personal charging history and clean energy percentage tracking',
        'Nearby renewable charging port discovery',
        'Real-time charging session controls and cost estimates',
        'Notification alerts for clean energy availability windows',
      ],
    },
    {
      actor: 'Fleet Managers',
      icon: '🚛',
      color: 'border-purple-500/30 bg-purple-500/5',
      items: [
        'Commercial vehicle fleet registration and battery capacity tracking',
        'AI-optimized charging schedule recommendations',
        'Fleet-wide carbon reduction and efficiency analytics',
        'Grouped vehicle charging allocation controls',
      ],
    },
  ];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Platform <span className="gradient-text">Capabilities</span>
        </h1>
        <p className="text-surface-300 text-lg max-w-2xl mx-auto">
          Tailored tools built specifically for every participant in the clean energy mobility ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featureList.map((f, i) => (
          <div key={i} className={`p-8 rounded-2xl glass-card border ${f.color} space-y-4`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{f.icon}</span>
              <h2 className="text-xl font-bold text-white">{f.actor}</h2>
            </div>
            <ul className="space-y-3 pt-2">
              {f.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-surface-300">
                  <svg className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/register"
          className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-surface-950 font-bold text-sm shadow-lg shadow-primary-500/20"
        >
          Start Using EcoVolt
        </Link>
      </div>
    </div>
  );
}
