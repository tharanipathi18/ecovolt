import { useState } from 'react';

/**
 * Public Contact Page — inquiry form and support information.
 */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-surface-300 text-base max-w-xl mx-auto">
          Have questions about integrating your generator, EV charging station, or fleet? Contact our engineering team.
        </p>
      </div>

      <div className="glass-card p-8 md:p-10 rounded-3xl border border-surface-700/60">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white">Message Received</h2>
            <p className="text-surface-400 text-sm max-w-md mx-auto">
              Thank you for reaching out. Our energy coordination team will respond within 24 hours.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
              className="px-6 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Subject / Interest</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">Select subject...</option>
                <option value="Generator Integration">Renewable Generator Integration</option>
                <option value="Charging Station Network">EV Charging Station Network</option>
                <option value="Fleet Operations">Fleet Management Solution</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Message</label>
              <textarea
                rows={5}
                required
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-4 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-sm shadow-lg shadow-primary-500/20"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
