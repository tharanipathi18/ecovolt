import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import authService from '@services/authService';
import Card from '@components/common/Card';
import Button from '@components/common/Button';

/**
 * User Settings Page — Password change, system preferences, notification toggles.
 */
export default function Settings() {
  const { user } = useAuth();

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, success: '', error: '' });

  const [notifications, setNotifications] = useState({
    chargingAlerts: true,
    gridUpdates: true,
    maintenanceReminders: true,
    emailReceipts: true,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setPassStatus({ loading: false, success: '', error: 'New passwords do not match' });
      return;
    }

    setPassStatus({ loading: true, success: '', error: '' });
    try {
      await authService.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      setPassStatus({ loading: false, success: 'Password updated successfully.', error: '' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || err.message || 'Password update failed.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account &amp; System Settings
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Manage your security credentials, notification preferences, and platform experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security / Password Section */}
        <Card title="Security & Credentials" subtitle="Update account password and security options">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passStatus.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                ✅ {passStatus.success}
              </div>
            )}
            {passStatus.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                ⚠️ {passStatus.error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" loading={passStatus.loading} className="w-full">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Notifications & Preferences */}
        <Card title="Notification Preferences" subtitle="Control real-time updates and email alerts">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Charging Session Alerts</p>
                <p className="text-[11px] text-slate-500">Notifications when charging starts or stops</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.chargingAlerts}
                onChange={(e) => setNotifications({ ...notifications, chargingAlerts: e.target.checked })}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Renewable Grid Synchronization</p>
                <p className="text-[11px] text-slate-500">Alerts during peak clean energy generation</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.gridUpdates}
                onChange={(e) => setNotifications({ ...notifications, gridUpdates: e.target.checked })}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Vehicle Maintenance Reminders</p>
                <p className="text-[11px] text-slate-500">Battery health and service notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.maintenanceReminders}
                onChange={(e) => setNotifications({ ...notifications, maintenanceReminders: e.target.checked })}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-900">Email Session Statements</p>
                <p className="text-[11px] text-slate-500">Receive receipt PDFs upon charging completion</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailReceipts}
                onChange={(e) => setNotifications({ ...notifications, emailReceipts: e.target.checked })}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 border-slate-300"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
