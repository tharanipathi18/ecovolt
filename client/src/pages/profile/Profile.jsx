import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { ROLE_LABELS } from '@utils/constants';
import evUserService from '@services/evUserService';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Modal from '@components/common/Modal';

/**
 * User Profile Page — Displays authentic user details and allows inline editing.
 */
export default function Profile() {
  const { user, setUser } = useAuth();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.addressStreet || '',
  });

  const handleEditOpen = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.addressStreet || '',
    });
    setSuccessMessage('');
    setErrorMessage('');
    setIsEditOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await evUserService.updateProfile(formData);
      const updatedUser = res.data?.user || res.data;
      setUser((prev) => ({ ...prev, ...updatedUser }));
      setSuccessMessage('Profile updated successfully.');
      setIsEditOpen(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Member';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-md relative group">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'EV'}</span>
            )}
            {user?.isEmailVerified && (
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center text-xs"
                title="Verified Account"
              >
                ✓
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user?.name || 'Account User'}
              </h1>
              <Badge variant="success" size="sm">
                {ROLE_LABELS[user?.role] || user?.role || 'EV User'}
              </Badge>
            </div>
            <p className="text-slate-500 text-xs md:text-sm">{user?.email}</p>
            <p className="text-slate-400 text-[11px] mt-1">
              Member since {formattedDate}
            </p>
          </div>
        </div>

        <Button onClick={handleEditOpen} variant="primary" icon="✏️">
          Edit Profile
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info Card */}
        <Card title="Account Details" subtitle="Primary account identity and contact information">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Full Name
              </span>
              <span className="text-sm font-bold text-slate-900">{user?.name || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email Address
              </span>
              <span className="text-sm font-semibold text-slate-900">{user?.email || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Phone Number
              </span>
              <span className="text-sm font-medium text-slate-800">{user?.phone || 'Not provided'}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Primary Role
              </span>
              <span className="text-sm font-bold text-emerald-800">
                {ROLE_LABELS[user?.role] || user?.role || 'EV User'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Verification Status
              </span>
              <Badge variant={user?.isEmailVerified ? 'success' : 'warning'} size="sm">
                {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Address & Preferences Card */}
        <Card title="Location & System Metadata" subtitle="Registered address and account credentials">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Street Address
              </span>
              <span className="text-sm font-medium text-slate-800">
                {user?.addressStreet || 'Not provided'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Country
              </span>
              <span className="text-sm font-medium text-slate-800">
                {user?.addressCountry || 'USA'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Authentication Method
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Email &amp; Password
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Account ID
              </span>
              <span className="text-xs font-mono text-slate-500 truncate max-w-[180px]">
                {user?.id || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Last System Login
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active session'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Information"
        subtitle="Update your personal details. Role and identity properties are managed by system administrators."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              placeholder="123 Eco Energy Way"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
