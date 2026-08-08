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
    <div className="space-y-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          Decentralized Clean Power Ecosystem
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-slate-900">
          Powering a <span className="gradient-text">Cleaner Drive</span>
        </h1>

        <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
          Connect renewable energy, intelligent charging and electric mobility in one ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/charging"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
          >
            Find a Charger
          </Link>
          <Link
            to="/features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base transition-all"
          >
            Explore EcoVolt
          </Link>
        </div>

        {/* System actors pills */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-medium">☀️ Generators</div>
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-medium">🔌 Charging Ports</div>
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-medium">⚡ EV Drivers</div>
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-medium">🚛 Fleet Managers</div>
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-medium col-span-2 sm:col-span-1">🛡️ Admin Controls</div>
        </div>
      </section>

      {/* Live Impact Stats Banner */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">84%</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Renewable Sync Ratio</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-800">12.8 GWh</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Clean Power Coordinated</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">4,200+</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Active EV Ports</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700">99.9%</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">AI Forecast Precision</p>
        </div>
      </section>

      {/* Platform Capabilities Grid */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Platform Ecosystem</h2>
          <p className="text-slate-600 text-sm">
            EcoVolt brings together key clean energy ecosystem participants in one synchronized platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Ready to Coordinate Clean Energy?</h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Join thousands of generators, charging station operators, and EV drivers optimizing power utilization today.
        </p>
        <div>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}

