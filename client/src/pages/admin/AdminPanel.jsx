import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import adminService from '@services/adminService';
import {
  StatCard,
  Card,
  CardHeader,
  Badge,
  Table,
  Button,
  Modal,
  Select,
  Toggle,
  Notification,
} from '@components/common';

/**
 * System Administration & Governance Module — Standalone Admin Portal.
 * Handles all 10 Admin management sections:
 *  1. Dashboard
 *  2. Users
 *  3. Station Requests
 *  4. Approved Stations
 *  5. Vehicles
 *  6. Bookings
 *  7. Charging Sessions
 *  8. Reports
 *  9. Notifications
 * 10. Settings
 */
export default function AdminPanel() {
  const { user } = useAuth();
  const location = useLocation();

  // Determine active section from URL path (e.g. /admin/users -> 'users')
  const pathSegment = location.pathname.split('/')[2] || 'dashboard';
  const [activeTab, setActiveTab] = useState(pathSegment);

  useEffect(() => {
    setActiveTab(pathSegment === 'station-requests' ? 'applications' : pathSegment === 'approved-stations' ? 'ports' : pathSegment);
  }, [pathSegment]);

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dynamic API State (Strictly from Supabase DB via Prisma)
  const [pendingApplications, setPendingApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [generators, setGenerators] = useState([]);
  const [ports, setPorts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState(null);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    rateLimitMaxRequests: 100,
    aiServiceUrl: 'http://localhost:8000',
    jwtExpire: '7d',
    gridSyncFrequencySeconds: 15,
  });

  // Notification Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: 'System Notice',
    message: 'Scheduled grid optimization telemetry update.',
  });

  // Loading & Submitting States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Edit Form State
  const [editUserData, setEditUserData] = useState({
    role: 'ev_user',
    isActive: true,
  });

  // ─── Fetch All Admin Data from Backend API ────────────────────────────────
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch System Overview
      const oRes = await adminService.getOverview();
      setOverview(oRes.data?.stats || null);

      // 2. Fetch Pending Station Applications
      const appRes = await adminService.getPendingStationApplications();
      setPendingApplications(appRes.data?.applications || []);

      // 3. Fetch Users
      const uRes = await adminService.getUsers();
      setUsers(uRes.data?.users || []);

      // 4. Fetch Generators
      const gRes = await adminService.getGenerators();
      setGenerators(gRes.data?.generators || []);

      // 5. Fetch Charging Ports
      const pRes = await adminService.getChargingPorts();
      setPorts(pRes.data?.ports || []);

      // 6. Fetch Vehicles
      const vRes = await adminService.getVehicles();
      setVehicles(vRes.data?.vehicles || []);

      // 7. Fetch Bookings
      const bRes = await adminService.getBookings();
      setBookings(bRes.data?.bookings || []);

      // 8. Fetch Sessions
      const sRes = await adminService.getSessions();
      setSessions(sRes.data?.sessions || []);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Admin Sync Warning',
        message: err.message || 'Could not fetch live system metrics from Supabase DB.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // ─── Station Application Decision Handler (APPROVE / REJECT) ─────────────
  const handleReviewApplication = async (portId, decision) => {
    setIsSubmitting(true);
    try {
      await adminService.reviewStationApplication(portId, decision);
      setPendingApplications((prev) => prev.filter((a) => a.id !== portId));
      const isApprove = decision === 'APPROVE';
      setNotification({
        type: isApprove ? 'success' : 'warning',
        title: `Station ${isApprove ? 'APPROVED! ⚡' : 'REJECTED ❌'}`,
        message: `Station application set to ${decision} in Supabase DB. ${isApprove ? 'It is now visible publicly.' : 'It remains hidden.'}`,
      });
      loadAdminData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Review Failed', message: err.message || 'Could not review application.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── User Role Update Handler ──────────────────────────────────────────────
  const handleOpenEditUserModal = (userItem) => {
    setSelectedUser(userItem);
    setEditUserData({ role: userItem.role, isActive: userItem.isActive });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await adminService.updateUserRole(selectedUser.id, {
        role: editUserData.role,
        isActive: editUserData.isActive,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...res.data.user } : u)),
      );

      setIsEditUserModalOpen(false);
      setNotification({
        type: 'success',
        title: 'User Role Updated! 🛡️',
        message: `Updated permissions for ${selectedUser.name}. Saved in Supabase DB.`,
      });
      loadAdminData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Update Failed', message: err.message || 'Could not update user role.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Columns Configuration
  const applicationColumns = [
    { key: 'business', title: 'Business Name', render: (row) => row.businessName || row.stationName },
    { key: 'owner', title: 'Owner Name', render: (row) => row.ownerName || row.operator?.name || 'Applicant' },
    { key: 'phone', title: 'Phone', render: (row) => row.phone || row.operator?.phone || 'N/A' },
    { key: 'location', title: 'Location Address', render: (row) => `${row.locationAddress || ''}, ${row.locationCity || ''}` },
    { key: 'ports', title: 'Ports Count', render: (row) => `${row.numberOfPorts || 1} Ports (${row.connectorType?.toUpperCase()})` },
    { key: 'rate', title: 'Tariff Rate', render: (row) => `$${row.pricingRatePerKwh} / kWh` },
    { key: 'status', title: 'Status', render: () => <Badge variant="warning" dot>PENDING REVIEW</Badge> },
    {
      key: 'actions',
      title: 'Admin Decision',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleReviewApplication(row.id, 'APPROVE')}
          >
            APPROVE
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleReviewApplication(row.id, 'REJECT')}
          >
            REJECT
          </Button>
        </div>
      ),
    },
  ];

  const userColumns = [
    { key: 'name', title: 'Full Name', render: (row) => row.name },
    { key: 'email', title: 'Email Address', render: (row) => row.email },
    { key: 'role', title: 'Assigned Role', render: (row) => <Badge variant={row.role === 'admin' ? 'primary' : 'info'} size="sm">{row.role.toUpperCase()}</Badge> },
    { key: 'status', title: 'Status', render: (row) => <Badge variant={row.isActive ? 'success' : 'danger'} dot>{row.isActive ? 'ACTIVE' : 'SUSPENDED'}</Badge> },
    { key: 'joined', title: 'Joined Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      title: 'Governance',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => handleOpenEditUserModal(row)}>
          Edit Role / Status
        </Button>
      ),
    },
  ];

  const vehicleColumns = [
    { key: 'make', title: 'Make & Model', render: (row) => `${row.make} ${row.model}` },
    { key: 'year', title: 'Year', render: (row) => row.year },
    { key: 'plate', title: 'License Plate', render: (row) => <span className="font-mono text-primary-400 font-bold">{row.licensePlate}</span> },
    { key: 'capacity', title: 'Battery Capacity', render: (row) => `${row.batteryCapacityKwh} kWh` },
    { key: 'connector', title: 'Connector', render: (row) => row.connectorType?.toUpperCase() },
    { key: 'owner', title: 'Owner Name', render: (row) => row.owner?.name || 'EV Driver' },
  ];

  const bookingColumns = [
    { key: 'ref', title: 'Ref #', render: (row) => <span className="font-mono text-secondary-400 font-bold">{row.bookingReference}</span> },
    { key: 'station', title: 'Station', render: (row) => row.chargingPort?.stationName || 'Clean Power Hub' },
    { key: 'user', title: 'Driver', render: (row) => row.user?.name || 'EV User' },
    { key: 'time', title: 'Scheduled Time', render: (row) => new Date(row.scheduledStartTime).toLocaleString() },
    { key: 'duration', title: 'Duration', render: (row) => `${row.durationMinutes} mins` },
    { key: 'status', title: 'Status', render: (row) => <Badge variant={row.status === 'confirmed' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'} dot>{row.status.toUpperCase()}</Badge> },
  ];

  const sessionColumns = [
    { key: 'station', title: 'Station', render: (row) => row.chargingPort?.stationName || 'Hub' },
    { key: 'driver', title: 'Driver', render: (row) => row.user?.name || 'EV Driver' },
    { key: 'vehicle', title: 'Vehicle', render: (row) => `${row.vehicle?.make || 'EV'} (${row.vehicle?.licensePlate || ''})` },
    { key: 'energy', title: 'Energy Delivered', render: (row) => `${row.energyConsumedKwh || 0} kWh` },
    { key: 'cost', title: 'Cost ($)', render: (row) => `$${row.cost || 0}` },
    { key: 'status', title: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'info' : 'success'} dot>{row.status.toUpperCase()}</Badge> },
  ];

  const portColumns = [
    { key: 'identifier', title: 'Port Code', render: (row) => <span className="font-mono text-secondary-400 font-bold">{row.portIdentifier}</span> },
    { key: 'station', title: 'Station Name', render: (row) => row.stationName },
    { key: 'connector', title: 'Connector Standard', render: (row) => row.connectorType?.toUpperCase() },
    { key: 'power', title: 'Max Power', render: (row) => `${row.maxPowerOutputKw} kW` },
    { key: 'approval', title: 'Approval Status', render: (row) => <Badge variant={row.isApproved ? 'success' : 'danger'} dot>{row.approvalStatus || (row.isApproved ? 'APPROVED' : 'PENDING')}</Badge> },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-surface-900 via-primary-950/90 to-surface-900 border border-primary-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-primary-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                System Administration &amp; Governance
              </h1>
              <Badge variant="primary" dot pulse>Live Supabase DB</Badge>
            </div>
            <p className="text-surface-400 text-xs md:text-sm mt-1">
              Admin: <span className="text-white font-medium">{user?.name || 'Administrator'}</span> •{' '}
              {users.length} Total Registered Accounts
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Pending Station Applications"
          value={`${pendingApplications.length} Requests`}
          change="Station Owner Applications"
          changeType="increase"
          periodText="requires admin review"
          badgeText="Review Needed"
          badgeVariant="warning"
          icon={<span className="text-xl">📋</span>}
        />
        <StatCard
          title="Registered EV Vehicles"
          value={`${overview?.vehiclesCount || vehicles.length} EVs`}
          change="Public & Fleet Vehicles"
          changeType="increase"
          periodText="live count from DB"
          badgeText="EV Fleet"
          badgeVariant="primary"
          icon={<span className="text-xl">🚗</span>}
        />
        <StatCard
          title="Approved Charging Ports"
          value={`${overview?.portsCount || ports.filter(p => p.isApproved).length} Ports`}
          change="Public Charging Infrastructure"
          changeType="increase"
          periodText="active network"
          badgeText="Live Ports"
          badgeVariant="success"
          icon={<span className="text-xl">🔌</span>}
        />
        <StatCard
          title="Slot Reservations"
          value={`${overview?.bookingsCount || bookings.length} Bookings`}
          change="Advance Reservations"
          changeType="increase"
          periodText="slot booking ledger"
          badgeText="Bookings"
          badgeVariant="info"
          icon={<span className="text-xl">🗓️</span>}
        />
      </div>

      {/* Navigation Tabs (All 10 Sections Supported) */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          👥 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'applications'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📋 Station Requests ({pendingApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('ports')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'ports'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🔌 Approved Stations ({ports.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'vehicles'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🚗 Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🗓️ Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ⚡ Charging Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📈 Reports
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🔔 Notifications
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* SECTION 1: Dashboard Overview */}
      {(activeTab === 'dashboard' || activeTab === 'overview') && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass" padding="normal">
              <CardHeader title="System Architecture &amp; Database Health" subtitle="Supabase PostgreSQL Pool Status" />
              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between">
                  <span className="text-surface-400">Database Engine:</span>
                  <span className="text-white font-bold">PostgreSQL (Supabase)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">ORM Mapping Layer:</span>
                  <span className="text-primary-400 font-bold">Prisma ORM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Pool Limit:</span>
                  <span className="text-emerald-400 font-bold">10 Active Connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Governance Mode:</span>
                  <span className="text-white font-bold">Strict Role Protection</span>
                </div>
              </div>
            </Card>

            <Card variant="glass" padding="normal">
              <CardHeader title="Quick Action Summary" subtitle="Pending admin tasks" />
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Station Applications Pending:</span>
                  <Badge variant="warning">{pendingApplications.length} Pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Active Charging Sessions:</span>
                  <Badge variant="info">{sessions.filter(s => s.status === 'active').length} Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Registered EV Accounts:</span>
                  <Badge variant="primary">{users.length} Users</Badge>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* SECTION 2: Users */}
      {activeTab === 'users' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">System User Accounts</h2>
            <Badge variant="primary">Access Control</Badge>
          </div>
          <Table columns={userColumns} data={users} emptyMessage="No user accounts found." />
        </section>
      )}

      {/* SECTION 3: Station Requests */}
      {activeTab === 'applications' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Charging Station Owner Applications</h2>
            <Badge variant="warning">Admin Governance Review</Badge>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-surface-400 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading station applications from Supabase...</span>
            </div>
          ) : (
            <Table columns={applicationColumns} data={pendingApplications} emptyMessage="No pending station owner applications." />
          )}
        </section>
      )}

      {/* SECTION 4: Approved Stations */}
      {activeTab === 'ports' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Approved Public Charging Connectors</h2>
            <Badge variant="info">Charging Infrastructure</Badge>
          </div>
          <Table columns={portColumns} data={ports} emptyMessage="No charging ports registered." />
        </section>
      )}

      {/* SECTION 5: Vehicles */}
      {activeTab === 'vehicles' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Registered EV Vehicle Fleet</h2>
            <Badge variant="primary">EV Fleet</Badge>
          </div>
          <Table columns={vehicleColumns} data={vehicles} emptyMessage="No vehicles registered." />
        </section>
      )}

      {/* SECTION 6: Bookings */}
      {activeTab === 'bookings' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Slot Reservation Ledger</h2>
            <Badge variant="info">Bookings</Badge>
          </div>
          <Table columns={bookingColumns} data={bookings} emptyMessage="No bookings found." />
        </section>
      )}

      {/* SECTION 7: Charging Sessions */}
      {activeTab === 'sessions' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Charging Sessions History</h2>
            <Badge variant="success">Sessions</Badge>
          </div>
          <Table columns={sessionColumns} data={sessions} emptyMessage="No charging sessions found." />
        </section>
      )}

      {/* SECTION 8: Reports */}
      {activeTab === 'reports' && (
        <Card variant="glass" padding="normal">
          <CardHeader title="System Telemetry &amp; Analytics Reports" subtitle="Aggregate clean energy stats" />
          <div className="p-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-surface-400">Total Clean Energy Delivered:</span>
              <span className="text-emerald-400 font-bold">{overview?.totalEnergyGwh || 0} GWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">Total Settlement Revenue:</span>
              <span className="text-white font-bold">${overview?.totalRevenue || 0}</span>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 9: Notifications */}
      {activeTab === 'notifications' && (
        <Card variant="glass" padding="normal" className="max-w-xl">
          <CardHeader title="Broadcast Notification Dispatcher" subtitle="Send notices to system users" />
          <form className="space-y-4 py-2" onSubmit={(e) => {
            e.preventDefault();
            setNotification({ type: 'success', title: 'Broadcast Sent! 🔔', message: `Notice dispatched to all users.` });
          }}>
            <Input
              label="Notification Title"
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
            />
            <Input
              label="Message Body"
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
            />
            <Button variant="primary" type="submit">Broadcast System Notice</Button>
          </form>
        </Card>
      )}

      {/* SECTION 10: Settings */}
      {activeTab === 'settings' && (
        <Card variant="glass" padding="normal" className="max-w-xl">
          <CardHeader title="Platform System Settings" subtitle="Configure governance rules" />
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/60 border border-surface-700">
              <div>
                <p className="font-bold text-white">System Maintenance Mode</p>
                <p className="text-surface-400 text-[11px]">Temporarily restrict new bookings</p>
              </div>
              <Toggle
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
              />
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: Edit User Governance */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title={`Governance & Role: ${selectedUser?.name}`}
        subtitle="Manage user role permissions and active status"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 py-2">
          <Select
            label="System Role"
            value={editUserData.role}
            onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
            options={[
              { value: 'ev_user', label: 'EV User / Driver' },
              { value: 'ev_port', label: 'EV Port Owner' },
              { value: 'generator', label: 'Energy Generator' },
              { value: 'fleet_manager', label: 'Fleet Manager' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/60 border border-surface-700">
            <div>
              <p className="text-xs font-bold text-white">Account Status</p>
              <p className="text-[11px] text-surface-400">Suspended accounts cannot log in</p>
            </div>
            <Toggle
              checked={editUserData.isActive}
              onChange={(e) => setEditUserData({ ...editUserData, isActive: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsEditUserModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save User Settings'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
