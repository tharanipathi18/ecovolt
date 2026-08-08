import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import fleetService from '@services/fleetService';
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
  Notification,
} from '@components/common';

// ─── Constant Helpers ────────────────────────────────────────────────────────

const STATUS_BADGE = {
  ACTIVE:          { variant: 'success', label: 'ACTIVE' },
  IN_MAINTENANCE:  { variant: 'warning', label: 'IN MAINTENANCE' },
  CHARGING:        { variant: 'info',    label: 'CHARGING' },
  INACTIVE:        { variant: 'danger',  label: 'INACTIVE' },
};

const COMPLAINT_STATUS_BADGE = {
  OPEN:       { variant: 'danger',  label: 'OPEN' },
  IN_REVIEW:  { variant: 'warning', label: 'IN REVIEW' },
  RESOLVED:   { variant: 'success', label: 'RESOLVED' },
};

const MAINTENANCE_STATUS_BADGE = {
  SCHEDULED:   { variant: 'info',    label: 'SCHEDULED' },
  IN_PROGRESS: { variant: 'warning', label: 'IN PROGRESS' },
  COMPLETED:   { variant: 'success', label: 'COMPLETED' },
  CANCELLED:   { variant: 'danger',  label: 'CANCELLED' },
};

const PRIORITY_BADGE = {
  LOW:      { variant: 'success', label: 'LOW' },
  MEDIUM:   { variant: 'info',    label: 'MEDIUM' },
  HIGH:     { variant: 'warning', label: 'HIGH' },
  CRITICAL: { variant: 'danger',  label: 'CRITICAL' },
};

const BOOKING_STATUS_BADGE = {
  pending:   { variant: 'warning', label: 'PENDING APPROVAL' },
  confirmed: { variant: 'success', label: 'CONFIRMED' },
  rejected:  { variant: 'danger',  label: 'REJECTED' },
  completed: { variant: 'info',    label: 'COMPLETED' },
  cancelled: { variant: 'neutral', label: 'CANCELLED' },
};

const SESSION_STATUS_BADGE = {
  active:    { variant: 'info',    label: 'ACTIVE' },
  completed: { variant: 'success', label: 'COMPLETED' },
  failed:    { variant: 'danger',  label: 'FAILED' },
};

const CHARGE_DURATION_OPTIONS = [
  { value: '30',  label: '30 minutes' },
  { value: '45',  label: '45 minutes' },
  { value: '60',  label: '1 hour' },
  { value: '90',  label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const VEHICLE_TYPE_OPTIONS = [
  { value: 'car',   label: 'Car' },
  { value: 'van',   label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'bus',   label: 'Bus' },
  { value: 'bike',  label: 'Bike / Scooter' },
  { value: 'suv',   label: 'SUV' },
];

const CONNECTOR_OPTIONS = [
  { value: 'ccs_2',  label: 'CCS 2 (Standard)' },
  { value: 'ccs_1',  label: 'CCS 1' },
  { value: 'type_2', label: 'Type 2 (AC)' },
  { value: 'type_1', label: 'Type 1 (AC)' },
  { value: 'chademo', label: 'CHAdeMO' },
  { value: 'tesla',  label: 'Tesla / NACS' },
];

const COMPLAINT_CATEGORIES = [
  { value: 'BATTERY',  label: '🔋 Battery Issue' },
  { value: 'BRAKE',    label: '🛑 Brake Issue' },
  { value: 'TYRE',     label: '🛞 Tyre Issue' },
  { value: 'CHARGING', label: '⚡ Charging Issue' },
  { value: 'MOTOR',    label: '⚙️ Motor Issue' },
  { value: 'OTHER',    label: '📝 Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW',      label: 'Low' },
  { value: 'MEDIUM',   label: 'Medium' },
  { value: 'HIGH',     label: 'High' },
  { value: 'CRITICAL', label: 'Critical (Urgent)' },
];

// ─── Empty State Component ────────────────────────────────────────────────────

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-surface-700 bg-surface-800">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-surface-400 text-sm mb-6 max-w-sm">{subtitle}</p>
      {action}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Fleet Management Module — Production Ready with Real Supabase DB Integration.
 * Implements the complete 10-step Fleet Manager workflow:
 *  1. Fleet Manager registers vehicles
 *  2. Drivers can only be added AFTER a vehicle exists
 *  3. Driver Management (name, email, license, vehicle assignment)
 *  4. Driver Dashboard (view vehicle, complaints)
 *  5. Vehicle Complaint workflow (driver → fleet manager)
 *  6. Fleet Manager schedules maintenance from complaint
 *  7-9. Charging workflow (via bookings)
 *  10. Fleet Analytics (real DB data only)
 */
export default function FleetManagement({ initialTab = 'fleet' }) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [notification, setNotification] = useState(null);

  // ── Modal states ────────────────────────────────────────────────
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [showRaiseComplaint, setShowRaiseComplaint] = useState(false);
  const [showScheduleMaintenance, setShowScheduleMaintenance] = useState(false);
  const [showMaintenanceComplete, setShowMaintenanceComplete] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [selectedVehicleForDriver, setSelectedVehicleForDriver] = useState(null);

  // ── Data state ─────────────────────────────────────────────────
  const [fleetVehicles, setFleetVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Charging state ──────────────────────────────────────────────
  const [chargeSubTab, setChargeSubTab] = useState('find');
  const [nearbyPorts, setNearbyPorts] = useState([]);
  const [fleetBookings, setFleetBookings] = useState([]);
  const [chargingHistory, setChargingHistory] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingPorts, setIsLoadingPorts] = useState(false);
  const [isLoadingChargeData, setIsLoadingChargeData] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedVehicleForCharge, setSelectedVehicleForCharge] = useState('');
  const [selectedPortForBooking, setSelectedPortForBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [chargeBookingForm, setChargeBookingForm] = useState({
    scheduledStartTime: '',
    durationMinutes: '60',
  });

  // ── Form states ─────────────────────────────────────────────────
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    vehicleType: 'car',
    batteryCapacityKwh: '',
    manufacturingYear: new Date().getFullYear().toString(),
    odometer: '0',
    connectorType: 'ccs_2',
    vehicleStatus: 'ACTIVE',
    fleetUnitNumber: '',
    fleetName: 'EcoVolt Fleet',
    chargingPriority: 'medium',
  });

  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpirationDate: '',
    assignedFleetVehicleId: '',
  });

  const [assignForm, setAssignForm] = useState({ fleetVehicleId: '', driverId: '' });

  const [complaintForm, setComplaintForm] = useState({
    fleetVehicleId: '',
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    fleetVehicleId: '',
    complaintId: '',
    mechanic: '',
    workshop: '',
    maintenanceDate: '',
    estimatedCost: '',
    description: '',
  });

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fleetService.getFleetDashboard();
      const data = res.data || {};
      setFleetVehicles(data.fleetVehicles || []);
      setDrivers(data.drivers || []);
      setComplaints(data.complaints || []);
      setMaintenanceSchedules(data.schedules || []);
      setAnalytics(data.analytics || null);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Sync Error',
        message: err.message || 'Could not fetch fleet data from Supabase.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const notify = (type, title, message) => setNotification({ type, title, message });

  // Derived
  const hasVehicles = fleetVehicles.length > 0;
  const unassignedDrivers = drivers.filter(d => !d.assignedFleetVehicle);
  const openComplaints = complaints.filter(c => c.status === 'OPEN');

  // ─── Handler: Load Fleet Charging Data ────────────────────────────────────
  const loadFleetChargingData = useCallback(async () => {
    setIsLoadingChargeData(true);
    try {
      const [bookRes, histRes] = await Promise.all([
        fleetService.getFleetBookings(),
        fleetService.getFleetChargingHistory(),
      ]);
      setFleetBookings(bookRes.data?.bookings || []);
      setChargingHistory(histRes.data?.sessions || []);
    } catch (_err) {
      // silent — charging data is supplementary
    } finally {
      setIsLoadingChargeData(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'charging') loadFleetChargingData();
  }, [activeTab, loadFleetChargingData]);

  // ─── Handler: Get Location & Nearby Ports ────────────────────────────────
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setNearbyPorts([]);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setIsLoadingPorts(true);
          const res = await fleetService.getNearbyPorts({ lat: latitude, lng: longitude });
          setNearbyPorts(res.data?.ports || []);
          if ((res.data?.ports || []).length === 0) {
            setLocationError('No approved charging stations are currently available in any location. Ask a station owner to get their station approved by admin.');
          }
        } catch (err) {
          notify('error', 'Error', err.response?.data?.message || 'Could not fetch nearby ports.');
        } finally {
          setIsLoadingPorts(false);
          setIsLocating(false);
        }
      },
      () => {
        setLocationError('Location access denied. Please enable location access in your browser settings and try again.');
        setIsLocating(false);
      },
    );
  };

  // ─── Handler: Book Charging Slot ─────────────────────────────────────────
  const handleBookCharging = async (e) => {
    e.preventDefault();
    if (!selectedVehicleForCharge || !selectedPortForBooking) return;
    setIsSubmitting(true);
    try {
      const res = await fleetService.createFleetBooking({
        fleetVehicleId: selectedVehicleForCharge,
        chargingPortId: selectedPortForBooking.id,
        scheduledStartTime: chargeBookingForm.scheduledStartTime,
        durationMinutes: parseInt(chargeBookingForm.durationMinutes, 10),
      });
      setShowBookingModal(false);
      setSelectedPortForBooking(null);
      setChargeBookingForm({ scheduledStartTime: '', durationMinutes: '60' });
      notify(
        'success',
        '⚡ Booking Submitted!',
        `Booking ${res.data.booking.bookingReference} is pending station owner approval.`,
      );
      loadFleetChargingData();
      loadAll(); // refresh dashboard stats
    } catch (err) {
      notify('error', 'Booking Failed', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handler: Add Fleet Vehicle ────────────────────────────────────────────
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fleetService.registerFleetVehicle(vehicleForm);
      setFleetVehicles(prev => [res.data.fleetVehicle, ...prev]);
      setShowAddVehicle(false);
      setVehicleForm({
        registrationNumber: '', make: '', model: '', vehicleType: 'car',
        batteryCapacityKwh: '', manufacturingYear: new Date().getFullYear().toString(),
        odometer: '0', connectorType: 'ccs_2', vehicleStatus: 'ACTIVE',
        fleetUnitNumber: '', fleetName: 'EcoVolt Fleet', chargingPriority: 'medium',
      });
      notify('success', '🚗 Vehicle Registered!', `${res.data.fleetVehicle.registrationNumber} saved in Supabase DB.`);
      loadAll();
    } catch (err) {
      notify('error', 'Registration Failed', err.message || 'Could not register fleet vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handler: Add Driver ───────────────────────────────────────────────────
  const handleAddDriver = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fleetService.createDriver(driverForm);
      setDrivers(prev => [res.data.driver, ...prev]);
      setShowAddDriver(false);
      setDriverForm({ name: '', email: '', phone: '', licenseNumber: '', licenseExpirationDate: '', assignedFleetVehicleId: '' });
      notify('success', '👤 Driver Registered!', `${res.data.driver.user?.name || driverForm.name} added. Default password: EcoVolt@Driver123`);
      loadAll();
    } catch (err) {
      notify('error', 'Driver Registration Failed', err.message || 'Could not register driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handler: Assign Driver ───────────────────────────────────────────────
  const handleAssignDriver = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fleetService.assignDriver(assignForm);
      setShowAssignDriver(false);
      setAssignForm({ fleetVehicleId: '', driverId: '' });
      notify('success', '🔗 Driver Assigned!', 'Driver linked to vehicle in Supabase DB.');
      loadAll();
    } catch (err) {
      notify('error', 'Assignment Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handler: Raise Complaint ─────────────────────────────────────────────
  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fleetService.createComplaint(complaintForm);
      setComplaints(prev => [res.data.complaint, ...prev]);
      setShowRaiseComplaint(false);
      setComplaintForm({ fleetVehicleId: '', title: '', description: '', category: 'OTHER', priority: 'MEDIUM' });
      notify('success', '📋 Complaint Submitted!', 'Fleet manager notified. Complaint logged in Supabase.');
      loadAll();
    } catch (err) {
      notify('error', 'Complaint Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handler: Schedule Maintenance ────────────────────────────────────────
  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fleetService.scheduleMaintenance(maintenanceForm);
      setMaintenanceSchedules(prev => [res.data.schedule, ...prev]);
      setShowScheduleMaintenance(false);
      setSelectedComplaint(null);
      setMaintenanceForm({ fleetVehicleId: '', complaintId: '', mechanic: '', workshop: '', maintenanceDate: '', estimatedCost: '', description: '' });
      notify('success', '🔧 Maintenance Scheduled!', 'Vehicle status set to IN_MAINTENANCE. Driver notified.');
      loadAll();
    } catch (err) {
      notify('error', 'Scheduling Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handler: Complete Maintenance ────────────────────────────────────────
  const handleCompleteMaintenace = async (status) => {
    if (!selectedMaintenance) return;
    setIsSubmitting(true);
    try {
      await fleetService.updateMaintenanceStatus(selectedMaintenance.id, { status });
      setShowMaintenanceComplete(false);
      setSelectedMaintenance(null);
      notify('success', '✅ Maintenance Updated!', `Status set to ${status}. Vehicle status updated.`);
      loadAll();
    } catch (err) {
      notify('error', 'Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open schedule-maintenance modal pre-filled from complaint
  const openMaintenanceFromComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setMaintenanceForm({
      fleetVehicleId: complaint.fleetVehicle?.id || '',
      complaintId:    complaint.id,
      mechanic:       '',
      workshop:       '',
      maintenanceDate: '',
      estimatedCost:  '',
      description:    `Maintenance for: ${complaint.title}`,
    });
    setShowScheduleMaintenance(true);
  };

  // ─── Table Column Definitions ──────────────────────────────────────────────

  const vehicleColumns = [
    {
      key: 'reg', title: 'Reg. Number',
      render: (row) => <span className="font-mono text-secondary-400 font-bold">{row.registrationNumber}</span>,
    },
    { key: 'make', title: 'Make & Model', render: (row) => `${row.make} ${row.model}` },
    { key: 'year', title: 'Year', render: (row) => row.manufacturingYear },
    {
      key: 'battery', title: 'Battery',
      render: (row) => `${row.batteryCapacityKwh} kWh`,
    },
    {
      key: 'driver', title: 'Assigned Driver',
      render: (row) => row.assignedDriver
        ? <span className="text-emerald-400 font-medium">{row.assignedDriver.user?.name || 'Assigned'}</span>
        : <span className="text-surface-500 italic text-xs">Unassigned</span>,
    },
    {
      key: 'status', title: 'Status',
      render: (row) => {
        const s = STATUS_BADGE[row.vehicleStatus] || { variant: 'info', label: row.vehicleStatus };
        return <Badge variant={s.variant} dot>{s.label}</Badge>;
      },
    },
    {
      key: 'complaints', title: 'Open Complaints',
      render: (row) => {
        const count = row.complaints?.length || 0;
        return count > 0
          ? <Badge variant="danger">{count} Open</Badge>
          : <span className="text-slate-400 text-xs">None</span>;
      },
    },
    {
      key: 'actions', title: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedVehicleForCharge(row.id);
            setActiveTab('charging');
            setChargingSubTab('find');
          }}
        >
          ⚡ Charge Vehicle
        </Button>
      ),
    },
  ];

  const driverColumns = [
    { key: 'name', title: 'Driver Name', render: (row) => row.user?.name || '—' },
    { key: 'email', title: 'Email', render: (row) => <span className="text-slate-500 text-xs">{row.user?.email}</span> },
    { key: 'license', title: 'License #', render: (row) => <span className="font-mono text-emerald-800 font-bold">{row.licenseNumber}</span> },
    {
      key: 'expiry', title: 'License Expiry',
      render: (row) => {
        const d = new Date(row.licenseExpirationDate);
        const isExpired = d < new Date();
        return <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}>{d.toLocaleDateString()}</span>;
      },
    },
    {
      key: 'vehicle', title: 'Assigned Vehicle',
      render: (row) => row.assignedFleetVehicle
        ? <span className="font-mono text-emerald-800 font-bold">{row.assignedFleetVehicle.registrationNumber}</span>
        : <span className="text-slate-400 italic text-xs">Unassigned</span>,
    },
    {
      key: 'status', title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'on_duty' ? 'success' : row.status === 'off_duty' ? 'danger' : 'info'} dot>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  const complaintColumns = [
    { key: 'vehicle', title: 'Vehicle', render: (row) => <span className="font-mono text-emerald-800 font-bold">{row.fleetVehicle?.registrationNumber}</span> },
    { key: 'driver', title: 'Driver', render: (row) => row.driver?.user?.name || '—' },
    { key: 'title', title: 'Complaint', render: (row) => <span className="font-medium text-slate-900">{row.title}</span> },
    { key: 'category', title: 'Category', render: (row) => row.category },
    {
      key: 'priority', title: 'Priority',
      render: (row) => {
        const p = PRIORITY_BADGE[row.priority] || { variant: 'info', label: row.priority };
        return <Badge variant={p.variant} size="sm">{p.label}</Badge>;
      },
    },
    {
      key: 'status', title: 'Status',
      render: (row) => {
        const s = COMPLAINT_STATUS_BADGE[row.status] || { variant: 'info', label: row.status };
        return <Badge variant={s.variant} dot>{s.label}</Badge>;
      },
    },
    {
      key: 'date', title: 'Reported',
      render: (row) => new Date(row.reportedAt).toLocaleDateString(),
    },
    {
      key: 'action', title: 'Action',
      render: (row) => row.status === 'OPEN' ? (
        <Button variant="warning" size="sm" onClick={() => openMaintenanceFromComplaint(row)}>
          🔧 Schedule Maintenance
        </Button>
      ) : (
        <span className="text-slate-400 text-xs">{row.maintenanceSchedule ? 'Maintenance Scheduled' : '—'}</span>
      ),
    },
  ];

  const maintenanceColumns = [
    { key: 'vehicle', title: 'Vehicle', render: (row) => <span className="font-mono text-emerald-800 font-bold">{row.fleetVehicle?.registrationNumber}</span> },
    { key: 'complaint', title: 'Complaint', render: (row) => row.complaint?.title || <span className="italic text-slate-400 text-xs">Direct Schedule</span> },
    { key: 'mechanic', title: 'Mechanic', render: (row) => row.mechanic },
    { key: 'workshop', title: 'Workshop', render: (row) => row.workshop },
    { key: 'date', title: 'Scheduled Date', render: (row) => new Date(row.maintenanceDate).toLocaleDateString() },
    { key: 'cost', title: 'Est. Cost', render: (row) => `$${row.estimatedCost}` },
    {
      key: 'status', title: 'Status',
      render: (row) => {
        const s = MAINTENANCE_STATUS_BADGE[row.status] || { variant: 'info', label: row.status };
        return <Badge variant={s.variant} dot>{s.label}</Badge>;
      },
    },
    {
      key: 'action', title: 'Action',
      render: (row) => ['SCHEDULED', 'IN_PROGRESS'].includes(row.status) ? (
        <Button
          variant="success"
          size="sm"
          onClick={() => { setSelectedMaintenance(row); setShowMaintenanceComplete(true); }}
        >
          Mark Complete
        </Button>
      ) : null,
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  const vehicleFirstBanner = !hasVehicles && (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
      <span className="text-2xl">⚠️</span>
      <span>
        <strong>No fleet vehicles registered yet.</strong> Please add a vehicle first.
        Add Driver, Maintenance scheduling, and Fleet Assignment are disabled until at least one vehicle exists.
      </span>
    </div>
  );

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
          duration={6000}
        />
      )}

      {/* ── Top Banner ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-2xs shrink-0">
            🚗
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Fleet Management
              </h1>
              <Badge variant="primary" dot pulse>Live Supabase DB</Badge>
            </div>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Manager: <span className="text-slate-900 font-semibold">{user?.name || 'Fleet Manager'}</span> •{' '}
              {fleetVehicles.length} Vehicles • {drivers.length} Drivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="md"
            disabled={!hasVehicles}
            title={!hasVehicles ? 'Add a vehicle first' : 'Register Driver'}
            onClick={() => setShowAddDriver(true)}
          >
            👤 Add Driver
          </Button>
          <Button
            variant="outline"
            size="md"
            disabled={!hasVehicles}
            title={!hasVehicles ? 'Add a vehicle first' : 'Raise Complaint'}
            onClick={() => setShowRaiseComplaint(true)}
          >
            📋 Raise Complaint
          </Button>
          <Button
            variant="secondary"
            size="md"
            disabled={!hasVehicles}
            title={!hasVehicles ? 'Add a vehicle first' : 'Schedule Maintenance'}
            onClick={() => {
              setMaintenanceForm({ fleetVehicleId: fleetVehicles[0]?.id || '', complaintId: '', mechanic: '', workshop: '', maintenanceDate: '', estimatedCost: '', description: '' });
              setShowScheduleMaintenance(true);
            }}
          >
            🔧 Schedule Maintenance
          </Button>
          <Button variant="primary" size="md" onClick={() => setShowAddVehicle(true)}>
            + Add Fleet Vehicle
          </Button>
        </div>
      </div>

      {/* Vehicle-first Banner */}
      {vehicleFirstBanner}

      {/* ── KPI Analytics Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Fleet"
          value={`${analytics?.totalFleet ?? fleetVehicles.length}`}
          change="All registered vehicles"
          changeType="increase"
          periodText="in your fleet"
          badgeText="Fleet"
          badgeVariant="primary"
          icon={<span className="text-xl">🚗</span>}
        />
        <StatCard
          title="Available"
          value={`${analytics?.activeCount ?? 0}`}
          change="ACTIVE vehicles"
          changeType="increase"
          periodText="ready to operate"
          badgeText="Active"
          badgeVariant="success"
          icon={<span className="text-xl">✅</span>}
        />
        <StatCard
          title="Charging"
          value={`${analytics?.chargingCount ?? 0}`}
          change="CHARGING now"
          changeType="neutral"
          periodText="at EV stations"
          badgeText="Charging"
          badgeVariant="info"
          icon={<span className="text-xl">⚡</span>}
        />
        <StatCard
          title="In Maintenance"
          value={`${analytics?.maintenanceCount ?? 0}`}
          change="IN_MAINTENANCE"
          changeType="decrease"
          periodText="at workshops"
          badgeText="Maintenance"
          badgeVariant="warning"
          icon={<span className="text-xl">🔧</span>}
        />
        <StatCard
          title="Assigned Drivers"
          value={`${analytics?.assignedDriversCount ?? 0}`}
          change="Driver assignments"
          changeType="increase"
          periodText="vehicle–driver pairs"
          badgeText="Drivers"
          badgeVariant="primary"
          icon={<span className="text-xl">👤</span>}
        />
        <StatCard
          title="Open Complaints"
          value={`${analytics?.pendingComplaintsCount ?? openComplaints.length}`}
          change="Requires review"
          changeType="decrease"
          periodText="pending complaints"
          badgeText="Complaints"
          badgeVariant="danger"
          icon={<span className="text-xl">📋</span>}
        />
        <StatCard
          title="Maintenance Cost"
          value={`$${(analytics?.totalMaintenanceCost ?? 0).toLocaleString()}`}
          change="Total service cost"
          changeType="neutral"
          periodText="scheduled maintenance"
          badgeText="Est. Cost"
          badgeVariant="warning"
          icon={<span className="text-xl">💰</span>}
        />
        <StatCard
          title="Inactive Vehicles"
          value={`${analytics?.inactiveCount ?? 0}`}
          change="INACTIVE status"
          changeType="decrease"
          periodText="not operational"
          badgeText="Inactive"
          badgeVariant="danger"
          icon={<span className="text-xl">🚫</span>}
        />
        <StatCard
          title="Pending Charging"
          value={`${analytics?.pendingChargingCount ?? 0}`}
          change="Awaiting approval"
          changeType="neutral"
          periodText="charging requests"
          badgeText="Charging"
          badgeVariant="warning"
          icon={<span className="text-xl">⏳</span>}
        />
        <StatCard
          title="Sessions Done"
          value={`${analytics?.completedChargingCount ?? 0}`}
          change="Fleet sessions"
          changeType="increase"
          periodText="completed sessions"
          badgeText="History"
          badgeVariant="success"
          icon={<span className="text-xl">✅</span>}
        />
        <StatCard
          title="Charging Spend"
          value={`$${(analytics?.totalChargingCost ?? 0).toFixed(2)}`}
          change="Total charging cost"
          changeType="neutral"
          periodText="all fleet sessions"
          badgeText="Cost"
          badgeVariant="info"
          icon={<span className="text-xl">⚡</span>}
        />
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'fleet',       label: `🚗 Fleet Vehicles (${fleetVehicles.length})` },
          { id: 'drivers',     label: `👤 Drivers (${drivers.length})` },
          { id: 'complaints',  label: `📋 Complaints (${complaints.length})`, badge: openComplaints.length > 0 ? openComplaints.length : null },
          { id: 'maintenance', label: `🔧 Maintenance (${maintenanceSchedules.length})` },
          { id: 'charging',    label: `⚡ Charging`, badge: (analytics?.pendingChargingCount ?? 0) > 0 ? analytics.pendingChargingCount : null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>


      {/* ── TAB 1: Fleet Vehicles ────────────────────────────────────────── */}
      {activeTab === 'fleet' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Registered Fleet Vehicles</h2>
            <Badge variant="primary">Fleet Inventory</Badge>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-surface-400 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading fleet from Supabase...</span>
            </div>
          ) : fleetVehicles.length === 0 ? (
            <EmptyState
              icon="🚗"
              title="No fleet vehicles registered yet."
              subtitle="Add your first commercial EV vehicle to get started. Driver management and maintenance scheduling will be enabled after you register a vehicle."
              action={
                <Button variant="primary" onClick={() => setShowAddVehicle(true)}>
                  + Add Fleet Vehicle
                </Button>
              }
            />
          ) : (
            <Table columns={vehicleColumns} data={fleetVehicles} emptyMessage="No fleet vehicles found." />
          )}
        </section>
      )}

      {/* ── TAB 2: Drivers ───────────────────────────────────────────────── */}
      {activeTab === 'drivers' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Driver Roster</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasVehicles || unassignedDrivers.length === 0}
                onClick={() => setShowAssignDriver(true)}
              >
                🔗 Assign Driver to Vehicle
              </Button>
              <Badge variant="success">Drivers</Badge>
            </div>
          </div>
          {!hasVehicles ? (
            <EmptyState
              icon="⚠️"
              title="No fleet vehicles registered."
              subtitle="You must register at least one fleet vehicle before adding drivers."
              action={<Button variant="primary" onClick={() => { setActiveTab('fleet'); setShowAddVehicle(true); }}>+ Add Fleet Vehicle First</Button>}
            />
          ) : drivers.length === 0 ? (
            <EmptyState
              icon="👤"
              title="No drivers registered."
              subtitle="Add your first driver. They will be assigned to a fleet vehicle and can raise complaints."
              action={<Button variant="primary" onClick={() => setShowAddDriver(true)}>+ Register Driver</Button>}
            />
          ) : (
            <Table columns={driverColumns} data={drivers} emptyMessage="No drivers found." />
          )}
        </section>
      )}

      {/* ── TAB 3: Complaints ────────────────────────────────────────────── */}
      {activeTab === 'complaints' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Vehicle Complaints</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasVehicles}
                onClick={() => setShowRaiseComplaint(true)}
              >
                📋 Raise Complaint
              </Button>
              {openComplaints.length > 0 && <Badge variant="danger" pulse>{openComplaints.length} Open</Badge>}
            </div>
          </div>
          {complaints.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No complaints filed."
              subtitle="When a driver raises a complaint about their vehicle, it will appear here for your review."
            />
          ) : (
            <Table columns={complaintColumns} data={complaints} emptyMessage="No complaints found." />
          )}
        </section>
      )}

      {/* ── TAB 4: Maintenance ───────────────────────────────────────────── */}
      {activeTab === 'maintenance' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Maintenance Schedules</h2>
            <Badge variant="warning">Service Records</Badge>
          </div>
          {maintenanceSchedules.length === 0 ? (
            <EmptyState
              icon="🔧"
              title="No maintenance scheduled."
              subtitle="Schedule maintenance from a complaint or create one directly using the 'Schedule Maintenance' button."
            />
          ) : (
            <Table columns={maintenanceColumns} data={maintenanceSchedules} emptyMessage="No maintenance schedules found." />
          )}
        </section>
      )}

      {/* ── TAB 5: Charging ───────────────────────────────────────────────── */}
      {activeTab === 'charging' && (
        <section className="space-y-5">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-surface-700/50 pb-2">
            {[
              { id: 'find',     label: '🔍 Find & Book' },
              { id: 'requests', label: `📋 Booking Requests (${fleetBookings.length})` },
              { id: 'history',  label: `📊 Charging History (${chargingHistory.length})` },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setChargeSubTab(st.id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  chargeSubTab === st.id
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* ─ Sub-tab: Find & Book ─────────────────────────────────────── */}
          {chargeSubTab === 'find' && (
            <div className="space-y-5">
              {!hasVehicles ? (
                <EmptyState
                  icon="🚗"
                  title="No fleet vehicles registered."
                  subtitle="Register at least one fleet vehicle to start booking charging slots."
                  action={<Button variant="primary" onClick={() => setActiveTab('fleet')}>Go to Fleet Vehicles</Button>}
                />
              ) : (
                <>
                  {/* Vehicle selector + location button */}
                  <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1">
                      <Select
                        label="Select Fleet Vehicle"
                        value={selectedVehicleForCharge}
                        onChange={e => setSelectedVehicleForCharge(e.target.value)}
                        placeholder="Choose a vehicle..."
                        options={fleetVehicles.map(v => ({
                          value: v.id,
                          label: `${v.registrationNumber} — ${v.make} ${v.model}`,
                        }))}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleGetLocation}
                      disabled={!selectedVehicleForCharge || isLocating || isLoadingPorts}
                    >
                      {isLocating ? '📍 Locating...' : isLoadingPorts ? '⏳ Loading...' : '📍 Find Nearby Chargers'}
                    </Button>
                  </div>

                  {/* Location error */}
                  {locationError && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <span className="text-red-400 text-xl mt-0.5">⚠️</span>
                      <div className="flex-1">
                        <p className="text-red-300 text-sm">{locationError}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleGetLocation}>Retry</Button>
                    </div>
                  )}

                  {/* Loading spinner */}
                  {isLoadingPorts && (
                    <div className="flex items-center justify-center gap-3 py-12 text-surface-400">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching nearby charging stations...</span>
                    </div>
                  )}

                  {/* Ports grid */}
                  {!isLoadingPorts && nearbyPorts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {nearbyPorts.map(port => (
                        <div
                          key={port.id}
                          className="bg-surface-800 border border-surface-700 rounded-2xl p-5 space-y-3 hover:border-primary-500/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-white text-sm leading-tight">{port.stationName}</p>
                              <p className="text-xs text-surface-400 mt-0.5 font-mono">{port.portIdentifier}</p>
                            </div>
                            <Badge
                              variant={port.status === 'available' ? 'success' : port.status === 'occupied' ? 'danger' : 'warning'}
                              dot
                            >
                              {port.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>
                              <span className="text-surface-500">Connector</span>
                              <p className="text-white font-medium capitalize">{port.connectorType?.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                              <span className="text-surface-500">Power</span>
                              <p className="text-white font-medium">{port.maxPowerOutputKw} kW</p>
                            </div>
                            <div>
                              <span className="text-surface-500">Rate</span>
                              <p className="text-primary-400 font-bold">${port.pricingRatePerKwh}/kWh</p>
                            </div>
                            {port.distanceKm !== null && port.distanceKm !== undefined && (
                              <div>
                                <span className="text-surface-500">Distance</span>
                                <p className="text-white font-medium">{port.distanceKm} km</p>
                              </div>
                            )}
                          </div>

                          {port.locationAddress && (
                            <p className="text-xs text-surface-500 truncate">📍 {port.locationAddress}{port.locationCity ? `, ${port.locationCity}` : ''}</p>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            disabled={port.status === 'occupied'}
                            onClick={() => {
                              setSelectedPortForBooking(port);
                              setShowBookingModal(true);
                            }}
                          >
                            {port.status === 'occupied' ? '🔴 Port Busy' : '⚡ Book Charging Slot'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty — no ports loaded yet */}
                  {!isLoadingPorts && nearbyPorts.length === 0 && !locationError && (
                    <div className="py-16 text-center border border-surface-700 rounded-2xl bg-surface-800">
                      <div className="text-5xl mb-4">📍</div>
                      <h3 className="text-lg font-bold text-white mb-1">Find Charging Stations</h3>
                      <p className="text-surface-400 text-sm max-w-sm mx-auto">
                        Select a fleet vehicle and click <strong>"Find Nearby Chargers"</strong> to discover approved charging stations near your location.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─ Sub-tab: Booking Requests ─────────────────────────────────── */}
          {chargeSubTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Fleet Charging Bookings</h3>
                <Button variant="outline" size="sm" onClick={loadFleetChargingData} disabled={isLoadingChargeData}>
                  {isLoadingChargeData ? '⏳ Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>
              {isLoadingChargeData ? (
                <div className="flex items-center justify-center gap-3 py-12 text-surface-400">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading bookings...</span>
                </div>
              ) : fleetBookings.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No charging requests yet."
                  subtitle="Book a charging slot for your fleet vehicle from the 'Find & Book' tab. Bookings pending station owner approval will appear here."
                />
              ) : (
                <Table
                  columns={[
                    { key: 'ref',     title: 'Booking Ref',  render: r => <span className="font-mono text-primary-400 font-bold text-xs">{r.bookingReference}</span> },
                    { key: 'vehicle', title: 'Vehicle',      render: r => <span className="font-mono text-secondary-400 text-xs">{r.fleetVehicle?.registrationNumber || '—'}</span> },
                    { key: 'station', title: 'Station',      render: r => <span className="text-xs">{r.chargingPort?.stationName || '—'}</span> },
                    { key: 'port',    title: 'Port',         render: r => <span className="text-xs font-mono text-surface-400">{r.chargingPort?.portIdentifier || '—'}</span> },
                    { key: 'time',    title: 'Scheduled',    render: r => <span className="text-xs">{new Date(r.scheduledStartTime).toLocaleString()}</span> },
                    { key: 'dur',     title: 'Duration',     render: r => <span className="text-xs">{r.durationMinutes} min</span> },
                    { key: 'cost',    title: 'Est. Cost',    render: r => <span className="text-xs text-primary-300">${r.estimatedCost?.toFixed(2)}</span> },
                    { key: 'status',  title: 'Status',       render: r => { const s = BOOKING_STATUS_BADGE[r.status] || { variant: 'info', label: r.status }; return <Badge variant={s.variant} dot>{s.label}</Badge>; } },
                  ]}
                  data={fleetBookings}
                  emptyMessage="No booking requests found."
                />
              )}
            </div>
          )}

          {/* ─ Sub-tab: Charging History ─────────────────────────────────── */}
          {chargeSubTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Fleet Charging Session History</h3>
                <Badge variant="success">Completed Sessions</Badge>
              </div>
              {isLoadingChargeData ? (
                <div className="flex items-center justify-center gap-3 py-12 text-surface-400">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading history...</span>
                </div>
              ) : chargingHistory.length === 0 ? (
                <EmptyState
                  icon="📊"
                  title="No charging history yet."
                  subtitle="When a station owner starts a charging session for one of your fleet vehicles, the session details and cost will appear here."
                />
              ) : (
                <Table
                  columns={[
                    { key: 'vehicle', title: 'Reg. No.',     render: r => <span className="font-mono text-secondary-400 text-xs">{r.fleetVehicle?.registrationNumber || '—'}</span> },
                    { key: 'make',    title: 'Vehicle',      render: r => <span className="text-xs">{r.fleetVehicle ? `${r.fleetVehicle.make} ${r.fleetVehicle.model}` : '—'}</span> },
                    { key: 'station', title: 'Station',      render: r => <span className="text-xs">{r.chargingPort?.stationName || '—'}</span> },
                    { key: 'start',   title: 'Start',        render: r => <span className="text-xs">{new Date(r.startTime).toLocaleString()}</span> },
                    { key: 'end',     title: 'End',          render: r => r.endTime ? <span className="text-xs">{new Date(r.endTime).toLocaleString()}</span> : <span className="text-xs text-blue-400">Active</span> },
                    { key: 'energy',  title: 'Energy',       render: r => <span className="text-xs">{r.energyConsumedKwh} kWh</span> },
                    { key: 'cost',    title: 'Cost',         render: r => <span className="text-xs text-primary-300 font-bold">${r.cost?.toFixed(2)}</span> },
                    { key: 'status',  title: 'Status',       render: r => { const s = SESSION_STATUS_BADGE[r.status] || { variant: 'info', label: r.status }; return <Badge variant={s.variant} dot>{s.label}</Badge>; } },
                  ]}
                  data={chargingHistory}
                  emptyMessage="No charging history found."
                />
              )}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* MODAL 0: Fleet Charging Booking ────────────────────────────────── */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => { setShowBookingModal(false); setSelectedPortForBooking(null); }}
        title="⚡ Book Charging Slot"
        subtitle="Reserve a charging slot for your fleet vehicle. The station owner must approve before the session starts."
      >
        <form onSubmit={handleBookCharging} className="space-y-4 py-2">
          {/* Fleet vehicle info */}
          <div className="p-3 bg-surface-700/50 border border-surface-600 rounded-xl space-y-0.5">
            <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">Fleet Vehicle</p>
            <p className="text-white font-semibold text-sm">
              {(() => {
                const v = fleetVehicles.find(v => v.id === selectedVehicleForCharge);
                return v ? `${v.registrationNumber} — ${v.make} ${v.model}` : '—';
              })()}
            </p>
          </div>

          {/* Port info */}
          {selectedPortForBooking && (
            <div className="p-3 bg-surface-700/50 border border-surface-600 rounded-xl space-y-1">
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">Charging Station</p>
              <p className="text-white font-semibold text-sm">{selectedPortForBooking.stationName}</p>
              <div className="flex items-center gap-3 text-xs text-surface-400">
                <span className="font-mono">{selectedPortForBooking.portIdentifier}</span>
                <span>•</span>
                <span>{selectedPortForBooking.connectorType?.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span className="text-primary-400 font-bold">${selectedPortForBooking.pricingRatePerKwh}/kWh</span>
              </div>
            </div>
          )}

          <Input
            label="Scheduled Start Time *"
            type="datetime-local"
            required
            value={chargeBookingForm.scheduledStartTime}
            onChange={e => setChargeBookingForm({ ...chargeBookingForm, scheduledStartTime: e.target.value })}
            min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
          />

          <Select
            label="Charging Duration"
            value={chargeBookingForm.durationMinutes}
            onChange={e => setChargeBookingForm({ ...chargeBookingForm, durationMinutes: e.target.value })}
            options={CHARGE_DURATION_OPTIONS}
          />

          {/* Estimated cost preview */}
          {selectedPortForBooking && chargeBookingForm.durationMinutes && (
            <div className="p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl flex items-center justify-between">
              <span className="text-surface-400 text-xs">Estimated Cost</span>
              <span className="text-primary-300 font-bold text-sm">
                ${(selectedPortForBooking.maxPowerOutputKw * (parseInt(chargeBookingForm.durationMinutes) / 60) * 0.8 * selectedPortForBooking.pricingRatePerKwh).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button
              variant="secondary"
              type="button"
              onClick={() => { setShowBookingModal(false); setSelectedPortForBooking(null); }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting || !chargeBookingForm.scheduledStartTime}>
              {isSubmitting ? '⏳ Booking...' : '⚡ Submit Booking Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 1: Add Fleet Vehicle ──────────────────────────────────────── */}

      <Modal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        title="Register Fleet Vehicle"
        subtitle="Add a commercial EV to your fleet. All details stored inline."
      >
        <form onSubmit={handleAddVehicle} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vehicle Registration Number *"
              required
              placeholder="e.g. TN-01-AB-1234"
              value={vehicleForm.registrationNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
            />
            <Input
              label="Fleet Unit Number"
              placeholder="e.g. UNIT-101"
              value={vehicleForm.fleetUnitNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, fleetUnitNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vehicle Brand / Make *"
              required
              placeholder="e.g. TATA, BYD, Tesla"
              value={vehicleForm.make}
              onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
            />
            <Input
              label="Vehicle Model *"
              required
              placeholder="e.g. Nexon EV, Atto 3"
              value={vehicleForm.model}
              onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Vehicle Type"
              value={vehicleForm.vehicleType}
              onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
              options={VEHICLE_TYPE_OPTIONS}
            />
            <Input
              label="Battery Capacity (kWh) *"
              type="number"
              required
              min="10"
              max="1000"
              placeholder="e.g. 60"
              value={vehicleForm.batteryCapacityKwh}
              onChange={(e) => setVehicleForm({ ...vehicleForm, batteryCapacityKwh: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturing Year"
              type="number"
              min="2000"
              max={new Date().getFullYear() + 1}
              placeholder={new Date().getFullYear()}
              value={vehicleForm.manufacturingYear}
              onChange={(e) => setVehicleForm({ ...vehicleForm, manufacturingYear: e.target.value })}
            />
            <Input
              label="Current Odometer (km)"
              type="number"
              min="0"
              placeholder="e.g. 0"
              value={vehicleForm.odometer}
              onChange={(e) => setVehicleForm({ ...vehicleForm, odometer: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Connector Type"
              value={vehicleForm.connectorType}
              onChange={(e) => setVehicleForm({ ...vehicleForm, connectorType: e.target.value })}
              options={CONNECTOR_OPTIONS}
            />
            <Select
              label="Initial Status"
              value={vehicleForm.vehicleStatus}
              onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleStatus: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setShowAddVehicle(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add Driver ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showAddDriver}
        onClose={() => setShowAddDriver(false)}
        title="Register Fleet Driver"
        subtitle="Creates a user account for the driver. Default login: EcoVolt@Driver123"
      >
        <form onSubmit={handleAddDriver} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              required
              placeholder="e.g. Ravi Kumar"
              value={driverForm.name}
              onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={driverForm.phone}
              onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
            />
          </div>
          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="e.g. ravi@fleet.com"
            value={driverForm.email}
            onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Driving License Number *"
              required
              placeholder="e.g. TN1420230012345"
              value={driverForm.licenseNumber}
              onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
            />
            <Input
              label="License Expiry Date *"
              type="date"
              required
              value={driverForm.licenseExpirationDate}
              onChange={(e) => setDriverForm({ ...driverForm, licenseExpirationDate: e.target.value })}
            />
          </div>
          <Select
            label="Assign to Vehicle (optional)"
            value={driverForm.assignedFleetVehicleId}
            onChange={(e) => setDriverForm({ ...driverForm, assignedFleetVehicleId: e.target.value })}
            options={[
              { value: '', label: 'Assign Later' },
              ...fleetVehicles
                .filter(fv => !fv.assignedDriverId)
                .map(fv => ({ value: fv.id, label: `${fv.registrationNumber} — ${fv.make} ${fv.model}` })),
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setShowAddDriver(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Driver'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Assign Driver ──────────────────────────────────────────── */}
      <Modal
        isOpen={showAssignDriver}
        onClose={() => setShowAssignDriver(false)}
        title="Assign Driver to Vehicle"
        subtitle="One vehicle can have only one active driver."
      >
        <form onSubmit={handleAssignDriver} className="space-y-4 py-2">
          <Select
            label="Select Fleet Vehicle *"
            required
            value={assignForm.fleetVehicleId}
            onChange={(e) => setAssignForm({ ...assignForm, fleetVehicleId: e.target.value })}
            options={[
              { value: '', label: '— Select Vehicle —' },
              ...fleetVehicles
                .filter(fv => !fv.assignedDriverId)
                .map(fv => ({ value: fv.id, label: `${fv.registrationNumber} — ${fv.make} ${fv.model}` })),
            ]}
          />
          <Select
            label="Select Driver *"
            required
            value={assignForm.driverId}
            onChange={(e) => setAssignForm({ ...assignForm, driverId: e.target.value })}
            options={[
              { value: '', label: '— Select Driver —' },
              ...unassignedDrivers.map(d => ({ value: d.id, label: `${d.user?.name} (${d.licenseNumber})` })),
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setShowAssignDriver(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting || !assignForm.fleetVehicleId || !assignForm.driverId}>
              {isSubmitting ? 'Assigning...' : 'Assign Driver'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Raise Complaint ────────────────────────────────────────── */}
      <Modal
        isOpen={showRaiseComplaint}
        onClose={() => setShowRaiseComplaint(false)}
        title="Raise Vehicle Complaint"
        subtitle="Submit a complaint about your assigned vehicle. Fleet manager will be notified."
      >
        <form onSubmit={handleRaiseComplaint} className="space-y-4 py-2">
          <Select
            label="Select Vehicle *"
            required
            value={complaintForm.fleetVehicleId}
            onChange={(e) => setComplaintForm({ ...complaintForm, fleetVehicleId: e.target.value })}
            options={[
              { value: '', label: '— Select Vehicle —' },
              ...fleetVehicles.map(fv => ({ value: fv.id, label: `${fv.registrationNumber} — ${fv.make} ${fv.model}` })),
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={complaintForm.category}
              onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
              options={COMPLAINT_CATEGORIES}
            />
            <Select
              label="Priority"
              value={complaintForm.priority}
              onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
              options={PRIORITY_OPTIONS}
            />
          </div>
          <Input
            label="Complaint Title *"
            required
            placeholder="e.g. Battery overheating while charging"
            value={complaintForm.title}
            onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the issue in detail..."
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setShowRaiseComplaint(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Schedule Maintenance ──────────────────────────────────── */}
      <Modal
        isOpen={showScheduleMaintenance}
        onClose={() => { setShowScheduleMaintenance(false); setSelectedComplaint(null); }}
        title="Schedule Maintenance"
        subtitle={selectedComplaint ? `Responding to complaint: "${selectedComplaint.title}"` : 'Schedule vehicle maintenance'}
      >
        <form onSubmit={handleScheduleMaintenance} className="space-y-4 py-2">
          {!selectedComplaint && (
            <Select
              label="Select Fleet Vehicle *"
              required
              value={maintenanceForm.fleetVehicleId}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, fleetVehicleId: e.target.value })}
              options={[
                { value: '', label: '— Select Vehicle —' },
                ...fleetVehicles.map(fv => ({ value: fv.id, label: `${fv.registrationNumber} — ${fv.make} ${fv.model}` })),
              ]}
            />
          )}

          {selectedComplaint && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <p><strong>Vehicle:</strong> {selectedComplaint.fleetVehicle?.registrationNumber}</p>
              <p><strong>Driver:</strong> {selectedComplaint.driver?.user?.name}</p>
              <p><strong>Category:</strong> {selectedComplaint.category} — Priority: {selectedComplaint.priority}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mechanic Name *"
              required
              placeholder="e.g. Suresh Auto Workshop"
              value={maintenanceForm.mechanic}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, mechanic: e.target.value })}
            />
            <Input
              label="Workshop / Garage *"
              required
              placeholder="e.g. TN EV Service Center"
              value={maintenanceForm.workshop}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, workshop: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Maintenance Date *"
              type="date"
              required
              value={maintenanceForm.maintenanceDate}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceDate: e.target.value })}
            />
            <Input
              label="Estimated Cost ($)"
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={maintenanceForm.estimatedCost}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, estimatedCost: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={maintenanceForm.description}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
              placeholder="Describe the maintenance work to be done..."
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            ⚠️ Scheduling maintenance will set the vehicle status to <strong>IN_MAINTENANCE</strong>.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => { setShowScheduleMaintenance(false); setSelectedComplaint(null); }}>Cancel</Button>
            <Button variant="warning" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : '🔧 Schedule Maintenance'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: Mark Maintenance Complete ─────────────────────────────── */}
      <Modal
        isOpen={showMaintenanceComplete}
        onClose={() => { setShowMaintenanceComplete(false); setSelectedMaintenance(null); }}
        title="Update Maintenance Status"
        subtitle={selectedMaintenance ? `${selectedMaintenance.fleetVehicle?.registrationNumber} — ${selectedMaintenance.workshop}` : ''}
      >
        <div className="space-y-4 py-2">
          <p className="text-surface-300 text-sm">
            Mark this maintenance as completed to restore the vehicle's status to <strong className="text-emerald-400">ACTIVE</strong>,
            or cancel it to leave the vehicle in its current status.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="danger" onClick={() => handleCompleteMaintenace('CANCELLED')} disabled={isSubmitting}>
              Cancel Maintenance
            </Button>
            <Button variant="success" onClick={() => handleCompleteMaintenace('COMPLETED')} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : '✅ Mark Completed → Vehicle ACTIVE'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
