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

/**
 * Smart EV Companion — Complete EV User Dashboard.
 */
export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('companion'); // 'companion' | 'nearby' | 'history' | 'profile'
  const [isRegisterVehicleModalOpen, setIsRegisterVehicleModalOpen] = useState(false);
  const [isBookSlotModalOpen, setIsBookSlotModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Selected Station for booking
  const [selectedStation, setSelectedStation] = useState(null);

  // Registered Vehicles
  const [vehicles, setVehicles] = useState([
    {
      id: 'VEH-101',
      make: 'Tesla',
      model: 'Model Y Long Range',
      year: 2024,
      licensePlate: 'EV-889-CA',
      vin: '5YJ3E1EA8NF109283',
      batteryCapacityKwh: 75,
      connectorType: 'tesla',
      stateOfCharge: 84,
      estimatedRangeMiles: 278,
      sohPercentage: 96.5,
      tempCelsius: 28,
      voltage: 390,
      fastChargeCycles: 42,
    },
    {
      id: 'VEH-102',
      make: 'Rivian',
      model: 'R1T Adventure',
      year: 2023,
      licensePlate: 'EV-302-NY',
      vin: '7FCTGAAA9NN009182',
      batteryCapacityKwh: 135,
      connectorType: 'ccs_2',
      stateOfCharge: 62,
      estimatedRangeMiles: 215,
      sohPercentage: 94.0,
      tempCelsius: 31,
      voltage: 410,
      fastChargeCycles: 68,
    },
  ]);

  const [activeVehicleId, setActiveVehicleId] = useState('VEH-101');
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  // Smart Vehicle Simulator Controls State
  const [vehicleControls, setVehicleControls] = useState({
    doorsLocked: true,
    chargingActive: false,
    climateControl: true,
    targetTempFahrenheit: 70,
    sentryMode: true,
    flashersOn: false,
  });

  // Nearby Charging Stations
  const [nearbyStations] = useState([
    { id: 'ST-01', name: 'Downtown Solar Charging Hub', distance: '1.2 miles', portsAvailable: '6 / 8 Ports', connector: 'CCS2 & Tesla', rate: '$0.32 / kWh', cleanRatio: 94 },
    { id: 'ST-02', name: 'Metro Wind Power Station', distance: '2.8 miles', portsAvailable: '4 / 12 Ports', connector: 'CCS2', rate: '$0.28 / kWh', cleanRatio: 88 },
    { id: 'ST-03', name: 'Suburban Clean Energy Hub', distance: '4.5 miles', portsAvailable: '3 / 4 Ports', connector: 'Type 2', rate: '$0.25 / kWh', cleanRatio: 75 },
  ]);

  // Charging History
  const [historySessions] = useState([
    { id: 'HS-01', date: 'Today, 14:30', station: 'Downtown Solar Hub', energy: '42.5 kWh', duration: '34m', cost: '$13.60', cleanRatio: 94, co2Saved: '30.0 kg' },
    { id: 'HS-02', date: 'Yesterday, 18:10', station: 'Metro Wind Station', energy: '38.0 kWh', duration: '30m', cost: '$10.64', cleanRatio: 88, co2Saved: '26.8 kg' },
    { id: 'HS-03', date: '25 Jul 2026', station: 'Suburban Clean Hub', energy: '51.2 kWh', duration: '45m', cost: '$12.80', cleanRatio: 75, co2Saved: '36.1 kg' },
  ]);

  // User Bookings
  const [bookings, setBookings] = useState([
    { id: 'BK-901', ref: 'BK-198273', station: 'Downtown Solar Hub', time: 'Tomorrow, 10:00 AM', duration: '45 mins', cost: '$14.40', status: 'confirmed' },
  ]);

  // New Vehicle Form
  const [newVehicleData, setNewVehicleData] = useState({
    make: '',
    model: '',
    year: '2024',
    licensePlate: '',
    batteryCapacityKwh: '75',
    connectorType: 'ccs_2',
  });

  // Booking Form
  const [bookingFormData, setBookingFormData] = useState({
    scheduledStartTime: 'Tomorrow, 10:00 AM',
    durationMinutes: '45',
  });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 234-5678',
    street: user?.address?.street || '124 Innovation Way',
    city: user?.address?.city || 'San Francisco',
  });

  // Handlers
  const handleRegisterVehicle = (e) => {
    e.preventDefault();
    const newVeh = {
      id: `VEH-10${vehicles.length + 1}`,
      make: newVehicleData.make || 'EV Maker',
      model: newVehicleData.model || 'Model Green',
      year: parseInt(newVehicleData.year),
      licensePlate: newVehicleData.licensePlate.toUpperCase(),
      vin: `5YJ${Math.floor(100000 + Math.random() * 900000)}`,
      batteryCapacityKwh: parseFloat(newVehicleData.batteryCapacityKwh) || 75,
      connectorType: newVehicleData.connectorType,
      stateOfCharge: 70,
      estimatedRangeMiles: 230,
      sohPercentage: 98.0,
      tempCelsius: 25,
      voltage: 385,
      fastChargeCycles: 12,
    };
    setVehicles([...vehicles, newVeh]);
    setActiveVehicleId(newVeh.id);
    setIsRegisterVehicleModalOpen(false);
    setNewVehicleData({ make: '', model: '', year: '2024', licensePlate: '', batteryCapacityKwh: '75', connectorType: 'ccs_2' });
    setNotification({ type: 'success', title: 'Vehicle Registered!', message: `${newVeh.make} ${newVeh.model} has been added to your garage.` });
  };

  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!selectedStation) return;

    const newBk = {
      id: `BK-${Math.floor(900 + Math.random() * 100)}`,
      ref: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      station: selectedStation.name,
      time: bookingFormData.scheduledStartTime,
      duration: `${bookingFormData.durationMinutes} mins`,
      cost: '$14.40',
      status: 'confirmed',
    };
    setBookings([newBk, ...bookings]);
    setIsBookSlotModalOpen(false);
    setNotification({ type: 'success', title: 'Booking Confirmed!', message: `Slot reserved at ${selectedStation.name} (${newBk.ref}).` });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser({ ...user, name: profileData.name, phone: profileData.phone });
    setNotification({ type: 'success', title: 'Profile Saved', message: 'Your profile settings have been updated.' });
  };

  const historyColumns = [
    { key: 'date', title: 'Date & Time' },
    { key: 'station', title: 'Charging Station' },
    { key: 'energy', title: 'Energy Delivered' },
    { key: 'duration', title: 'Duration' },
    { key: 'cost', title: 'Cost ($)' },
    {
      key: 'cleanRatio',
      title: 'Clean Energy %',
      render: (row) => (
        <Badge variant={row.cleanRatio >= 90 ? 'success' : 'info'} dot>
          {row.cleanRatio}% Clean
        </Badge>
      ),
    },
    { key: 'co2Saved', title: 'CO2 Offset' },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-primary-950/80 via-surface-800 to-secondary-950/80 border border-primary-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-primary-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Smart EV Companion
              </h1>
              <Badge variant="primary" dot pulse>Connected</Badge>
            </div>
            <p className="text-surface-400 text-xs md:text-sm mt-1">
              Welcome back, <span className="text-white font-medium">{user?.name || 'EV Driver'}</span> •{' '}
              {activeVehicle.make} {activeVehicle.model} ({activeVehicle.licensePlate})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={activeVehicleId}
            onChange={(e) => setActiveVehicleId(e.target.value)}
            options={vehicles.map((v) => ({ value: v.id, label: `${v.make} ${v.model} (${v.licensePlate})` }))}
            className="w-56"
          />
          <Button variant="outline" size="md" onClick={() => setIsRegisterVehicleModalOpen(true)}>
            + Add Vehicle
          </Button>
        </div>
      </div>

      {/* Key Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="State of Charge (SoC)"
          value={`${activeVehicle.stateOfCharge}%`}
          change="Battery Healthy"
          changeType="increase"
          periodText="live battery status"
          badgeText="Optimal"
          badgeVariant="success"
          icon={<span className="text-xl">🔋</span>}
        />
        <StatCard
          title="Estimated Range"
          value={`${activeVehicle.estimatedRangeMiles} miles`}
          change={`${activeVehicle.batteryCapacityKwh} kWh Capacity`}
          changeType="increase"
          periodText="remaining range"
          badgeText="Ready"
          badgeVariant="primary"
          icon={<span className="text-xl">🚗</span>}
        />
        <StatCard
          title="Personal CO2 Offset"
          value="340.5 kg"
          change="+45 kg this month"
          changeType="increase"
          periodText="vs gasoline"
          badgeText="17 Trees 🌳"
          badgeVariant="success"
          icon={<span className="text-xl">🌿</span>}
        />
        <StatCard
          title="Clean Energy Charged"
          value="91.2%"
          change="100% Renewable"
          changeType="increase"
          periodText="solar/wind matched"
          badgeText="Zero Carbon"
          badgeVariant="info"
          icon={<span className="text-xl">☀️</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('companion')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'companion'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ⚡ Vehicle Simulator & Battery
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'nearby'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🔌 Nearby Charging & Booking
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📋 History & Sustainability
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          👤 Profile Settings
        </button>
      </div>

      {/* TAB 1: Smart Vehicle Remote Controller & Battery Dashboard */}
      {activeTab === 'companion' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Remote Controller Simulator Widget */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader
                title="Smart Vehicle Controller (Live Simulator)"
                subtitle="Remote telemetry & interactive controls for active EV vehicle"
                action={
                  <Badge variant={vehicleControls.doorsLocked ? 'neutral' : 'warning'} dot>
                    {vehicleControls.doorsLocked ? 'LOCKED' : 'UNLOCKED'}
                  </Badge>
                }
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                {/* Control 1: Door Locks */}
                <button
                  type="button"
                  onClick={() => {
                    const newState = !vehicleControls.doorsLocked;
                    setVehicleControls({ ...vehicleControls, doorsLocked: newState });
                    setNotification({ type: 'info', title: 'Vehicle Lock Status', message: newState ? 'Doors locked.' : 'Doors unlocked.' });
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    vehicleControls.doorsLocked
                      ? 'bg-surface-800/80 border-surface-700 text-surface-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <span className="text-3xl block mb-1">{vehicleControls.doorsLocked ? '🔒' : '🔓'}</span>
                  <span className="text-xs font-bold block">{vehicleControls.doorsLocked ? 'Unlock Doors' : 'Lock Doors'}</span>
                </button>

                {/* Control 2: Start/Pause Charging */}
                <button
                  type="button"
                  onClick={() => {
                    const newState = !vehicleControls.chargingActive;
                    setVehicleControls({ ...vehicleControls, chargingActive: newState });
                    setNotification({ type: 'success', title: 'Charging Simulator', message: newState ? 'Charging initiated.' : 'Charging paused.' });
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    vehicleControls.chargingActive
                      ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
                      : 'bg-surface-800/80 border-surface-700 text-surface-300'
                  }`}
                >
                  <span className="text-3xl block mb-1">⚡</span>
                  <span className="text-xs font-bold block">{vehicleControls.chargingActive ? 'Stop Charge' : 'Start Charge'}</span>
                </button>

                {/* Control 3: Climate Control Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const newState = !vehicleControls.climateControl;
                    setVehicleControls({ ...vehicleControls, climateControl: newState });
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    vehicleControls.climateControl
                      ? 'bg-secondary-500/20 border-secondary-500/40 text-secondary-400'
                      : 'bg-surface-800/80 border-surface-700 text-surface-300'
                  }`}
                >
                  <span className="text-3xl block mb-1">❄️</span>
                  <span className="text-xs font-bold block">{vehicleControls.climateControl ? 'Climate ON' : 'Climate OFF'}</span>
                </button>

                {/* Control 4: Remote Flashers */}
                <button
                  type="button"
                  onClick={() => {
                    const newState = !vehicleControls.flashersOn;
                    setVehicleControls({ ...vehicleControls, flashersOn: newState });
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    vehicleControls.flashersOn
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-surface-800/80 border-surface-700 text-surface-300'
                  }`}
                >
                  <span className="text-3xl block mb-1">🚨</span>
                  <span className="text-xs font-bold block">{vehicleControls.flashersOn ? 'Flashers ON' : 'Flashers OFF'}</span>
                </button>
              </div>

              {/* Climate Temperature Slider */}
              {vehicleControls.climateControl && (
                <div className="p-4 rounded-2xl bg-surface-800/50 border border-surface-700/50 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="text-surface-400 block">Pre-Condition Target Temp</span>
                    <span className="text-white font-bold text-base">{vehicleControls.targetTempFahrenheit}°F</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="80"
                    value={vehicleControls.targetTempFahrenheit}
                    onChange={(e) => setVehicleControls({ ...vehicleControls, targetTempFahrenheit: parseInt(e.target.value) })}
                    className="w-1/2 accent-secondary-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Battery Diagnostics Card */}
            <Card variant="glass" padding="normal" className="flex flex-col justify-between">
              <CardHeader title="Battery Health Diagnostics" subtitle="State of Health & Temperature" />
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-400">State of Health (SoH):</span>
                  <span className="text-emerald-400 font-bold text-sm">{activeVehicle.sohPercentage}%</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${activeVehicle.sohPercentage}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-surface-700/50 text-xs">
                  <div>
                    <span className="text-surface-400 block">Pack Temperature</span>
                    <span className="text-white font-bold">{activeVehicle.tempCelsius}°C</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block">Pack Voltage</span>
                    <span className="text-white font-bold">{activeVehicle.voltage}V</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block">Fast Charge Cycles</span>
                    <span className="text-white font-bold">{activeVehicle.fastChargeCycles} Cycles</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block">Health Rating</span>
                    <Badge variant="success" size="sm">EXCELLENT</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-700/50">
                <Button variant="outline" size="sm" fullWidth>
                  Run Full Diagnostic Scan
                </Button>
              </div>
            </Card>
          </div>

          {/* Vehicle Profile Details Card */}
          <Card variant="glass" padding="normal">
            <CardHeader title="Vehicle Profile & Specifications" subtitle="Registered EV Details" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-surface-400 block">Make & Model</span>
                <span className="text-white font-bold text-sm">{activeVehicle.make} {activeVehicle.model}</span>
              </div>
              <div>
                <span className="text-surface-400 block">License Plate</span>
                <span className="text-primary-400 font-bold text-sm">{activeVehicle.licensePlate}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Battery Capacity</span>
                <span className="text-white font-bold text-sm">{activeVehicle.batteryCapacityKwh} kWh</span>
              </div>
              <div>
                <span className="text-surface-400 block">Connector Type</span>
                <span className="text-secondary-400 font-bold text-sm uppercase">{activeVehicle.connectorType}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Nearby Charging Stations & Slot Booking */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Nearby Clean Charging Stations</h2>
            <Badge variant="primary">20 km Radius Search</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyStations.map((station) => (
              <Card key={station.id} variant="glass" padding="normal" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-white">{station.name}</h3>
                    <Badge variant="success" size="sm">{station.distance}</Badge>
                  </div>

                  <div className="space-y-2 py-3 my-3 border-y border-surface-700/50 text-xs">
                    <div className="flex justify-between">
                      <span className="text-surface-400">Available Slots:</span>
                      <span className="text-primary-400 font-bold">{station.portsAvailable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Connectors:</span>
                      <span className="text-white font-medium">{station.connector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Rate:</span>
                      <span className="text-white font-semibold">{station.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Clean Power Sync:</span>
                      <span className="text-emerald-400 font-bold">{station.cleanRatio}% Solar/Wind</span>
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

          {/* Bookings List */}
          {bookings.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-md font-bold text-white">Your Reserved Bookings</h3>
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl glass-card border border-surface-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-secondary-400">{b.ref}</span>
                      <p className="text-white font-bold text-sm mt-0.5">{b.station}</p>
                      <p className="text-surface-400">{b.time} • {b.duration}</p>
                    </div>
                    <Badge variant="success" dot>CONFIRMED</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Charging History & Sustainability Impact */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Sustainability Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-surface-800 to-primary-950/60 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Your Environmental Impact 🌿</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                By charging on EcoVolt's clean grid, you've prevented <span className="text-emerald-400 font-bold">340.5 kg CO2</span> emissions (equivalent to planting 17 trees).
              </p>
            </div>
            <div className="text-4xl">🌳</div>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Charging History Log</h2>
            <Table columns={historyColumns} data={historySessions} />
          </section>
        </div>
      )}

      {/* TAB 4: User Profile & Settings */}
      {activeTab === 'profile' && (
        <Card variant="glass" padding="normal" className="max-w-2xl">
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Street Address"
                value={profileData.street}
                onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
              />
              <Input
                label="City"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              />
            </div>
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
        subtitle="Add a new electric vehicle to your garage"
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

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsRegisterVehicleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Reserve Charging Slot */}
      <Modal
        isOpen={isBookSlotModalOpen}
        onClose={() => setIsBookSlotModalOpen(false)}
        title={`Reserve Slot at ${selectedStation?.name}`}
        subtitle="Schedule advance charging window"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4 py-2">
          <Input
            label="Scheduled Start Time"
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

          <div className="p-4 rounded-xl bg-surface-800/80 border border-surface-700 text-xs flex justify-between">
            <span className="text-surface-400">Estimated Cost:</span>
            <span className="text-emerald-400 font-bold text-sm">$14.40</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsBookSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
