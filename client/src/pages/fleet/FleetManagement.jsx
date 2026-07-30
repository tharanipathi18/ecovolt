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
 * Fleet Management Module — Complete Dashboard.
 */
export default function FleetManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'drivers' | 'schedule' | 'maintenance' | 'analytics'
  const [isAddFleetModalOpen, setIsAddFleetModalOpen] = useState(false);
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form States
  const [fleetFormData, setFleetFormData] = useState({
    fleetName: 'EcoVolt Logistics Fleet Alpha',
    fleetUnitNumber: 'UNIT-105',
    make: 'Rivian',
    model: 'EDV 700 Delivery Van',
    licensePlate: 'EV-901-CA',
    batteryCapacityKwh: '135',
    chargingPriority: 'high',
    preferredChargeStartTime: '22:00',
  });

  const [driverFormData, setDriverFormData] = useState({
    name: 'Robert Vance',
    email: 'robert@fleetlogistics.com',
    licenseNumber: 'DL-8819203',
    licenseExpirationDate: '2028-12-31',
  });

  const [assignFormData, setAssignFormData] = useState({
    fleetVehicleId: 'UNIT-101',
    driverId: 'DRV-01',
  });

  const [maintenanceFormData, setMaintenanceFormData] = useState({
    vehicleId: 'UNIT-101',
    title: 'Brake Fluid & Tire Telemetry Inspection',
    description: 'Routine 20,000 mile commercial inspection',
    priority: 'medium',
    estimatedCost: '250',
  });

  // Mock Fleet Vehicles Roster
  const [fleetVehicles, setFleetVehicles] = useState([
    {
      id: 'UNIT-101',
      unitNumber: 'FLEET-UNIT-01',
      make: 'Rivian',
      model: 'EDV 700 Delivery Van',
      plate: 'EV-889-CA',
      soc: 92,
      driver: 'Robert Vance',
      priority: 'high',
      scheduleTime: '22:00 (Wind Peak)',
      status: 'in_transit',
    },
    {
      id: 'UNIT-102',
      unitNumber: 'FLEET-UNIT-02',
      make: 'Ford',
      model: 'F-150 Lightning Pro',
      plate: 'EV-302-NY',
      soc: 45,
      driver: 'Elena Miller',
      priority: 'scheduled_window',
      scheduleTime: '13:00 (Solar Peak)',
      status: 'charging',
    },
    {
      id: 'UNIT-103',
      unitNumber: 'FLEET-UNIT-03',
      make: 'Tesla',
      model: 'Semi Commercial',
      plate: 'EV-114-TX',
      soc: 30,
      driver: 'Unassigned',
      priority: 'high',
      scheduleTime: '23:30 (Off-Peak)',
      status: 'idle',
    },
    {
      id: 'UNIT-104',
      unitNumber: 'FLEET-UNIT-04',
      make: 'Volvo',
      model: 'VNR Electric Heavy Duty',
      plate: 'EV-554-FL',
      soc: 88,
      driver: 'Carlos Ray',
      priority: 'low',
      scheduleTime: '02:00 (Night Grid)',
      status: 'maintenance',
    },
  ]);

  // Drivers Directory
  const [drivers, setDrivers] = useState([
    { id: 'DRV-01', name: 'Robert Vance', license: 'DL-8819203', assignedUnit: 'FLEET-UNIT-01', rating: 4.9, ecoScore: 94, status: 'on_duty' },
    { id: 'DRV-02', name: 'Elena Miller', license: 'DL-4401928', assignedUnit: 'FLEET-UNIT-02', rating: 4.8, ecoScore: 91, status: 'on_duty' },
    { id: 'DRV-03', name: 'Carlos Ray', license: 'DL-1102938', assignedUnit: 'FLEET-UNIT-04', rating: 4.7, ecoScore: 86, status: 'available' },
    { id: 'DRV-04', name: 'Sarah Connor', license: 'DL-9920194', assignedUnit: 'Unassigned', rating: 5.0, ecoScore: 98, status: 'available' },
  ]);

  // Maintenance Tickets
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    { id: 'TKT-501', unit: 'FLEET-UNIT-04 (Volvo VNR)', title: 'Inverter Overheating Warning', priority: 'high', cost: '$450', status: 'open', date: 'Today, 11:20' },
    { id: 'TKT-500', unit: 'FLEET-UNIT-02 (Ford Lightning)', title: 'Tire Pressure Telemetry Re-calibration', priority: 'low', cost: '$120', status: 'resolved', date: '24 Jul 2026' },
  ]);

  // Analytics Chart Data
  const fleetAnalyticsData = [
    { month: 'Jan', energyKwh: 12400, co2SavedTons: 14.2, costSavings: 4200 },
    { month: 'Feb', energyKwh: 14100, co2SavedTons: 15.8, costSavings: 4800 },
    { month: 'Mar', energyKwh: 15800, co2SavedTons: 17.5, costSavings: 5400 },
    { month: 'Apr', energyKwh: 16900, co2SavedTons: 18.2, costSavings: 5900 },
  ];

  // Aggregate Metrics
  const totalFleetCount = fleetVehicles.length;
  const activeCount = fleetVehicles.filter((fv) => fv.status === 'in_transit' || fv.status === 'active').length;
  const chargingCount = fleetVehicles.filter((fv) => fv.status === 'charging').length;
  const avgSoc = Math.round(fleetVehicles.reduce((acc, fv) => acc + fv.soc, 0) / totalFleetCount);

  // Handlers
  const handleRegisterFleetVehicle = (e) => {
    e.preventDefault();
    const newUnit = {
      id: `UNIT-10${fleetVehicles.length + 1}`,
      unitNumber: fleetFormData.fleetUnitNumber.toUpperCase(),
      make: fleetFormData.make,
      model: fleetFormData.model,
      plate: fleetFormData.licensePlate.toUpperCase(),
      soc: 85,
      driver: 'Unassigned',
      priority: fleetFormData.chargingPriority,
      scheduleTime: `${fleetFormData.preferredChargeStartTime} (Clean Window)`,
      status: 'idle',
    };
    setFleetVehicles([...fleetVehicles, newUnit]);
    setIsAddFleetModalOpen(false);
    setNotification({ type: 'success', title: 'Fleet Vehicle Added!', message: `${newUnit.unitNumber} (${newUnit.make} ${newUnit.model}) registered.` });
  };

  const handleCreateDriver = (e) => {
    e.preventDefault();
    const newDrv = {
      id: `DRV-0${drivers.length + 1}`,
      name: driverFormData.name,
      license: driverFormData.licenseNumber.toUpperCase(),
      assignedUnit: 'Unassigned',
      rating: 5.0,
      ecoScore: 92,
      status: 'available',
    };
    setDrivers([...drivers, newDrv]);
    setIsAddDriverModalOpen(false);
    setNotification({ type: 'success', title: 'Driver Profile Created!', message: `${newDrv.name} registered as fleet driver.` });
  };

  const handleAssignDriver = (e) => {
    e.preventDefault();
    const targetUnit = fleetVehicles.find((fv) => fv.id === assignFormData.fleetVehicleId);
    const targetDriver = drivers.find((d) => d.id === assignFormData.driverId);

    if (!targetUnit || !targetDriver) return;

    setFleetVehicles((prev) =>
      prev.map((fv) => (fv.id === targetUnit.id ? { ...fv, driver: targetDriver.name } : fv)),
    );

    setDrivers((prev) =>
      prev.map((d) => (d.id === targetDriver.id ? { ...d, assignedUnit: targetUnit.unitNumber, status: 'on_duty' } : d)),
    );

    setIsAssignDriverModalOpen(false);
    setNotification({ type: 'success', title: 'Driver Assigned!', message: `${targetDriver.name} assigned to ${targetUnit.unitNumber}.` });
  };

  const handleFileMaintenance = (e) => {
    e.preventDefault();
    const targetUnit = fleetVehicles.find((fv) => fv.id === maintenanceFormData.vehicleId);
    const newTkt = {
      id: `TKT-${Math.floor(500 + Math.random() * 200)}`,
      unit: targetUnit ? `${targetUnit.unitNumber} (${targetUnit.make})` : 'Fleet Vehicle',
      title: maintenanceFormData.title,
      priority: maintenanceFormData.priority,
      cost: `$${maintenanceFormData.estimatedCost}`,
      status: 'open',
      date: 'Just now',
    };
    setMaintenanceTickets([newTkt, ...maintenanceTickets]);
    setIsMaintenanceModalOpen(false);
    setNotification({ type: 'warning', title: 'Maintenance Ticket Filed', message: `Ticket ${newTkt.id} logged for ${newTkt.unit}.` });
  };

  const handleSimulateStatus = (unitId, newStatus) => {
    setFleetVehicles((prev) =>
      prev.map((fv) => (fv.id === unitId ? { ...fv, status: newStatus } : fv)),
    );
    setNotification({ type: 'info', title: 'Live Status Simulated', message: `Unit ${unitId} status set to ${newStatus.toUpperCase()}` });
  };

  const driverColumns = [
    { key: 'name', title: 'Driver Name' },
    { key: 'license', title: 'License #' },
    { key: 'assignedUnit', title: 'Assigned Vehicle' },
    { key: 'rating', title: 'Driver Rating' },
    {
      key: 'ecoScore',
      title: 'Eco-Driving Score',
      render: (row) => (
        <Badge variant={row.ecoScore >= 90 ? 'success' : 'info'} dot>
          {row.ecoScore} / 100 🍃
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'on_duty' ? 'success' : 'neutral'} dot>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  const maintenanceColumns = [
    { key: 'id', title: 'Ticket ID' },
    { key: 'unit', title: 'Fleet Unit' },
    { key: 'title', title: 'Issue Description' },
    {
      key: 'priority',
      title: 'Priority',
      render: (row) => (
        <Badge
          variant={row.priority === 'high' ? 'danger' : row.priority === 'medium' ? 'warning' : 'neutral'}
          size="sm"
        >
          {row.priority.toUpperCase()}
        </Badge>
      ),
    },
    { key: 'cost', title: 'Est. Cost' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'resolved' ? 'success' : 'warning'} dot>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    { key: 'date', title: 'Date Logged' },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-surface-800 to-primary-950/80 border border-purple-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🚛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Commercial Fleet Management Module
              </h1>
              <Badge variant="primary" dot pulse>AI Schedule Synced</Badge>
            </div>
            <p className="text-surface-400 text-xs md:text-sm mt-1">
              Fleet Manager: <span className="text-white font-medium">{user?.name || 'Logistics Admin'}</span> •{' '}
              {totalFleetCount} Commercial Electric Units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="md" onClick={() => setIsAddDriverModalOpen(true)}>
            + Add Driver
          </Button>
          <Button variant="secondary" size="md" onClick={() => setIsAssignDriverModalOpen(true)}>
            👨‍✈️ Assign Driver
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsAddFleetModalOpen(true)}>
            🚛 Register Fleet EV
          </Button>
        </div>
      </div>

      {/* Key Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Fleet Vehicles"
          value={`${totalFleetCount} Units`}
          change={`${activeCount} Active / In Transit`}
          changeType="increase"
          periodText="commercial fleet"
          badgeText="Active Fleet"
          badgeVariant="primary"
          icon={<span className="text-xl">🚛</span>}
        />
        <StatCard
          title="Average Fleet Battery SoC"
          value={`${avgSoc}%`}
          change={`${chargingCount} Charging`}
          changeType="increase"
          periodText="pack level"
          badgeText="Healthy"
          badgeVariant="success"
          icon={<span className="text-xl">🔋</span>}
        />
        <StatCard
          title="AI Charge Schedule Sync"
          value="96.8%"
          change="Off-Peak Solar/Wind"
          changeType="increase"
          periodText="optimized charging"
          badgeText="Optimal"
          badgeVariant="info"
          icon={<span className="text-xl">📅</span>}
        />
        <StatCard
          title="Monthly Carbon Savings"
          value="18.2 Tons"
          change="vs Diesel Fleet"
          changeType="increase"
          periodText="zero emission"
          badgeText="Clean Fleet"
          badgeVariant="success"
          icon={<span className="text-xl">🌿</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'fleet'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🚛 Fleet Roster & Live Status ({fleetVehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'drivers'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          👨‍✈️ Drivers & Assignments ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📅 Optimized Charging Schedule
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🛠️ Maintenance ({maintenanceTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📈 Fleet Performance & Reports
        </button>
      </div>

      {/* TAB 1: Fleet Roster & Live Status Simulator */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetVehicles.map((unit) => (
            <Card key={unit.id} variant="glass" padding="normal" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono text-purple-400 font-bold">{unit.unitNumber}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{unit.make} {unit.model}</h3>
                    <p className="text-xs text-surface-400 font-mono">Plate: {unit.plate}</p>
                  </div>
                  <Badge
                    variant={
                      unit.status === 'in_transit'
                        ? 'info'
                        : unit.status === 'charging'
                        ? 'primary'
                        : unit.status === 'idle'
                        ? 'success'
                        : 'warning'
                    }
                    dot
                    pulse={unit.status === 'charging' || unit.status === 'in_transit'}
                  >
                    {unit.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 py-3 my-3 border-y border-surface-700/50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-surface-400">Assigned Driver:</span>
                    <span className="text-white font-semibold">{unit.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Battery SoC:</span>
                    <span className="text-emerald-400 font-bold">{unit.soc}%</span>
                  </div>
                  <div className="w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${unit.soc}%` }} />
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-surface-400">Charging Priority:</span>
                    <span className="text-amber-400 font-bold uppercase">{unit.priority}</span>
                  </div>
                </div>
              </div>

              {/* Live Status Simulator Actions */}
              <div className="pt-3 mt-2 border-t border-surface-700/50">
                <span className="text-[10px] text-surface-400 block mb-2 uppercase font-semibold">Simulate Live Status</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleSimulateStatus(unit.id, 'in_transit')}
                    className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700"
                  >
                    🚛 In Transit
                  </button>
                  <button
                    onClick={() => handleSimulateStatus(unit.id, 'charging')}
                    className="p-1.5 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 font-semibold"
                  >
                    ⚡ Charging
                  </button>
                  <button
                    onClick={() => handleSimulateStatus(unit.id, 'idle')}
                    className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700"
                  >
                    🅿️ Idle
                  </button>
                  <button
                    onClick={() => handleSimulateStatus(unit.id, 'maintenance')}
                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                  >
                    🛠️ Maint.
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: Drivers & Assignments Table */}
      {activeTab === 'drivers' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Commercial Fleet Drivers Directory</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsAssignDriverModalOpen(true)}>
                👨‍✈️ Assign Driver to Unit
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsAddDriverModalOpen(true)}>
                + Register Driver
              </Button>
            </div>
          </div>
          <Table columns={driverColumns} data={drivers} />
        </section>
      )}

      {/* TAB 3: Optimized Charging Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-primary-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">AI-Matched Renewable Charging Schedule</h3>
              <p className="text-xs text-surface-400 mt-1">
                Fleet charge windows are automatically prioritized during peak solar (12:00 - 15:00) and wind (22:00 - 04:00) windows to minimize grid tariffs.
              </p>
            </div>
            <Badge variant="success" dot pulse>96.8% Clean Sync</Badge>
          </div>

          <div className="space-y-3">
            {fleetVehicles.map((unit) => (
              <div key={unit.id} className="p-4 rounded-xl glass-card border border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-purple-400 font-bold">{unit.unitNumber}</span>
                    <span className="text-white font-bold">{unit.make} {unit.model}</span>
                    <Badge variant="primary" size="sm">{unit.priority.toUpperCase()}</Badge>
                  </div>
                  <p className="text-surface-400 mt-1">Assigned Driver: <span className="text-white">{unit.driver}</span> • SoC: <span className="text-emerald-400 font-bold">{unit.soc}%</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-surface-400 block text-[11px]">Optimal Window</span>
                    <span className="text-primary-400 font-bold">{unit.scheduleTime}</span>
                  </div>
                  <Button variant="outline" size="sm">Modify Window</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Fleet Maintenance Logs */}
      {activeTab === 'maintenance' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Fleet Maintenance Tickets</h2>
            <Button variant="primary" size="sm" onClick={() => setIsMaintenanceModalOpen(true)}>
              + File Maintenance Ticket
            </Button>
          </div>
          <Table columns={maintenanceColumns} data={maintenanceTickets} />
        </section>
      )}

      {/* TAB 5: Fleet Analytics & Performance Reports */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader
                title="Monthly Fleet Energy Consumption & Carbon Offsets"
                subtitle="kWh power draw vs tons of CO2 offset compared to commercial diesel fleet"
              />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fleetAnalyticsData}>
                    <defs>
                      <linearGradient id="energyColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="co2Color" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e65c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00e65c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="energyKwh" name="Energy Consumed (kWh)" stroke="#8b5cf6" fillOpacity={1} fill="url(#energyColor)" />
                    <Area type="monotone" dataKey="co2SavedTons" name="CO2 Saved (Tons)" stroke="#00e65c" fillOpacity={1} fill="url(#co2Color)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader title="Fleet Operating Cost Savings ($)" subtitle="Fuel cost savings vs diesel" />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" $" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Bar dataKey="costSavings" name="Monthly Cost Savings ($)" fill="#00e65c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Register Fleet EV */}
      <Modal
        isOpen={isAddFleetModalOpen}
        onClose={() => setIsAddFleetModalOpen(false)}
        title="Register Commercial Fleet EV"
        subtitle="Add a new commercial vehicle to your logistics fleet"
      >
        <form onSubmit={handleRegisterFleetVehicle} className="space-y-4 py-2">
          <Input
            label="Fleet Name"
            required
            value={fleetFormData.fleetName}
            onChange={(e) => setFleetFormData({ ...fleetFormData, fleetName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fleet Unit Number"
              required
              placeholder="e.g. UNIT-105"
              value={fleetFormData.fleetUnitNumber}
              onChange={(e) => setFleetFormData({ ...fleetFormData, fleetUnitNumber: e.target.value })}
            />
            <Input
              label="License Plate"
              required
              placeholder="e.g. EV-901-CA"
              value={fleetFormData.licensePlate}
              onChange={(e) => setFleetFormData({ ...fleetFormData, licensePlate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Make"
              required
              value={fleetFormData.make}
              onChange={(e) => setFleetFormData({ ...fleetFormData, make: e.target.value })}
            />
            <Input
              label="Model"
              required
              value={fleetFormData.model}
              onChange={(e) => setFleetFormData({ ...fleetFormData, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Charging Priority"
              value={fleetFormData.chargingPriority}
              onChange={(e) => setFleetFormData({ ...fleetFormData, chargingPriority: e.target.value })}
              options={[
                { value: 'high', label: 'High Priority (Express)' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low Priority (Standard)' },
                { value: 'scheduled_window', label: 'Scheduled Clean Window' },
              ]}
            />
            <Input
              label="Preferred Start Time"
              value={fleetFormData.preferredChargeStartTime}
              onChange={(e) => setFleetFormData({ ...fleetFormData, preferredChargeStartTime: e.target.value })}
              placeholder="e.g. 22:00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAddFleetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Fleet EV
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Create Driver Profile */}
      <Modal
        isOpen={isAddDriverModalOpen}
        onClose={() => setIsAddDriverModalOpen(false)}
        title="Register Commercial Driver"
        subtitle="Add a licensed driver to your commercial fleet roster"
      >
        <form onSubmit={handleCreateDriver} className="space-y-4 py-2">
          <Input
            label="Driver Full Name"
            required
            value={driverFormData.name}
            onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={driverFormData.email}
            onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Driver License Number"
              required
              value={driverFormData.licenseNumber}
              onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
            />
            <Input
              label="License Expiration Date"
              type="date"
              required
              value={driverFormData.licenseExpirationDate}
              onChange={(e) => setDriverFormData({ ...driverFormData, licenseExpirationDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAddDriverModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Driver Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Assign Driver */}
      <Modal
        isOpen={isAssignDriverModalOpen}
        onClose={() => setIsAssignDriverModalOpen(false)}
        title="Assign Driver to Fleet Unit"
        subtitle="Match an active driver with a commercial fleet EV"
      >
        <form onSubmit={handleAssignDriver} className="space-y-4 py-2">
          <Select
            label="Select Fleet Unit"
            value={assignFormData.fleetVehicleId}
            onChange={(e) => setAssignFormData({ ...assignFormData, fleetVehicleId: e.target.value })}
            options={fleetVehicles.map((fv) => ({ value: fv.id, label: `${fv.unitNumber} (${fv.make} ${fv.model})` }))}
          />
          <Select
            label="Select Commercial Driver"
            value={assignFormData.driverId}
            onChange={(e) => setAssignFormData({ ...assignFormData, driverId: e.target.value })}
            options={drivers.map((d) => ({ value: d.id, label: `${d.name} (${d.license})` }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAssignDriverModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Driver Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: File Maintenance Ticket */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="File Maintenance Ticket"
        subtitle="Log issue or routine service for a fleet vehicle"
      >
        <form onSubmit={handleFileMaintenance} className="space-y-4 py-2">
          <Select
            label="Target Fleet Unit"
            value={maintenanceFormData.vehicleId}
            onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, vehicleId: e.target.value })}
            options={fleetVehicles.map((fv) => ({ value: fv.id, label: `${fv.unitNumber} — ${fv.make} ${fv.model}` }))}
          />
          <Input
            label="Issue Title"
            required
            value={maintenanceFormData.title}
            onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, title: e.target.value })}
          />
          <Input
            label="Detailed Description"
            required
            value={maintenanceFormData.description}
            onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={maintenanceFormData.priority}
              onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low (Routine Inspection)' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High (Immediate Repair Needed)' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
            <Input
              label="Estimated Cost ($)"
              type="number"
              value={maintenanceFormData.estimatedCost}
              onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, estimatedCost: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              File Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
