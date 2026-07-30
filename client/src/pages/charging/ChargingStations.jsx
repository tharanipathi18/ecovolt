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
 * EV Charging Port Module — Complete Dashboard.
 */
export default function ChargingStations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'sessions' | 'queue' | 'reports'
  const [isAddPortModalOpen, setIsAddPortModalOpen] = useState(false);
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [isAllocateEnergyModalOpen, setIsAllocateEnergyModalOpen] = useState(false);
  const [isAddQueueModalOpen, setIsAddQueueModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [sessionFormData, setSessionFormData] = useState({
    chargingPortId: 'CP-101',
    vehicleId: 'VEH-901',
    driverName: 'Alex Smith',
    startStateOfCharge: 25,
  });

  const [allocationFormData, setAllocationFormData] = useState({
    chargingPortId: 'CP-101',
    generatorId: 'GEN-01',
    allocatedKwh: 500,
  });

  const [queueFormData, setQueueFormData] = useState({
    chargingPortId: 'CP-101',
    driverName: 'Sarah Jenkins',
    vehiclePlate: 'EV-992-TX',
  });

  const [newPortData, setNewPortData] = useState({
    stationName: '',
    portIdentifier: '',
    connectorType: 'ccs_2',
    maxPowerOutputKw: '150',
    ratePerKwh: '0.32',
    address: '',
    city: '',
  });

  // Ports Data
  const [ports, setPorts] = useState([
    {
      id: 'CP-101',
      stationName: 'Downtown Solar Hub',
      portIdentifier: 'PORT-A1',
      connectorType: 'ccs_2',
      maxPowerOutputKw: 150,
      currentPowerOutputKw: 120,
      status: 'occupied',
      ratePerKwh: 0.32,
      location: 'Downtown Center, CA',
      activeSession: { driver: 'Alex Smith', soc: 68, energyKwh: 34.2, duration: '28m' },
      linkedGenerator: 'Desert Sun Array Alpha (Solar)',
      renewablePercentage: 94,
    },
    {
      id: 'CP-102',
      stationName: 'Downtown Solar Hub',
      portIdentifier: 'PORT-A2',
      connectorType: 'ccs_2',
      maxPowerOutputKw: 150,
      currentPowerOutputKw: 0,
      status: 'available',
      ratePerKwh: 0.32,
      location: 'Downtown Center, CA',
      activeSession: null,
      linkedGenerator: 'Desert Sun Array Alpha (Solar)',
      renewablePercentage: 94,
    },
    {
      id: 'CP-103',
      stationName: 'Metro Wind Station',
      portIdentifier: 'PORT-B1',
      connectorType: 'tesla',
      maxPowerOutputKw: 250,
      currentPowerOutputKw: 210,
      status: 'occupied',
      ratePerKwh: 0.35,
      location: 'Metro Express Way, NY',
      activeSession: { driver: 'David Chen', soc: 82, energyKwh: 58.0, duration: '35m' },
      linkedGenerator: 'Highland Wind Farm #4 (Wind)',
      renewablePercentage: 88,
    },
    {
      id: 'CP-104',
      stationName: 'Suburban Clean Hub',
      portIdentifier: 'PORT-C1',
      connectorType: 'type_2',
      maxPowerOutputKw: 50,
      currentPowerOutputKw: 0,
      status: 'maintenance',
      ratePerKwh: 0.25,
      location: 'Oak District, TX',
      activeSession: null,
      linkedGenerator: 'Riverbed Hydro Plant (Hydro)',
      renewablePercentage: 75,
    },
  ]);

  // Active & Completed Sessions
  const [sessions, setSessions] = useState([
    { id: 'SES-801', port: 'PORT-A1 (Downtown Solar)', driver: 'Alex Smith', vehicle: 'Tesla Model Y (EV-889-CA)', startSoc: '25%', currentSoc: '68%', energy: '34.2 kWh', cost: '$10.94', status: 'active', cleanRatio: 94 },
    { id: 'SES-802', port: 'PORT-B1 (Metro Wind)', driver: 'David Chen', vehicle: 'Rivian R1T (EV-302-NY)', startSoc: '15%', currentSoc: '82%', energy: '58.0 kWh', cost: '$20.30', status: 'active', cleanRatio: 88 },
    { id: 'SES-800', port: 'PORT-A2 (Downtown Solar)', driver: 'Elena Rostova', vehicle: 'Nissan Leaf (EV-114-TX)', startSoc: '40%', currentSoc: '95%', energy: '22.0 kWh', cost: '$7.04', status: 'completed', cleanRatio: 94 },
  ]);

  // Waiting Queue
  const [queue, setQueue] = useState([
    { id: 'Q-1', position: 1, driver: 'Sarah Jenkins', vehicle: 'Hyundai Ioniq 5 (EV-992-TX)', port: 'PORT-A1', waitTime: '10 mins', status: 'waiting' },
    { id: 'Q-2', position: 2, driver: 'Marcus Brody', vehicle: 'Ford F-150 Lightning (EV-441-CA)', port: 'PORT-A1', waitTime: '25 mins', status: 'waiting' },
  ]);

  // Hourly Analytics
  const hourlyPowerData = [
    { time: '00:00', totalPowerKw: 80, cleanPowerRatio: 75, revenue: 25.6 },
    { time: '04:00', totalPowerKw: 60, cleanPowerRatio: 70, revenue: 19.2 },
    { time: '08:00', totalPowerKw: 280, cleanPowerRatio: 88, revenue: 89.6 },
    { time: '12:00', totalPowerKw: 480, cleanPowerRatio: 95, revenue: 153.6 },
    { time: '16:00', totalPowerKw: 420, cleanPowerRatio: 92, revenue: 134.4 },
    { time: '20:00', totalPowerKw: 310, cleanPowerRatio: 85, revenue: 99.2 },
  ];

  // Metrics
  const totalPortsCount = ports.length;
  const occupiedCount = ports.filter((p) => p.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedCount / totalPortsCount) * 100);
  const totalPowerKw = ports.reduce((acc, p) => acc + p.currentPowerOutputKw, 0);

  // Handlers
  const handleCreatePort = (e) => {
    e.preventDefault();
    const newPort = {
      id: `CP-10${ports.length + 1}`,
      stationName: newPortData.stationName || 'New Charging Station',
      portIdentifier: newPortData.portIdentifier || `PORT-D${ports.length + 1}`,
      connectorType: newPortData.connectorType,
      maxPowerOutputKw: parseFloat(newPortData.maxPowerOutputKw) || 150,
      currentPowerOutputKw: 0,
      status: 'available',
      ratePerKwh: parseFloat(newPortData.ratePerKwh) || 0.32,
      location: `${newPortData.address || 'Central St'}, ${newPortData.city || 'City'}`,
      activeSession: null,
      linkedGenerator: 'Unassigned',
      renewablePercentage: 50,
    };
    setPorts([...ports, newPort]);
    setIsAddPortModalOpen(false);
    setNewPortData({ stationName: '', portIdentifier: '', connectorType: 'ccs_2', maxPowerOutputKw: '150', ratePerKwh: '0.32', address: '', city: '' });
    setNotification({ type: 'success', title: 'Port Registered!', message: `${newPort.portIdentifier} added to ${newPort.stationName}.` });
  };

  const handleStartSession = (e) => {
    e.preventDefault();
    const targetPort = ports.find((p) => p.id === sessionFormData.chargingPortId);
    if (!targetPort) return;

    const newSession = {
      id: `SES-${Math.floor(800 + Math.random() * 200)}`,
      port: `${targetPort.portIdentifier} (${targetPort.stationName})`,
      driver: sessionFormData.driverName,
      vehicle: `EV Vehicle (${sessionFormData.vehicleId})`,
      startSoc: `${sessionFormData.startStateOfCharge}%`,
      currentSoc: `${sessionFormData.startStateOfCharge}%`,
      energy: '0.0 kWh',
      cost: '$0.00',
      status: 'active',
      cleanRatio: targetPort.renewablePercentage,
    };

    setSessions([newSession, ...sessions]);

    setPorts((prev) =>
      prev.map((p) =>
        p.id === targetPort.id
          ? {
              ...p,
              status: 'occupied',
              currentPowerOutputKw: p.maxPowerOutputKw,
              activeSession: { driver: sessionFormData.driverName, soc: sessionFormData.startStateOfCharge, energyKwh: 0, duration: '0m' },
            }
          : p,
      ),
    );

    setIsStartSessionModalOpen(false);
    setNotification({
      type: 'success',
      title: 'Charging Session Started!',
      message: `Port ${targetPort.portIdentifier} is now active for ${sessionFormData.driverName}.`,
    });
  };

  const handleAllocateEnergy = (e) => {
    e.preventDefault();
    const targetPort = ports.find((p) => p.id === allocationFormData.chargingPortId);
    setPorts((prev) =>
      prev.map((p) =>
        p.id === allocationFormData.chargingPortId
          ? { ...p, renewablePercentage: 98, linkedGenerator: 'Direct Solar Feed (Allocated 500 kWh)' }
          : p,
      ),
    );

    setIsAllocateEnergyModalOpen(false);
    setNotification({
      type: 'success',
      title: 'Clean Power Allocated!',
      message: `Allocated ${allocationFormData.allocatedKwh} kWh clean power to ${targetPort?.portIdentifier}.`,
    });
  };

  const handleAddToQueue = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `Q-${queue.length + 1}`,
      position: queue.length + 1,
      driver: queueFormData.driverName,
      vehicle: queueFormData.vehiclePlate,
      port: queueFormData.chargingPortId,
      waitTime: `${(queue.length + 1) * 15} mins`,
      status: 'waiting',
    };
    setQueue([...queue, newEntry]);
    setIsAddQueueModalOpen(false);
    setNotification({
      type: 'success',
      title: 'Driver Queued!',
      message: `${queueFormData.driverName} added to waiting queue (Position #${newEntry.position}).`,
    });
  };

  const handleToggleMaintenance = (portId) => {
    setPorts((prev) =>
      prev.map((p) =>
        p.id === portId
          ? { ...p, status: p.status === 'maintenance' ? 'available' : 'maintenance', currentPowerOutputKw: 0 }
          : p,
      ),
    );
    setNotification({
      type: 'info',
      title: 'Port Status Updated',
      message: `Port ${portId} status updated.`,
    });
  };

  const sessionColumns = [
    { key: 'id', title: 'Session ID' },
    { key: 'port', title: 'Charging Port' },
    { key: 'driver', title: 'Driver' },
    { key: 'vehicle', title: 'EV Vehicle' },
    { key: 'currentSoc', title: 'Battery SoC' },
    { key: 'energy', title: 'Delivered (kWh)' },
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
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'info' : 'success'} dot pulse={row.status === 'active'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  const queueColumns = [
    { key: 'position', title: 'Queue #' },
    { key: 'driver', title: 'Driver Name' },
    { key: 'vehicle', title: 'Vehicle Plate' },
    { key: 'port', title: 'Requested Port' },
    { key: 'waitTime', title: 'Est. Wait Time' },
    {
      key: 'status',
      title: 'Action',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setQueue(queue.filter((q) => q.id !== row.id));
            setNotification({ type: 'success', title: 'Driver Called!', message: `${row.driver} called to charging bay.` });
          }}
        >
          Call to Bay
        </Button>
      ),
    },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-secondary-950/80 via-surface-800 to-primary-950/80 border border-secondary-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary-500/10 border border-secondary-500/30 text-secondary-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🔌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                EV Charging Infrastructure Module
              </h1>
              <Badge variant="success" dot pulse>Grid Synced</Badge>
            </div>
            <p className="text-surface-400 text-xs md:text-sm mt-1">
              Operator: <span className="text-white font-medium">{user?.name || 'Port Operator'}</span> •{' '}
              {totalPortsCount} Managed Charging Connectors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" size="md" onClick={() => setIsAddPortModalOpen(true)}>
            + Register Port
          </Button>
          <Button variant="outline" size="md" onClick={() => setIsAllocateEnergyModalOpen(true)}>
            🌱 Allocate Clean Energy
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsStartSessionModalOpen(true)}>
            ⚡ Start Session
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Slots Managed"
          value={`${totalPortsCount} Connectors`}
          change={`${occupiedCount} Currently Occupied`}
          changeType="increase"
          periodText="active ports"
          badgeText="Active Network"
          badgeVariant="primary"
          icon={<span className="text-xl">🔌</span>}
        />
        <StatCard
          title="Port Occupancy Rate"
          value={`${occupancyRate}%`}
          change={`${occupiedCount} / ${totalPortsCount} Slots`}
          changeType="increase"
          periodText="utilization index"
          badgeText="High Usage"
          badgeVariant="warning"
          icon={<span className="text-xl">📊</span>}
        />
        <StatCard
          title="Real-Time Power Draw"
          value={`${totalPowerKw} kW`}
          change="Max 600 kW Capacity"
          changeType="increase"
          periodText="active load"
          badgeText="Live Draw"
          badgeVariant="info"
          icon={<span className="text-xl">⚡</span>}
        />
        <StatCard
          title="Renewable Matching Ratio"
          value="91.4%"
          change="Direct Green Supply"
          changeType="increase"
          periodText="solar/wind synced"
          badgeText="Clean Power"
          badgeVariant="success"
          icon={<span className="text-xl">🌱</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'slots'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🔌 Charging Slots ({ports.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ⚡ Sessions Log ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          ⏳ Waiting Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📈 Clean Energy & Revenue Reports
        </button>
      </div>

      {/* TAB 1: Charging Slots Grid */}
      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ports.map((port) => (
            <Card key={port.id} variant="glass" padding="normal" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono text-secondary-400">{port.portIdentifier}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{port.stationName}</h3>
                  </div>
                  <Badge
                    variant={
                      port.status === 'available'
                        ? 'success'
                        : port.status === 'occupied'
                        ? 'info'
                        : 'warning'
                    }
                    dot
                    pulse={port.status === 'occupied'}
                  >
                    {port.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 py-3 my-3 border-y border-surface-700/50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-surface-400">Connector:</span>
                    <span className="text-white font-semibold uppercase">{port.connectorType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Max Rate:</span>
                    <span className="text-primary-400 font-bold">{port.maxPowerOutputKw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Tariff:</span>
                    <span className="text-white font-semibold">${port.ratePerKwh} / kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Clean Power Sync:</span>
                    <span className="text-emerald-400 font-bold">{port.renewablePercentage}% Clean</span>
                  </div>
                </div>

                {port.activeSession && (
                  <div className="p-3 rounded-xl bg-surface-800/60 border border-surface-700/60 space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-surface-300">{port.activeSession.driver}</span>
                      <span className="text-primary-400">{port.activeSession.soc}% SoC</span>
                    </div>
                    <div className="w-full bg-surface-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary-500 h-full" style={{ width: `${port.activeSession.soc}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-surface-700/50 flex flex-col gap-2">
                {port.status === 'available' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSessionFormData({ ...sessionFormData, chargingPortId: port.id });
                      setIsStartSessionModalOpen(true);
                    }}
                  >
                    Start Charging Session
                  </Button>
                )}
                {port.status === 'occupied' && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setPorts((prev) =>
                        prev.map((p) => (p.id === port.id ? { ...p, status: 'available', currentPowerOutputKw: 0, activeSession: null } : p)),
                      );
                      setNotification({ type: 'success', title: 'Session Ended', message: `Port ${port.portIdentifier} is now available.` });
                    }}
                  >
                    Stop & Release Port
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => handleToggleMaintenance(port.id)}
                >
                  {port.status === 'maintenance' ? 'Re-enable Port' : 'Mark Maintenance'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: Active Sessions & History Table */}
      {activeTab === 'sessions' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Charging Sessions Log</h2>
            <Badge variant="info">Live Telemetry Monitoring</Badge>
          </div>
          <Table columns={sessionColumns} data={sessions} />
        </section>
      )}

      {/* TAB 3: Waiting Queue Management */}
      {activeTab === 'queue' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Waiting Driver Queue</h2>
            <Button variant="primary" size="sm" onClick={() => setIsAddQueueModalOpen(true)}>
              + Add Driver to Queue
            </Button>
          </div>
          <Table columns={queueColumns} data={queue} emptyMessage="No drivers in queue" />
        </section>
      )}

      {/* TAB 4: Clean Energy & Revenue Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader
                title="Hourly Power Draw & Clean Energy Matching Curve"
                subtitle="kW delivered to ports vs percentage of renewable energy allocated from Solar/Wind"
              />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyPowerData}>
                    <defs>
                      <linearGradient id="powerColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ratioColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e65c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00e65c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" kW" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="totalPowerKw" name="Port Load (kW)" stroke="#3b82f6" fillOpacity={1} fill="url(#powerColor)" />
                    <Area type="monotone" dataKey="cleanPowerRatio" name="Clean Energy Sync (%)" stroke="#00e65c" fillOpacity={1} fill="url(#ratioColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader title="Revenue Collected per Port" subtitle="Session earnings breakdown" />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPowerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" $" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#00e65c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create Charging Port */}
      <Modal
        isOpen={isAddPortModalOpen}
        onClose={() => setIsAddPortModalOpen(false)}
        title="Register Charging Port / Connector"
        subtitle="Add a new physical charging connector to your station portfolio"
      >
        <form onSubmit={handleCreatePort} className="space-y-4 py-2">
          <Input
            label="Station Name"
            required
            placeholder="e.g. Downtown Clean Charging Hub"
            value={newPortData.stationName}
            onChange={(e) => setNewPortData({ ...newPortData, stationName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Port Identifier"
              required
              placeholder="e.g. PORT-A3"
              value={newPortData.portIdentifier}
              onChange={(e) => setNewPortData({ ...newPortData, portIdentifier: e.target.value })}
            />
            <Select
              label="Connector Standard"
              value={newPortData.connectorType}
              onChange={(e) => setNewPortData({ ...newPortData, connectorType: e.target.value })}
              options={[
                { value: 'ccs_2', label: 'CCS Combo 2 (DC Fast)' },
                { value: 'ccs_1', label: 'CCS Combo 1 (DC Fast)' },
                { value: 'type_2', label: 'Type 2 Mennekes (AC)' },
                { value: 'tesla', label: 'Tesla Supercharger' },
                { value: 'chademo', label: 'CHAdeMO' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Output Power (kW)"
              type="number"
              required
              placeholder="e.g. 150"
              value={newPortData.maxPowerOutputKw}
              onChange={(e) => setNewPortData({ ...newPortData, maxPowerOutputKw: e.target.value })}
            />
            <Input
              label="Tariff Rate ($ / kWh)"
              type="number"
              required
              placeholder="e.g. 0.32"
              value={newPortData.ratePerKwh}
              onChange={(e) => setNewPortData({ ...newPortData, ratePerKwh: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAddPortModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Charging Connector
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Start Charging Session */}
      <Modal
        isOpen={isStartSessionModalOpen}
        onClose={() => setIsStartSessionModalOpen(false)}
        title="Start EV Charging Session"
        subtitle="Initiate power delivery for an EV vehicle"
      >
        <form onSubmit={handleStartSession} className="space-y-4 py-2">
          <Select
            label="Select Charging Port"
            value={sessionFormData.chargingPortId}
            onChange={(e) => setSessionFormData({ ...sessionFormData, chargingPortId: e.target.value })}
            options={ports.map((p) => ({ value: p.id, label: `${p.portIdentifier} — ${p.stationName} (${p.maxPowerOutputKw} kW)` }))}
          />

          <Input
            label="Driver Name"
            required
            value={sessionFormData.driverName}
            onChange={(e) => setSessionFormData({ ...sessionFormData, driverName: e.target.value })}
            placeholder="e.g. Alex Smith"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vehicle License Plate"
              required
              value={sessionFormData.vehicleId}
              onChange={(e) => setSessionFormData({ ...sessionFormData, vehicleId: e.target.value })}
              placeholder="e.g. EV-889-CA"
            />
            <Input
              label="Initial Battery SoC (%)"
              type="number"
              required
              value={sessionFormData.startStateOfCharge}
              onChange={(e) => setSessionFormData({ ...sessionFormData, startStateOfCharge: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsStartSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Initiate Charging Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Renewable Energy Allocation Screen */}
      <Modal
        isOpen={isAllocateEnergyModalOpen}
        onClose={() => setIsAllocateEnergyModalOpen(false)}
        title="Renewable Energy Allocation Screen"
        subtitle="Allocate clean energy credits from solar/wind generators directly to charging ports"
      >
        <form onSubmit={handleAllocateEnergy} className="space-y-4 py-2">
          <Select
            label="Select Clean Energy Generator Source"
            value={allocationFormData.generatorId}
            onChange={(e) => setAllocationFormData({ ...allocationFormData, generatorId: e.target.value })}
            options={[
              { value: 'GEN-01', label: 'Desert Sun Solar Array Alpha (1,200 kW Solar)' },
              { value: 'GEN-02', label: 'Highland Wind Farm #4 (2,500 kW Wind)' },
              { value: 'GEN-03', label: 'Riverbed Hydro Plant (800 kW Hydro)' },
            ]}
          />

          <Select
            label="Target Charging Port"
            value={allocationFormData.chargingPortId}
            onChange={(e) => setAllocationFormData({ ...allocationFormData, chargingPortId: e.target.value })}
            options={ports.map((p) => ({ value: p.id, label: `${p.portIdentifier} — ${p.stationName}` }))}
          />

          <Input
            label="Allocated Energy Credits (kWh)"
            type="number"
            required
            value={allocationFormData.allocatedKwh}
            onChange={(e) => setAllocationFormData({ ...allocationFormData, allocatedKwh: parseInt(e.target.value) })}
            helperText="Green energy credits to be assigned for zero-carbon charging"
          />

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            ✨ Allocating clean power guarantees 98%+ renewable matching for vehicles charging at this port.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAllocateEnergyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Clean Allocation
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Add Vehicle to Queue */}
      <Modal
        isOpen={isAddQueueModalOpen}
        onClose={() => setIsAddQueueModalOpen(false)}
        title="Add Vehicle to Waiting Queue"
        subtitle="Queue an EV for the next available charging slot"
      >
        <form onSubmit={handleAddToQueue} className="space-y-4 py-2">
          <Input
            label="Driver Name"
            required
            value={queueFormData.driverName}
            onChange={(e) => setQueueFormData({ ...queueFormData, driverName: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
          />

          <Input
            label="Vehicle License Plate"
            required
            value={queueFormData.vehiclePlate}
            onChange={(e) => setQueueFormData({ ...queueFormData, vehiclePlate: e.target.value })}
            placeholder="e.g. EV-992-TX"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAddQueueModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add to Queue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
