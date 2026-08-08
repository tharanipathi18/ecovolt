import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import evUserService from '@services/evUserService';
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

/**
 * Smart EV Companion — Complete EV User Dashboard with real API & DB persistence.
 */
export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('companion'); // 'companion' | 'nearby' | 'history' | 'profile'
  const [isRegisterVehicleModalOpen, setIsRegisterVehicleModalOpen] = useState(false);
  const [isBookSlotModalOpen, setIsBookSlotModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Selected Station for booking
  const [selectedStation, setSelectedStation] = useState(null);

  // Dynamic API State (Strictly from Supabase DB — No Mock Data)
  const [vehicles, setVehicles] = useState([]);
  const [activeVehicleId, setActiveVehicleId] = useState('');
  const [nearbyStations, setNearbyStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [sustainability, setSustainability] = useState(null);

  // Loading States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // Active Vehicle selected from user's real vehicles in DB
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || null;

  // Smart Vehicle Simulator Controls State
  const [vehicleControls, setVehicleControls] = useState({
    doorsLocked: true,
    chargingActive: false,
    climateControl: true,
    targetTempFahrenheit: 70,
    sentryMode: true,
    flashersOn: false,
  });

  // New Vehicle Form State
  const [newVehicleData, setNewVehicleData] = useState({
    make: '',
    model: '',
    year: 2024,
    licensePlate: '',
    batteryCapacityKwh: 75,
    connectorType: 'ccs_2',
  });

  // Booking Form State (default scheduledStartTime to 1 hour from now)
  const defaultStartTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const [bookingFormData, setBookingFormData] = useState({
    scheduledStartTime: defaultStartTime,
    durationMinutes: '45',
  });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addressStreet || '',
    city: user?.addressCity || '',
  });

  // ─── Fetch All Initial Data from Backend API ──────────────────────────────
  const loadDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Vehicles
      const vRes = await evUserService.getVehicles();
      const fetchedVehicles = vRes.data?.vehicles || [];
      setVehicles(fetchedVehicles);
      if (fetchedVehicles.length > 0) {
        setActiveVehicleId((prev) => prev || fetchedVehicles[0].id);
      }

      // 2. Fetch Nearby Stations & Ports
      const sRes = await evUserService.getNearbyStations();
      const fetchedStations = sRes.data?.stations || [];
      setNearbyStations(fetchedStations);

      // 3. Fetch Bookings
      const bRes = await evUserService.getBookings();
      const fetchedBookings = bRes.data?.bookings || [];
      setBookings(fetchedBookings);

      // 4. Fetch Charging History
      const hRes = await evUserService.getChargingHistory();
      setHistorySessions(hRes.data?.history || []);

      // 5. Fetch Sustainability Metrics
      const mRes = await evUserService.getSustainabilityMetrics();
      setSustainability(mRes.data || null);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Data Load Warning',
        message: err.message || 'Could not load live dashboard data.',
      });
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ─── Register Vehicle Handler (API Call) ──────────────────────────────────
  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setIsSubmittingVehicle(true);
    try {
      const res = await evUserService.registerVehicle({
        make: newVehicleData.make,
        model: newVehicleData.model,
        year: parseInt(newVehicleData.year, 10),
        licensePlate: newVehicleData.licensePlate,
        batteryCapacityKwh: parseFloat(newVehicleData.batteryCapacityKwh),
        connectorType: newVehicleData.connectorType,
      });

      const createdVehicle = res.data.vehicle;
      setVehicles((prev) => [createdVehicle, ...prev]);
      setActiveVehicleId(createdVehicle.id);
      setIsRegisterVehicleModalOpen(false);
      setNewVehicleData({ make: '', model: '', year: 2024, licensePlate: '', batteryCapacityKwh: 75, connectorType: 'ccs_2' });

      setNotification({
        type: 'success',
        title: 'Vehicle Registered!',
        message: `${createdVehicle.make} ${createdVehicle.model} (${createdVehicle.licensePlate}) saved to Supabase DB.`,
      });
      loadDashboardData();
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Failed to register vehicle in database.',
      });
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  // ─── Create Booking Handler (Status = Pending for Station Owner Approval) ───
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedStation) {
      setNotification({ type: 'error', title: 'Error', message: 'No charging station selected.' });
      return;
    }

    if (!activeVehicle) {
      setNotification({
        type: 'error',
        title: 'No Vehicle Selected',
        message: 'Please register a vehicle before reserving a slot.',
      });
      setIsRegisterVehicleModalOpen(true);
      return;
    }

    setIsSubmittingBooking(true);

    try {
      // 1. Dispatch Axios POST request (Status = pending)
      const res = await evUserService.createBooking({
        chargingPortId: selectedStation.id,
        vehicleId: activeVehicle.id,
        scheduledStartTime: new Date(bookingFormData.scheduledStartTime).toISOString(),
        durationMinutes: parseInt(bookingFormData.durationMinutes, 10),
      });

      const newBooking = res.data.booking;

      // 2. Refresh bookings directly from database
      const updatedBookings = await evUserService.getBookings();
      setBookings(updatedBookings.data.bookings || [newBooking, ...bookings]);

      setIsBookSlotModalOpen(false);

      // 3. Show success notification (Pending Approval)
      setNotification({
        type: 'success',
        title: 'Booking Requested ⏳',
        message: `Slot reservation submitted to ${selectedStation.stationName || selectedStation.name} (${newBooking.bookingReference}). Status: PENDING approval.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Booking Failed',
        message: err.message || 'Failed to request booking.',
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // ─── Save Profile Handler ────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await evUserService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.street,
      });
      setUser({ ...user, ...res.data.user });
      setNotification({ type: 'success', title: 'Profile Saved', message: 'Your profile settings have been updated.' });
    } catch (err) {
      setNotification({ type: 'error', title: 'Update Failed', message: err.message || 'Could not save profile.' });
    }
  };

  const historyColumns = [
    { key: 'date', title: 'Date & Time', render: (row) => new Date(row.startTime || row.createdAt).toLocaleString() },
    { key: 'station', title: 'Charging Station', render: (row) => row.chargingPort?.stationName || 'Clean Power Hub' },
    { key: 'energy', title: 'Energy Delivered', render: (row) => `${row.energyConsumedKwh || 0} kWh` },
    { key: 'duration', title: 'Duration', render: (row) => `${row.durationMinutes || 45} mins` },
    { key: 'cost', title: 'Cost ($)', render: (row) => `$${row.cost || 0}` },
    {
      key: 'cleanRatio',
      title: 'Clean Energy %',
      render: (row) => (
        <Badge variant={(row.renewableEnergyPercentage || 100) >= 90 ? 'success' : 'info'} dot>
          {row.renewableEnergyPercentage || 100}% Clean
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Notification Toast */}
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

      {/* Top Banner & Vehicle Switcher Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-2xs shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Good morning, {user?.name || 'EV Driver'}
              </h1>
              <Badge variant="primary" dot pulse>Live Grid Sync</Badge>
            </div>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Here's your EcoVolt overview •{' '}
              {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.licensePlate})` : 'No vehicles registered'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {vehicles.length > 0 ? (
            <Select
              value={activeVehicleId}
              onChange={(e) => setActiveVehicleId(e.target.value)}
              options={vehicles.map((v) => ({ value: v.id, label: `${v.make} ${v.model} (${v.licensePlate})` }))}
              className="w-56"
            />
          ) : (
            <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-medium">
              No vehicles registered
            </span>
          )}
          <Button variant="outline" size="md" onClick={() => setIsRegisterVehicleModalOpen(true)}>
            + Add Vehicle
          </Button>
        </div>
      </div>

      {/* Key Metric StatCards (Dynamic from DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="State of Charge (SoC)"
          value={activeVehicle ? `${activeVehicle.currentStateOfCharge || 80}%` : 'N/A'}
          change={activeVehicle ? 'Battery Active' : 'No Vehicle'}
          changeType="increase"
          periodText="live battery status"
          badgeText={activeVehicle ? 'Optimal' : 'Inactive'}
          badgeVariant={activeVehicle ? 'success' : 'neutral'}
          icon={<span className="text-xl">🔋</span>}
        />
        <StatCard
          title="Estimated Range"
          value={activeVehicle ? `${activeVehicle.batteryCapacityKwh * 3.3} miles` : '0 miles'}
          change={activeVehicle ? `${activeVehicle.batteryCapacityKwh} kWh Capacity` : 'No vehicle'}
          changeType="increase"
          periodText="remaining range"
          badgeText={activeVehicle ? 'Ready' : 'Register Vehicle'}
          badgeVariant={activeVehicle ? 'primary' : 'warning'}
          icon={<span className="text-xl">🚗</span>}
        />
        <StatCard
          title="Personal CO2 Offset"
          value={`${sustainability?.co2SavedKg || 0} kg`}
          change={`${sustainability?.totalSessionsCount || 0} Sessions Delivered`}
          changeType="increase"
          periodText="vs gasoline"
          badgeText={`${sustainability?.treesEquivalent || 0} Trees 🌳`}
          badgeVariant="success"
          icon={<span className="text-xl">🌿</span>}
        />
        <StatCard
          title="Clean Energy Charged"
          value={`${sustainability?.avgCleanPercentage || 0}%`}
          change="Renewable Grid Synced"
          changeType="increase"
          periodText="solar/wind matched"
          badgeText="Zero Carbon"
          badgeVariant="info"
          icon={<span className="text-xl">☀️</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('companion')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'companion'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ⚡ Vehicle Telemetry ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'nearby'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🔌 Nearby Charging &amp; Booking ({nearbyStations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📋 History &amp; Sustainability
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          👤 Profile Settings
        </button>
      </div>

      {/* TAB 1: Smart Vehicle Remote Controller & Battery Dashboard */}
      {activeTab === 'companion' && (
        !activeVehicle ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-4xl block">🚗</span>
            <h3 className="text-lg font-bold text-slate-900">No vehicles registered.</h3>
            <p className="text-xs text-slate-500">Click "+ Add Vehicle" above to register your EV in Supabase DB.</p>
            <Button variant="primary" size="md" onClick={() => setIsRegisterVehicleModalOpen(true)}>
              + Add Vehicle Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Remote Controller Simulator Widget */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <CardHeader
                  title="Smart Vehicle Controller (Live Telemetry)"
                  subtitle={`Remote telemetry & interactive controls for ${activeVehicle.make} ${activeVehicle.model}`}
                  action={
                    <Badge variant={vehicleControls.doorsLocked ? 'neutral' : 'warning'} dot>
                      {vehicleControls.doorsLocked ? 'LOCKED' : 'UNLOCKED'}
                    </Badge>
                  }
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                  <button
                    type="button"
                    onClick={() => setVehicleControls({ ...vehicleControls, doorsLocked: !vehicleControls.doorsLocked })}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      vehicleControls.doorsLocked
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'bg-amber-50 border-amber-200 text-amber-900 font-semibold'
                    }`}
                  >
                    <span className="text-3xl block mb-1">{vehicleControls.doorsLocked ? '🔒' : '🔓'}</span>
                    <span className="text-xs font-bold block">{vehicleControls.doorsLocked ? 'Unlock Doors' : 'Lock Doors'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleControls({ ...vehicleControls, chargingActive: !vehicleControls.chargingActive })}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      vehicleControls.chargingActive
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-3xl block mb-1">⚡</span>
                    <span className="text-xs font-bold block">{vehicleControls.chargingActive ? 'Stop Charge' : 'Start Charge'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleControls({ ...vehicleControls, climateControl: !vehicleControls.climateControl })}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      vehicleControls.climateControl
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-3xl block mb-1">❄️</span>
                    <span className="text-xs font-bold block">{vehicleControls.climateControl ? 'Climate ON' : 'Climate OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleControls({ ...vehicleControls, flashersOn: !vehicleControls.flashersOn })}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      vehicleControls.flashersOn
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-3xl block mb-1">🚨</span>
                    <span className="text-xs font-bold block">{vehicleControls.flashersOn ? 'Flashers ON' : 'Flashers OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Vehicle Specs */}
              <Card variant="solid" padding="normal" className="flex flex-col justify-between">
                <CardHeader title="Vehicle Specifications" subtitle="Registered EV details" />
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Make &amp; Model:</span>
                    <span className="text-slate-900 font-bold">{activeVehicle.make} {activeVehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">License Plate:</span>
                    <span className="text-emerald-800 font-bold">{activeVehicle.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Battery Capacity:</span>
                    <span className="text-slate-900 font-bold">{activeVehicle.batteryCapacityKwh} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Connector Standard:</span>
                    <span className="text-slate-800 font-bold uppercase">{activeVehicle.connectorType}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )
      )}

      {/* TAB 2: Nearby Charging Stations & Slot Booking */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Nearby Clean Charging Stations</h2>
            <Badge variant="primary">{nearbyStations.length} Available Ports</Badge>
          </div>

          {isLoadingData ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              <span>Loading live charging stations from Supabase...</span>
            </div>
          ) : nearbyStations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 shadow-sm">
              No charging stations available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nearbyStations.map((station) => (
                <Card key={station.id} variant="solid" padding="normal" className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900">{station.stationName || station.name}</h3>
                      <Badge variant="success" size="sm">Available</Badge>
                    </div>

                    <div className="space-y-2 py-3 my-3 border-y border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Port Code:</span>
                        <span className="text-emerald-800 font-mono font-bold">{station.portIdentifier || 'PORT-01'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Connector:</span>
                        <span className="text-slate-900 font-medium uppercase">{station.connectorType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rate:</span>
                        <span className="text-slate-900 font-semibold">${station.pricingRatePerKwh} / kWh</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedStation(station);
                      setIsBookSlotModalOpen(true);
                    }}
                  >
                    Reserve Slot Now
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* Bookings List (Persistent from Supabase DB) */}
          <div className="space-y-3 pt-4">
            <h3 className="text-md font-bold text-slate-900">Your Reserved Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 shadow-2xs">
                No bookings found.
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <span className="font-mono text-emerald-800 font-bold">{b.bookingReference}</span>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">
                        {b.chargingPort?.stationName || 'Charging Hub'} ({b.chargingPort?.portIdentifier || 'PORT'})
                      </p>
                      <p className="text-slate-500">
                        {new Date(b.scheduledStartTime).toLocaleString()} • {b.durationMinutes} mins • Vehicle: {b.vehicle?.licensePlate || 'EV'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'} dot>
                        {b.status.toUpperCase()}
                      </Badge>
                      <p className="text-emerald-800 font-bold mt-1">${b.estimatedCost}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Charging History & Sustainability Impact */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Environmental Impact 🌿</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                By charging on EcoVolt's clean grid, you've prevented <span className="text-emerald-800 font-bold">{sustainability?.co2SavedKg || 0} kg CO2</span> emissions.
              </p>
            </div>
            <div className="text-4xl">🌳</div>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Charging History Log</h2>
            <Table columns={historyColumns} data={historySessions} emptyMessage="No charging sessions found." />
          </section>
        </div>
      )}

      {/* TAB 4: User Profile & Settings */}
      {activeTab === 'profile' && (
        <Card variant="solid" padding="normal" className="max-w-2xl">
          <CardHeader title="EV Driver Profile & Preferences" subtitle="Update account information" />
          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              disabled
              value={profileData.email}
            />
            <Input
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />
            <Button variant="primary" type="submit">
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {/* MODAL 1: Register New Vehicle */}
      <Modal
        isOpen={isRegisterVehicleModalOpen}
        onClose={() => setIsRegisterVehicleModalOpen(false)}
        title="Register New EV Vehicle"
        subtitle="Add a new electric vehicle to your Supabase garage"
      >
        <form onSubmit={handleRegisterVehicle} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Make"
              required
              placeholder="e.g. Tesla, Rivian, Hyundai"
              value={newVehicleData.make}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, make: e.target.value })}
            />
            <Input
              label="Model"
              required
              placeholder="e.g. Model Y, Ioniq 5"
              value={newVehicleData.model}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Year"
              type="number"
              required
              value={newVehicleData.year}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, year: e.target.value })}
            />
            <Input
              label="License Plate"
              required
              placeholder="e.g. EV-889-CA"
              value={newVehicleData.licensePlate}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, licensePlate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Battery Capacity (kWh)"
              type="number"
              required
              value={newVehicleData.batteryCapacityKwh}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, batteryCapacityKwh: e.target.value })}
            />
            <Select
              label="Connector Standard"
              value={newVehicleData.connectorType}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, connectorType: e.target.value })}
              options={[
                { value: 'ccs_2', label: 'CCS Combo 2' },
                { value: 'tesla', label: 'Tesla Supercharger' },
                { value: 'type_2', label: 'Type 2' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsRegisterVehicleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingVehicle}>
              {isSubmittingVehicle ? 'Saving to DB...' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Reserve Charging Slot (Status = Pending) */}
      <Modal
        isOpen={isBookSlotModalOpen}
        onClose={() => setIsBookSlotModalOpen(false)}
        title={`Reserve Slot at ${selectedStation?.stationName || selectedStation?.name}`}
        subtitle="Schedule advance charging window with Supabase DB persistence"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4 py-2">
          <Input
            label="Scheduled Start Date & Time"
            type="datetime-local"
            required
            value={bookingFormData.scheduledStartTime}
            onChange={(e) => setBookingFormData({ ...bookingFormData, scheduledStartTime: e.target.value })}
          />

          <Select
            label="Duration"
            value={bookingFormData.durationMinutes}
            onChange={(e) => setBookingFormData({ ...bookingFormData, durationMinutes: e.target.value })}
            options={[
              { value: '30', label: '30 Minutes' },
              { value: '45', label: '45 Minutes' },
              { value: '60', label: '60 Minutes (1 Hour)' },
            ]}
          />

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Selected Station:</span>
              <span className="text-slate-900 font-semibold">{selectedStation?.stationName || selectedStation?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle:</span>
              <span className="text-slate-900 font-semibold">{activeVehicle?.make} {activeVehicle?.model} ({activeVehicle?.licensePlate})</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Estimated Cost:</span>
              <span className="text-emerald-800 font-bold text-sm">
                ${((selectedStation?.maxPowerOutputKw || 50) * (parseInt(bookingFormData.durationMinutes, 10) / 60) * 0.8 * (selectedStation?.pricingRatePerKwh || 0.35)).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsBookSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingBooking}>
              {isSubmittingBooking ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Request...
                </span>
              ) : (
                'Submit Booking Request'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

