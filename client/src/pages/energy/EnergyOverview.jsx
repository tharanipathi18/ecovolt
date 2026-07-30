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
 * Renewable Energy Generator Module — Complete Dashboard.
 */
export default function EnergyOverview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'generators' | 'transactions'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddGeneratorModalOpen, setIsAddGeneratorModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [uploadData, setUploadData] = useState({
    generatorId: 'GEN-01',
    energyGeneratedKwh: 450,
    peakOutputKw: 380,
    excessEnergyKwh: 320,
    notes: 'Midday solar generation peak upload',
  });

  const [newGenData, setNewGenData] = useState({
    name: '',
    type: 'solar',
    capacityKw: '',
    tariffRatePerKwh: '0.15',
    address: '',
    city: '',
    gridConnection: 'grid',
  });

  // Mock initial facility data
  const [generators, setGenerators] = useState([
    {
      id: 'GEN-01',
      name: 'Desert Sun Solar Array Alpha',
      type: 'solar',
      capacityKw: 1200,
      currentOutputKw: 980,
      excessEnergyKw: 720,
      tariffRatePerKwh: 0.16,
      totalEnergyGeneratedKwh: 45800,
      totalRevenue: 7328.0,
      location: 'Mojave Desert, CA',
      gridConnection: 'grid',
      status: 'active',
    },
    {
      id: 'GEN-02',
      name: 'Highland Wind Farm #4',
      type: 'wind',
      capacityKw: 2500,
      currentOutputKw: 1850,
      excessEnergyKw: 1400,
      tariffRatePerKwh: 0.14,
      totalEnergyGeneratedKwh: 92400,
      totalRevenue: 12936.0,
      location: 'Columbia Gorge, OR',
      gridConnection: 'microgrid',
      status: 'active',
    },
    {
      id: 'GEN-03',
      name: 'Riverbed Hydro Plant',
      type: 'hydro',
      capacityKw: 800,
      currentOutputKw: 750,
      excessEnergyKw: 550,
      tariffRatePerKwh: 0.15,
      totalEnergyGeneratedKwh: 31200,
      totalRevenue: 4680.0,
      location: 'Cascade Region, WA',
      gridConnection: 'hybrid',
      status: 'active',
    },
  ]);

  // Analytics Chart Data
  const generationHistory = [
    { time: '00:00', solar: 0, wind: 1200, hydro: 750, excess: 1400 },
    { time: '04:00', solar: 0, wind: 1400, hydro: 750, excess: 1550 },
    { time: '08:00', solar: 450, wind: 1100, hydro: 750, excess: 1650 },
    { time: '12:00', solar: 1180, wind: 950, hydro: 750, excess: 2200 },
    { time: '16:00', solar: 850, wind: 1300, hydro: 750, excess: 2100 },
    { time: '20:00', solar: 100, wind: 1600, hydro: 750, excess: 1800 },
  ];

  const revenueByFacility = generators.map((g) => ({
    name: g.name.split(' ')[0] + ' ' + g.name.split(' ')[1],
    revenue: g.totalRevenue,
    capacity: g.capacityKw,
  }));

  // Settlement Transactions Data
  const [transactions, setTransactions] = useState([
    {
      id: 'TX-9012',
      generator: 'Desert Sun Solar Array Alpha',
      port: 'Downtown Solar Charging Hub #1',
      energy: '420 kWh',
      rate: '$0.16 / kWh',
      payout: '$67.20',
      status: 'settled',
      timestamp: 'Today, 14:35',
    },
    {
      id: 'TX-9013',
      generator: 'Highland Wind Farm #4',
      port: 'Metro Express Charging Station',
      energy: '850 kWh',
      rate: '$0.14 / kWh',
      payout: '$119.00',
      status: 'dispatched',
      timestamp: 'Today, 13:20',
    },
    {
      id: 'TX-9014',
      generator: 'Riverbed Hydro Plant',
      port: 'Suburban Clean Power Hub',
      energy: '310 kWh',
      rate: '$0.15 / kWh',
      payout: '$46.50',
      status: 'allocated',
      timestamp: 'Today, 11:05',
    },
  ]);

  // Aggregate Metrics Calculations
  const totalCapacityKw = generators.reduce((acc, g) => acc + g.capacityKw, 0);
  const totalCurrentOutputKw = generators.reduce((acc, g) => acc + g.currentOutputKw, 0);
  const totalExcessEnergyKw = generators.reduce((acc, g) => acc + g.excessEnergyKw, 0);
  const totalRevenue = generators.reduce((acc, g) => acc + g.totalRevenue, 0);

  // Upload Energy Handler
  const handleUploadEnergy = (e) => {
    e.preventDefault();
    const energyKwh = parseFloat(uploadData.energyGeneratedKwh);
    const peakKw = parseFloat(uploadData.peakOutputKw);
    const excessKwh = parseFloat(uploadData.excessEnergyKwh);

    setGenerators((prev) =>
      prev.map((g) => {
        if (g.id === uploadData.generatorId) {
          const addedRevenue = Number((excessKwh * g.tariffRatePerKwh).toFixed(2));
          return {
            ...g,
            currentOutputKw: peakKw,
            excessEnergyKw: Math.round(peakKw * 0.75),
            totalEnergyGeneratedKwh: g.totalEnergyGeneratedKwh + energyKwh,
            totalRevenue: g.totalRevenue + addedRevenue,
          };
        }
        return g;
      }),
    );

    // Add transaction entry
    const selectedGen = generators.find((g) => g.id === uploadData.generatorId);
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      generator: selectedGen ? selectedGen.name : 'Solar Array',
      port: 'Grid Microgrid Node #12',
      energy: `${excessKwh} kWh`,
      rate: `$${selectedGen ? selectedGen.tariffRatePerKwh : 0.15} / kWh`,
      payout: `$${(excessKwh * (selectedGen ? selectedGen.tariffRatePerKwh : 0.15)).toFixed(2)}`,
      status: 'dispatched',
      timestamp: 'Just now',
    };
    setTransactions([newTx, ...transactions]);

    setIsUploadModalOpen(false);
    setNotification({
      type: 'success',
      title: 'Energy Production Uploaded!',
      message: `Successfully uploaded ${energyKwh} kWh. $${(excessKwh * 0.15).toFixed(2)} revenue logged.`,
    });
  };

  // Add Generator Handler
  const handleAddGenerator = (e) => {
    e.preventDefault();
    const newGen = {
      id: `GEN-0${generators.length + 1}`,
      name: newGenData.name || 'New Solar Generator',
      type: newGenData.type,
      capacityKw: parseFloat(newGenData.capacityKw) || 500,
      currentOutputKw: 0,
      excessEnergyKw: 0,
      tariffRatePerKwh: parseFloat(newGenData.tariffRatePerKwh) || 0.15,
      totalEnergyGeneratedKwh: 0,
      totalRevenue: 0,
      location: `${newGenData.address || 'Site A'}, ${newGenData.city || 'City'}`,
      gridConnection: newGenData.gridConnection,
      status: 'active',
    };
    setGenerators([...generators, newGen]);
    setIsAddGeneratorModalOpen(false);
    setNewGenData({ name: '', type: 'solar', capacityKw: '', tariffRatePerKwh: '0.15', address: '', city: '', gridConnection: 'grid' });
    setNotification({
      type: 'success',
      title: 'Generator Added!',
      message: `${newGen.name} has been successfully registered to your portfolio.`,
    });
  };

  const transactionColumns = [
    { key: 'id', title: 'Tx ID' },
    { key: 'generator', title: 'Source Facility' },
    { key: 'port', title: 'Destination Port / Node' },
    { key: 'energy', title: 'Energy Dispatched' },
    { key: 'rate', title: 'Tariff Rate' },
    { key: 'payout', title: 'Revenue Payout' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge
          variant={row.status === 'settled' ? 'success' : row.status === 'dispatched' ? 'info' : 'warning'}
          dot
          pulse={row.status === 'dispatched'}
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

      {/* Top Banner & Profile Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950/70 via-surface-800 to-primary-950/70 border border-amber-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Renewable Generator Module
              </h1>
              <Badge variant="success" dot pulse>Live Grid Sync</Badge>
            </div>
            <p className="text-surface-400 text-xs md:text-sm mt-1">
              Operator: <span className="text-white font-medium">{user?.name || 'Solar Operator'}</span> •{' '}
              {generators.length} Active Clean Power Facilities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="md" onClick={() => setIsAddGeneratorModalOpen(true)}>
            + Register Facility
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsUploadModalOpen(true)}>
            ⚡ Upload Production Log
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Capacity (Solar/Wind)"
          value={`${totalCapacityKw.toLocaleString()} kW`}
          change={`${generators.length} Facilities`}
          changeType="increase"
          periodText="installed power"
          badgeText="Rated"
          badgeVariant="primary"
          icon={<span className="text-xl">☀️</span>}
        />
        <StatCard
          title="Real-Time Power Output"
          value={`${totalCurrentOutputKw.toLocaleString()} kW`}
          change={`${Math.round((totalCurrentOutputKw / totalCapacityKw) * 100)}% Load`}
          changeType="increase"
          periodText="instant generation"
          badgeText="Live Output"
          badgeVariant="success"
          icon={<span className="text-xl">⚡</span>}
        />
        <StatCard
          title="Excess Available Energy"
          value={`${totalExcessEnergyKw.toLocaleString()} kW`}
          change="Available for EV"
          changeType="increase"
          periodText="grid dispatch ready"
          badgeText="EV Grid Ready"
          badgeVariant="info"
          icon={<span className="text-xl">🔌</span>}
        />
        <StatCard
          title="Total Revenue Earned"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+$186.20 Today"
          changeType="increase"
          periodText="EV dispatch payouts"
          badgeText="Settled"
          badgeVariant="success"
          icon={<span className="text-xl">💰</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          📊 Analytics & Output Curves
        </button>
        <button
          onClick={() => setActiveTab('generators')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'generators'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          🏭 Facilities Portfolio ({generators.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'transactions'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          💳 Settlement Transactions ({transactions.length})
        </button>
      </div>

      {/* TAB 1: Analytics & Output Curves */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generation Area Chart */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader
                title="24-Hour Renewable Output & Excess Energy Curve"
                subtitle="Solar, Wind, and Hydro production matched against EV grid demand"
              />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generationHistory}>
                    <defs>
                      <linearGradient id="solarColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="windColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="excessColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e65c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00e65c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" kW" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="solar" name="Solar Output (kW)" stroke="#f59e0b" fillOpacity={1} fill="url(#solarColor)" />
                    <Area type="monotone" dataKey="wind" name="Wind Output (kW)" stroke="#3b82f6" fillOpacity={1} fill="url(#windColor)" />
                    <Area type="monotone" dataKey="excess" name="Excess Energy for EV (kW)" stroke="#00e65c" fillOpacity={1} fill="url(#excessColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue breakdown by facility */}
            <div className="glass-card p-6 rounded-2xl border border-surface-700/60 flex flex-col justify-between">
              <CardHeader title="Revenue Payout by Facility" subtitle="Earnings from EV dispatch" />
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByFacility}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" $" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px' }} />
                    <Bar dataKey="revenue" name="Total Revenue ($)" fill="#00e65c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Facilities Portfolio */}
      {activeTab === 'generators' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {generators.map((gen) => (
            <Card key={gen.id} variant="glass" padding="normal" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant={gen.type === 'solar' ? 'warning' : 'info'} size="sm">
                      {gen.type.toUpperCase()}
                    </Badge>
                    <h3 className="text-lg font-bold text-white mt-1.5">{gen.name}</h3>
                    <p className="text-xs text-surface-400">📍 {gen.location}</p>
                  </div>
                  <Badge variant={gen.status === 'active' ? 'success' : 'neutral'} dot>
                    {gen.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 my-3 border-y border-surface-700/50 text-xs">
                  <div>
                    <span className="text-surface-400 block">Rated Capacity</span>
                    <span className="text-white font-bold text-sm">{gen.capacityKw} kW</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block">Current Output</span>
                    <span className="text-primary-400 font-bold text-sm">{gen.currentOutputKw} kW</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block">Excess Energy</span>
                    <span className="text-emerald-400 font-bold text-sm">{gen.excessEnergyKw} kW</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block">Tariff Rate</span>
                    <span className="text-secondary-400 font-bold text-sm">${gen.tariffRatePerKwh} / kWh</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-400">Total Revenue:</span>
                  <span className="text-white font-bold">${gen.totalRevenue.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-surface-700/50 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setUploadData({ ...uploadData, generatorId: gen.id });
                    setIsUploadModalOpen(true);
                  }}
                >
                  Upload Production
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: Settlement Transactions Table */}
      {activeTab === 'transactions' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Energy Credit Payout & Settlement Logs</h2>
            <Badge variant="info">Automated Grid Credit</Badge>
          </div>
          <Table columns={transactionColumns} data={transactions} />
        </section>
      )}

      {/* MODAL 1: Upload Energy Production */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Energy Production Log"
        subtitle="Log generated clean power to make excess energy available for EV charging ports"
      >
        <form onSubmit={handleUploadEnergy} className="space-y-4 py-2">
          <Select
            label="Select Generator Facility"
            value={uploadData.generatorId}
            onChange={(e) => setUploadData({ ...uploadData, generatorId: e.target.value })}
            options={generators.map((g) => ({ value: g.id, label: `${g.name} (${g.type.toUpperCase()} - ${g.capacityKw}kW)` }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Energy Generated (kWh)"
              type="number"
              required
              value={uploadData.energyGeneratedKwh}
              onChange={(e) => setUploadData({ ...uploadData, energyGeneratedKwh: e.target.value })}
              placeholder="e.g. 450"
            />
            <Input
              label="Peak Output (kW)"
              type="number"
              required
              value={uploadData.peakOutputKw}
              onChange={(e) => setUploadData({ ...uploadData, peakOutputKw: e.target.value })}
              placeholder="e.g. 380"
            />
          </div>

          <Input
            label="Excess Energy Available for EV Grid (kWh)"
            type="number"
            required
            value={uploadData.excessEnergyKwh}
            onChange={(e) => setUploadData({ ...uploadData, excessEnergyKwh: e.target.value })}
            helperText="Amount of surplus power allocated to nearby EV ports"
          />

          <div className="p-4 rounded-xl bg-surface-800/80 border border-surface-700/80 flex items-center justify-between text-xs">
            <span className="text-surface-400">Calculated Revenue Payout:</span>
            <span className="text-emerald-400 font-bold text-base">
              ${(parseFloat(uploadData.excessEnergyKwh || 0) * 0.15).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Production Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Register New Generator Facility */}
      <Modal
        isOpen={isAddGeneratorModalOpen}
        onClose={() => setIsAddGeneratorModalOpen(false)}
        title="Register Renewable Energy Facility"
        subtitle="Connect solar, wind, hydro or biomass generation asset to EcoVolt"
      >
        <form onSubmit={handleAddGenerator} className="space-y-4 py-2">
          <Input
            label="Facility Name"
            required
            placeholder="e.g. Mojave Solar Station #1"
            value={newGenData.name}
            onChange={(e) => setNewGenData({ ...newGenData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Energy Source Type"
              value={newGenData.type}
              onChange={(e) => setNewGenData({ ...newGenData, type: e.target.value })}
              options={[
                { value: 'solar', label: 'Solar Power' },
                { value: 'wind', label: 'Wind Power' },
                { value: 'hydro', label: 'Hydroelectric' },
                { value: 'biomass', label: 'Biomass' },
              ]}
            />
            <Input
              label="Rated Capacity (kW)"
              type="number"
              required
              placeholder="e.g. 1000"
              value={newGenData.capacityKw}
              onChange={(e) => setNewGenData({ ...newGenData, capacityKw: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              placeholder="e.g. Mojave"
              value={newGenData.city}
              onChange={(e) => setNewGenData({ ...newGenData, city: e.target.value })}
            />
            <Select
              label="Grid Connection Type"
              value={newGenData.gridConnection}
              onChange={(e) => setNewGenData({ ...newGenData, gridConnection: e.target.value })}
              options={[
                { value: 'grid', label: 'Main Power Grid' },
                { value: 'microgrid', label: 'Local Microgrid' },
                { value: 'hybrid', label: 'Hybrid Microgrid' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAddGeneratorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Facility
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
