import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import energyService from '@services/energyService';
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
 * Renewable Energy Generator Module — Production Ready with Real Supabase DB Integration.
 */
export default function EnergyOverview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'generators' | 'transactions'
  const [isAddGeneratorModalOpen, setIsAddGeneratorModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Dynamic API State (Strictly from Supabase DB — No Mock Data)
  const [generators, setGenerators] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Loading & Submitting States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [uploadData, setUploadData] = useState({
    generatorId: '',
    energyGeneratedKwh: '450',
    peakOutputKw: '380',
  });

  const [newGenData, setNewGenData] = useState({
    name: '',
    type: 'solar',
    capacityKw: '1000',
    tariffRatePerKwh: '0.15',
    address: '',
    city: '',
    gridConnection: 'grid',
  });

  // ─── Fetch All Energy Generator Data from Backend API ───────────────────────
  const loadEnergyData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Generators
      const gRes = await energyService.getGenerators();
      const fetchedGens = gRes.data?.generators || [];
      setGenerators(fetchedGens);
      if (fetchedGens.length > 0 && !uploadData.generatorId) {
        setUploadData((prev) => ({ ...prev, generatorId: fetchedGens[0].id }));
      }

      // 2. Fetch Transactions
      const tRes = await energyService.getTransactions();
      setTransactions(tRes.data?.transactions || []);

      // 3. Fetch Analytics Summary
      const aRes = await energyService.getAnalytics();
      setAnalytics(aRes.data || null);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Sync Warning',
        message: err.message || 'Could not fetch live energy grid data from Supabase.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnergyData();
  }, [loadEnergyData]);

  // ─── Register Generator Handler ──────────────────────────────────────────
  const handleRegisterGenerator = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await energyService.createGenerator({
        name: newGenData.name,
        type: newGenData.type,
        capacityKw: parseFloat(newGenData.capacityKw),
        tariffRatePerKwh: parseFloat(newGenData.tariffRatePerKwh),
        locationAddress: newGenData.address,
        locationCity: newGenData.city,
        gridConnection: newGenData.gridConnection,
      });

      setGenerators((prev) => [res.data.generator, ...prev]);
      setIsAddGeneratorModalOpen(false);
      setNewGenData({ name: '', type: 'solar', capacityKw: '1000', tariffRatePerKwh: '0.15', address: '', city: '', gridConnection: 'grid' });
      setNotification({ type: 'success', title: 'Generator Registered! ☀️', message: `${res.data.generator.name} saved in Supabase DB.` });
      loadEnergyData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Registration Failed', message: err.message || 'Could not register facility.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Upload Production Log Handler ───────────────────────────────────────
  const handleUploadProduction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await energyService.uploadProductionLog({
        generatorId: uploadData.generatorId,
        energyProducedKwh: parseFloat(uploadData.energyGeneratedKwh),
        peakOutputKw: parseFloat(uploadData.peakOutputKw),
      });

      setIsUploadModalOpen(false);
      setNotification({ type: 'success', title: 'Energy Production Uploaded ⚡', message: 'Production metrics recorded in Supabase.' });
      loadEnergyData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Upload Failed', message: err.message || 'Could not record production log.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics (Derived purely from DB data)
  const totalCapacityKw = generators.reduce((acc, g) => acc + (g.capacityKw || 0), 0);
  const currentOutputKw = generators.reduce((acc, g) => acc + (g.currentOutputKw || 0), 0);
  const totalRevenue = generators.reduce((acc, g) => acc + (g.totalRevenue || 0), 0);

  const transactionColumns = [
    { key: 'ref', title: 'Tx Reference', render: (row) => <span className="font-mono text-secondary-400 font-bold">{row.transactionReference}</span> },
    { key: 'generator', title: 'Energy Source', render: (row) => row.generator?.name || 'Clean Generator' },
    { key: 'port', title: 'Destination Port', render: (row) => row.chargingPort?.stationName || 'Charging Hub' },
    { key: 'energy', title: 'Energy (kWh)', render: (row) => `${row.energyAmountKwh} kWh` },
    { key: 'rate', title: 'Tariff', render: (row) => `$${row.tariffRatePerKwh} / kWh` },
    { key: 'payout', title: 'Total Cost', render: (row) => <span className="text-emerald-400 font-bold">${row.totalCost}</span> },
    { key: 'status', title: 'Status', render: (row) => <Badge variant="success" dot>{row.status.toUpperCase()}</Badge> },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-2xs shrink-0">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Renewable Energy Generator Portfolio
              </h1>
              <Badge variant="success" dot pulse>Grid Synced</Badge>
            </div>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Operator: <span className="text-slate-900 font-semibold">{user?.name || 'Energy Operator'}</span> •{' '}
              {generators.length} Renewable Facilities Connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" size="md" onClick={() => setIsAddGeneratorModalOpen(true)}>
            + Add Generator Facility
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsUploadModalOpen(true)}>
            ⚡ Upload Production Log
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Clean Capacity"
          value={`${totalCapacityKw} kW`}
          change={`${generators.length} Facilities`}
          changeType="increase"
          periodText="rated capacity"
          badgeText="Max Output"
          badgeVariant="primary"
          icon={<span className="text-xl">⚡</span>}
        />
        <StatCard
          title="Current Live Output"
          value={`${currentOutputKw} kW`}
          change="Real-Time Generation"
          changeType="increase"
          periodText="live generation"
          badgeText="Live Power"
          badgeVariant="success"
          icon={<span className="text-xl">☀️</span>}
        />
        <StatCard
          title="Total Revenue Settled"
          value={`$${totalRevenue.toFixed(2)}`}
          change="Clean Energy Tariff"
          changeType="increase"
          periodText="payout earnings"
          badgeText="Earnings"
          badgeVariant="info"
          icon={<span className="text-xl">💰</span>}
        />
        <StatCard
          title="Settled Transactions"
          value={`${transactions.length} Transactions`}
          change="Grid Dispatched"
          changeType="increase"
          periodText="payout records"
          badgeText="Settled"
          badgeVariant="success"
          icon={<span className="text-xl">📋</span>}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ☀️ Energy Facilities ({generators.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          💰 Settlement Transactions ({transactions.length})
        </button>
      </div>

      {/* TAB 1: Generators Grid */}
      {activeTab === 'overview' && (
        isLoading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span>Loading energy facilities from Supabase DB...</span>
          </div>
        ) : generators.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-4xl block">☀️</span>
            <h3 className="text-lg font-bold text-slate-900">No renewable generators registered.</h3>
            <p className="text-xs text-slate-500">Click "+ Add Generator Facility" above to connect your first solar or wind array.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generators.map((gen) => (
              <Card key={gen.id} variant="solid" padding="normal" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono text-emerald-800 uppercase font-bold">{gen.type}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{gen.name}</h3>
                    </div>
                    <Badge variant={gen.status === 'active' ? 'success' : 'warning'} dot>
                      {gen.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2 py-3 my-3 border-y border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity:</span>
                      <span className="text-slate-900 font-bold">{gen.capacityKw} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Output:</span>
                      <span className="text-emerald-800 font-bold">{gen.currentOutputKw} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tariff Rate:</span>
                      <span className="text-slate-900 font-semibold">${gen.tariffRatePerKwh} / kWh</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* TAB 2: Settlement Transactions */}
      {activeTab === 'transactions' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Settlement Transactions</h2>
            <Badge variant="success">Energy Payouts</Badge>
          </div>
          <Table
            columns={transactionColumns}
            data={transactions}
            emptyMessage="No energy settlement transactions."
          />
        </section>
      )}


      {/* MODAL 1: Add Generator Facility */}
      <Modal
        isOpen={isAddGeneratorModalOpen}
        onClose={() => setIsAddGeneratorModalOpen(false)}
        title="Add Renewable Energy Generator Facility"
        subtitle="Register a solar, wind, or hydro clean power facility"
      >
        <form onSubmit={handleRegisterGenerator} className="space-y-4 py-2">
          <Input
            label="Facility Name"
            required
            placeholder="e.g. Desert Sun Solar Array Alpha"
            value={newGenData.name}
            onChange={(e) => setNewGenData({ ...newGenData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Energy Source Type"
              value={newGenData.type}
              onChange={(e) => setNewGenData({ ...newGenData, type: e.target.value })}
              options={[
                { value: 'solar', label: 'Solar Photovoltaic' },
                { value: 'wind', label: 'Wind Turbine' },
                { value: 'hydro', label: 'Hydroelectric' },
                { value: 'biomass', label: 'Biomass Energy' },
              ]}
            />
            <Input
              label="Rated Capacity (kW)"
              type="number"
              required
              placeholder="e.g. 1200"
              value={newGenData.capacityKw}
              onChange={(e) => setNewGenData({ ...newGenData, capacityKw: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tariff Rate ($ / kWh)"
              type="number"
              required
              placeholder="e.g. 0.16"
              value={newGenData.tariffRatePerKwh}
              onChange={(e) => setNewGenData({ ...newGenData, tariffRatePerKwh: e.target.value })}
            />
            <Select
              label="Grid Connection Type"
              value={newGenData.gridConnection}
              onChange={(e) => setNewGenData({ ...newGenData, gridConnection: e.target.value })}
              options={[
                { value: 'grid', label: 'Main Utility Grid' },
                { value: 'microgrid', label: 'Dedicated Microgrid' },
                { value: 'hybrid', label: 'Hybrid Clean Feed' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsAddGeneratorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Generator'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Upload Production Log */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Production Log"
        subtitle="Record clean energy output for grid dispatch"
      >
        <form onSubmit={handleUploadProduction} className="space-y-4 py-2">
          <Select
            label="Select Generator Facility"
            value={uploadData.generatorId}
            onChange={(e) => setUploadData({ ...uploadData, generatorId: e.target.value })}
            options={generators.map((g) => ({ value: g.id, label: `${g.name} (${g.capacityKw} kW)` }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Energy Produced (kWh)"
              type="number"
              required
              value={uploadData.energyGeneratedKwh}
              onChange={(e) => setUploadData({ ...uploadData, energyGeneratedKwh: e.target.value })}
            />
            <Input
              label="Peak Power Output (kW)"
              type="number"
              required
              value={uploadData.peakOutputKw}
              onChange={(e) => setUploadData({ ...uploadData, peakOutputKw: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Upload Log'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
