import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import {
  StatCard,
  Card,
  CardHeader,
  Badge,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Toggle,
  Notification,
} from '@components/common';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * System Administration & Governance Module — Complete Dashboard.
 */
export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'assets' | 'fleet' | 'transactions' | 'notifications' | 'settings' | 'analytics'
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Selected User for Editing
  const [selectedUser, setSelectedUser] = useState(null);

  // User Edit Form State
  const [editUserData, setEditUserData] = useState({
    role: 'ev_user',
    isActive: true,
  });

  // Notification Broadcast Form State
  const [notifyFormData, setNotifyFormData] = useState({
    recipientId: '', // empty for broadcast
    title: 'Platform Maintenance Notice',
    message: 'Scheduled microgrid telemetry update at 02:00 UTC.',
    severity: 'info',
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    rateLimitMaxRequests: 100,
    aiServiceUrl: 'http://localhost:8000',
    jwtExpire: '7d',
    gridSyncFrequencySeconds: 15,
  });

  // Users Directory State
  const [users, setUsers] = useState([
    { id: 'USR-01', name: 'Alexander Wright', email: 'alex@ecovolt.com', role: 'admin', isActive: true, joined: '10 Jan 2026' },
    { id: 'USR-02', name: 'Desert Solar Corp', email: 'ops@desertsolar.com', role: 'generator', isActive: true, joined: '14 Feb 2026' },
    { id: 'USR-03', name: 'Metro EV Charging', email: 'admin@metroev.com', role: 'ev_port', isActive: true, joined: '01 Mar 2026' },
    { id: 'USR-04', name: 'Logistics Fleet Inc', email: 'fleet@logistics.com', role: 'fleet_manager', isActive: true, joined: '18 Mar 2026' },
    { id: 'USR-05', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'ev_user', isActive: true, joined: '02 Apr 2026' },
    { id: 'USR-06', name: 'Inactive User', email: 'suspended@example.com', role: 'ev_user', isActive: false, joined: '15 May 2026' },
  ]);

  // Asset Overview State
  const [assets] = useState({
    generators: [
      { name: 'Desert Sun Solar Array Alpha', type: 'Solar', capacity: '1,200 kW', output: '980 kW', status: 'Active' },
      { name: 'Highland Wind Farm #4', type: 'Wind', capacity: '2,500 kW', output: '1,850 kW', status: 'Active' },
      { name: 'Riverbed Hydro Plant', type: 'Hydro', capacity: '800 kW', output: '750 kW', status: 'Active' },
    ],
    ports: [
      { name: 'Downtown Solar Hub', portsCount: '8 Ports', power: '250 kW', status: 'Operational' },
      { name: 'Metro Wind Station', portsCount: '12 Ports', power: '150 kW', status: 'Operational' },
      { name: 'Suburban Clean Hub', portsCount: '4 Ports', power: '50 kW', status: 'Maintenance' },
    ],
  });

  // Energy Transactions Ledger Data
  const [transactions] = useState([
    { id: 'TX-9012', generator: 'Desert Sun Solar Array', port: 'Downtown Solar Hub', energy: '420 kWh', rate: '$0.16 / kWh', payout: '$67.20', status: 'settled', timestamp: 'Today, 14:35' },
    { id: 'TX-9013', generator: 'Highland Wind Farm #4', port: 'Metro Wind Station', energy: '850 kWh', rate: '$0.14 / kWh', payout: '$119.00', status: 'dispatched', timestamp: 'Today, 13:20' },
    { id: 'TX-9014', generator: 'Riverbed Hydro Plant', port: 'Suburban Clean Hub', energy: '310 kWh', rate: '$0.15 / kWh', payout: '$46.50', status: 'allocated', timestamp: 'Today, 11:05' },
  ]);

  // Platform Analytics Chart Data
  const platformAnalyticsData = [
    { time: '00:00', requestsPerSec: 42, throughputKwh: 1200, cleanSyncRatio: 82 },
    { time: '04:00', requestsPerSec: 28, throughputKwh: 950, cleanSyncRatio: 78 },
    { time: '08:00', requestsPerSec: 145, throughputKwh: 2800, cleanSyncRatio: 91 },
    { time: '12:00', requestsPerSec: 220, throughputKwh: 4800, cleanSyncRatio: 96 },
    { time: '16:00', requestsPerSec: 190, throughputKwh: 4200, cleanSyncRatio: 94 },
    { time: '20:00', requestsPerSec: 110, throughputKwh: 2900, cleanSyncRatio: 88 },
  ];

  // Handlers
  const handleOpenEditUserModal = (userItem) => {
    setSelectedUser(userItem);
    setEditUserData({ role: userItem.role, isActive: userItem.isActive });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editUserData.role, isActive: editUserData.isActive } : u)),
    );

    setIsEditUserModalOpen(false);
    setNotification({
      type: 'success',
      title: 'User Role & Status Updated',
      message: `${selectedUser.name} is now ${editUserData.role.toUpperCase()} (${editUserData.isActive ? 'Active' : 'Inactive'}).`,
    });
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    setIsNotifyModalOpen(false);
    setNotification({
      type: notifyFormData.severity,
      title: 'Notification Dispatched!',
      message: `Broadcast message sent to platform users: "${notifyFormData.title}".`,
    });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setNotification({
      type: 'success',
      title: 'System Settings Saved',
      message: 'Global configuration parameters updated successfully.',
    });
  };

  const userColumns = [
    { key: 'name', title: 'User / Organization' },
    { key: 'email', title: 'Email Address' },
    {
      key: 'role',
      title: 'Role',
      render: (row) => (
        <Badge
          variant={
            row.role === 'admin'
              ? 'danger'
              : row.role === 'generator'
              ? 'warning'
              : row.role === 'ev_port'
              ? 'secondary'
              : row.role === 'fleet_manager'
              ? 'info'
              : 'primary'
          }
          size="sm"
        >
          {row.role.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'} dot>
          {row.isActive ? 'ACTIVE' : 'SUSPENDED'}
        </Badge>
      ),
    },
    { key: 'joined', title: 'Registered Date' },
    {
      key: 'action',
      title: 'Governance Action',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => handleOpenEditUserModal(row)}>
          Edit Access
        </Button>
      ),
    },
  ];

  const transactionColumns = [
    { key: 'id', title: 'Tx ID' },
    { key: 'generator', title: 'Clean Power Supplier' },
    { key: 'port', title: 'Destination Port / Node' },
    { key: 'energy', title: 'Energy Dispatched' },
    { key: 'rate', title: 'Tariff Rate' },
    { key: 'payout', title: 'Settlement Payout' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge
          variant={row.status === 'settled' ? 'success' : row.status === 'dispatched' ? 'info' : 'warning'}
          dot
        >
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    { key: 'timestamp', title: 'Time' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
          autoClose
          duration={5000}
        />
      )}

      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-red-950/80 via-surface-800 to-primary-950/80 border border-red-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                System Administration & Governance
              </h1>
              <Badge variant="danger" dot pulse>System Shield Active</Badge>
            </div>
            <p className="text-surface-400 text-xs md:text-sm mt-1">
              Administrator: <span className="text-white font-medium">{user?.name || 'Super Admin'}</span> • Full Root Controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="md" onClick={() => setIsNotifyModalOpen(true)}>
            🔔 Broadcast System Alert
          </Button>
          <Button variant="primary" size="md" onClick={() => setActiveTab('settings')}>
            ⚙️ System Config Settings
          </Button>
        </div>
      </div>

      {/* Key Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Accounts"
          value={`${users.length} Users`}
          change="+84 this week"
          changeType="increase"
          periodText="across 5 roles"
          badgeText="Active Network"
          badgeVariant="primary"
          icon={<span className="text-xl">👥</span>}
        />
        <StatCard
          title="Operational Microgrids"
          value="16 Microgrid Nodes"
          change="100% Online"
          changeType="increase"
          periodText="grid infrastructure"
          badgeText="Operational"
          badgeVariant="success"
          icon={<span className="text-xl">🌐</span>}
        />
        <StatCard
          title="Total Coordinated Energy"
          value="14.2 GWh"
          change="+1.8 GWh"
          changeType="increase"
          periodText="cumulative dispatch"
          badgeText="High Capacity"
          badgeVariant="info"
          icon={<span className="text-xl">⚡</span>}
        />
        <StatCard
          title="JWT Shield Security"
          value="Active"
          change="0 Breaches"
          changeType="increase"
          periodText="bcrypt + JWT token"
          badgeText="Secure"
          badgeVariant="success"
          icon={<span className="text-xl">🔒</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          👥 User Governance ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'assets'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ☀️ Generators & 🔌 Ports Assets
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          💳 Energy Transactions Ledger
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ⚙️ System Config Settings
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📊 System Traffic & Analytics
        </button>
      </div>

      {/* TAB 1: User Governance Table */}
      {activeTab === 'users' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Platform User Accounts Directory</h2>
            <Badge variant="danger">Root Access Controls</Badge>
          </div>
          <Table columns={userColumns} data={users} />
        </section>
      )}

      {/* TAB 2: Asset Oversight (Generators & Ports) */}
      {activeTab === 'assets' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <span>☀️</span> Renewable Generation Facilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assets.generators.map((gen, idx) => (
                <Card key={idx} variant="glass" padding="normal">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-base">{gen.name}</h4>
                    <Badge variant="warning" size="sm">{gen.type}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-surface-400 my-2">
                    <p>Rated Capacity: <span className="text-white font-semibold">{gen.capacity}</span></p>
                    <p>Current Output: <span className="text-primary-400 font-semibold">{gen.output}</span></p>
                  </div>
                  <Badge variant="success" dot>OPERATIONAL</Badge>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <span>🔌</span> EV Charging Station Infrastructure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assets.ports.map((port, idx) => (
                <Card key={idx} variant="glass" padding="normal">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-base">{port.name}</h4>
                    <Badge variant="info" size="sm">{port.portsCount}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-surface-400 my-2">
                    <p>Max Output Power: <span className="text-white font-semibold">{port.power}</span></p>
                  </div>
                  <Badge variant={port.status === 'Operational' ? 'success' : 'warning'} dot>
                    {port.status.toUpperCase()}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Energy Transactions Ledger */}
      {activeTab === 'transactions' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">System-Wide Clean Energy Settlement Ledger</h2>
            <Badge variant="info">Automated Microgrid Settlement</Badge>
          </div>
          <Table columns={transactionColumns} data={transactions} />
        </section>
      )}

      {/* TAB 4: System Config Settings */}
      {activeTab === 'settings' && (
        <Card variant="glass" padding="normal" className="max-w-2xl">
          <CardHeader title="Global Platform Configuration" subtitle="System environment & rate limiting settings" />
          <form onSubmit={handleSaveSettings} className="space-y-6 py-2">
            <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/60 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Platform Maintenance Mode</span>
                <span className="text-xs text-surface-400 block">Temporarily pause non-essential user actions</span>
              </div>
              <Toggle
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Rate Limit Max Requests (per 15m)"
                type="number"
                value={systemSettings.rateLimitMaxRequests}
                onChange={(e) => setSystemSettings({ ...systemSettings, rateLimitMaxRequests: parseInt(e.target.value) })}
              />
              <Input
                label="Grid Sync Frequency (sec)"
                type="number"
                value={systemSettings.gridSyncFrequencySeconds}
                onChange={(e) => setSystemSettings({ ...systemSettings, gridSyncFrequencySeconds: parseInt(e.target.value) })}
              />
            </div>

            <Input
              label="AI Microservice Gateway URL"
              value={systemSettings.aiServiceUrl}
              onChange={(e) => setSystemSettings({ ...systemSettings, aiServiceUrl: e.target.value })}
            />

            <Button variant="primary" type="submit">
              Save Global Settings
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 5: System Traffic & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader
                title="System API Throughput & Microgrid Dispatch Rate"
                subtitle="Requests per second vs Energy Throughput (kWh)"
              />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={platformAnalyticsData}>
                    <defs>
                      <linearGradient id="reqColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="kwhColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e65c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00e65c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="requestsPerSec" name="API Req/sec" stroke="#ef4444" fillOpacity={1} fill="url(#reqColor)" />
                    <Area type="monotone" dataKey="throughputKwh" name="Power Dispatched (kWh)" stroke="#00e65c" fillOpacity={1} fill="url(#kwhColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader title="Clean Energy Sync Ratio (%)" subtitle="Percentage of renewable matching" />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" %" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Bar dataKey="cleanSyncRatio" name="Clean Energy Sync (%)" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Edit User Role & Status */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title={`Edit User Access for ${selectedUser?.name}`}
        subtitle="Manage platform roles and account suspension status"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 py-2">
          <Select
            label="Assigned Role"
            value={editUserData.role}
            onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Administrator (Full Root Controls)' },
              { value: 'generator', label: 'Energy Generator Operator' },
              { value: 'ev_port', label: 'EV Charging Port Operator' },
              { value: 'ev_user', label: 'EV User Driver' },
              { value: 'fleet_manager', label: 'Fleet Manager' },
            ]}
          />

          <div className="p-4 rounded-xl bg-surface-800/80 border border-surface-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Account Active Status</span>
            <Toggle
              checked={editUserData.isActive}
              onChange={(e) => setEditUserData({ ...editUserData, isActive: e.target.checked })}
              label={editUserData.isActive ? 'Active' : 'Suspended'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsEditUserModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Governance Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Broadcast System Notification */}
      <Modal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        title="Broadcast System Notification"
        subtitle="Send platform alert or announcement to all users"
      >
        <form onSubmit={handleSendNotification} className="space-y-4 py-2">
          <Input
            label="Notification Title"
            required
            value={notifyFormData.title}
            onChange={(e) => setNotifyFormData({ ...notifyFormData, title: e.target.value })}
          />

          <Input
            label="Message Body"
            required
            value={notifyFormData.message}
            onChange={(e) => setNotifyFormData({ ...notifyFormData, message: e.target.value })}
          />

          <Select
            label="Severity Level"
            value={notifyFormData.severity}
            onChange={(e) => setNotifyFormData({ ...notifyFormData, severity: e.target.value })}
            options={[
              { value: 'info', label: 'Info (Blue)' },
              { value: 'success', label: 'Success (Green)' },
              { value: 'warning', label: 'Warning (Amber)' },
              { value: 'error', label: 'Alert / Error (Red)' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsNotifyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Dispatch Broadcast Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
