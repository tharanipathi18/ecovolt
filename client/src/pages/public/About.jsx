import { Link } from 'react-router-dom';

/**
 * Public About Page — platform mission, architecture scope, and core principles.
 */
export default function About() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          About <span className="gradient-text">EcoVolt</span>
        </h1>
        <p className="text-surface-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Decentralized renewable energy coordination engineered for the electric vehicle era.
        </p>
      </div>

      {/* Mission Card */}
      <div className="p-8 rounded-2xl glass-card border border-surface-700/60 space-y-4">
        <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        <p className="text-surface-300 text-sm leading-relaxed">
          Electric vehicle adoption is accelerating rapidly, placing unprecedented load on electrical grids. EcoVolt addresses this challenge by matching real-time renewable energy availability (solar, wind, hydro) directly with EV charging demand.
        </p>
        <p className="text-surface-300 text-sm leading-relaxed">
          <strong className="text-primary-400 font-semibold">Important Architectural Principle:</strong> EcoVolt does <em>not</em> physically transfer electricity. Instead, it acts as an intelligent digital coordination layer that operates over existing electrical grid and microgrid infrastructure.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-surface-700/60 space-y-3">
          <div className="text-3xl">🌱</div>
          <h3 className="text-lg font-bold text-white">Sustainability First</h3>
          <p className="text-xs text-surface-400 leading-relaxed">
            Prioritizing zero-carbon power sources to ensure electric vehicles charge on genuine clean energy.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-surface-700/60 space-y-3">
          <div className="text-3xl">🤖</div>
          <h3 className="text-lg font-bold text-white">AI-Driven Precision</h3>
          <p className="text-xs text-surface-400 leading-relaxed">
            Leveraging predictive machine learning models to forecast generation curves and charging demand peaks.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-surface-700/60 space-y-3">
          <div className="text-3xl">🌐</div>
          <h3 className="text-lg font-bold text-white">Decentralized Synergy</h3>
          <p className="text-xs text-surface-400 leading-relaxed">
            Empowering independent generators, commercial fleets, and individual drivers in a unified network.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/register"
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-sm shadow-lg shadow-primary-500/20"
        >
          Join EcoVolt Today
        </Link>
      </div>
    </div>
  );
}
