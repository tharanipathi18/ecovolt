import { Link } from 'react-router-dom';

/**
 * Public Home Page — landing page with hero section, system architecture summary, stats, and CTAs.
 */
export default function Home() {
  const features = [
    {
      icon: '☀️',
      title: 'Renewable Generators',
      description: 'Connect solar, wind, hydro, and biomass producers to coordinate clean power availability.',
    },
    {
      icon: '🔌',
      title: 'EV Charging Ports',
      description: 'Smart port management that aligns charging rates with real-time green energy generation.',
    },
    {
      icon: '🧠',
      title: 'AI Demand Forecasting',
      description: 'Predict peak charging demand and optimize energy allocation automatically across microgrid nodes.',
    },
    {
      icon: '🚛',
      title: 'Fleet Management',
      description: 'Schedule commercial EV fleets for off-peak and high-renewable charging intervals.',
    },
  ];

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 py-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-xs font-semibold text-primary-400">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Decentralized Clean Power Coordination
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Powering Electric Mobility with <span className="gradient-text">Clean Renewable Energy</span>
        </h1>

        <p className="text-surface-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          EcoVolt connects renewable energy generators, charging ports, EV users, and commercial fleets to maximize clean energy utilization without physical grid bottlenecks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-base shadow-xl shadow-primary-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Get Started Now
          </Link>
          <Link
            to="/features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-200 font-semibold text-base transition-all"
          >
            Explore Platform Features
          </Link>
        </div>

        {/* System actors pills */}
        <div className="pt-12 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto text-xs text-surface-400">
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/50">☀️ Generators</div>
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/50">🔌 Charging Ports</div>
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/50">⚡ EV Drivers</div>
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/50">🚛 Fleet Managers</div>
          <div className="p-3 rounded-xl bg-surface-800/40 border border-surface-700/50 col-span-2 sm:col-span-1">🛡️ Admin Controls</div>
        </div>
      </section>

      {/* Live Impact Stats Banner */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl glass-card border border-primary-500/20">
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-black text-white">84%</p>
          <p className="text-xs text-surface-400 mt-1 uppercase tracking-wider font-medium">Renewable Sync Ratio</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-black text-primary-400">12.8 GWh</p>
          <p className="text-xs text-surface-400 mt-1 uppercase tracking-wider font-medium">Clean Power Coordinated</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-black text-white">4,200+</p>
          <p className="text-xs text-surface-400 mt-1 uppercase tracking-wider font-medium">Active EV Ports</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-black text-secondary-400">99.9%</p>
          <p className="text-xs text-surface-400 mt-1 uppercase tracking-wider font-medium">AI Forecast Precision</p>
        </div>
      </section>

      {/* Platform Capabilities Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Platform Ecosystem</h2>
          <p className="text-surface-400 text-sm">
            EcoVolt brings together key clean energy ecosystem participants in one synchronized platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass-card border border-surface-700/60 hover:border-primary-500/40 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-surface-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="p-10 rounded-3xl bg-gradient-to-r from-primary-950/80 via-surface-800 to-secondary-950/80 border border-primary-500/30 text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Ready to Coordinate Clean Energy?</h2>
        <p className="text-surface-300 text-sm max-w-xl mx-auto">
          Join thousands of generators, charging station operators, and EV drivers optimizing power utilization today.
        </p>
        <div>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-surface-950 font-bold text-sm shadow-lg shadow-primary-500/25 transition-all"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
