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
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Dynamic API State (Strictly from Supabase DB — No Mock Data)
  const [generators, setGenerators] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

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
    locationAddress: '',
    locationCity: '',
    gridConnection: 'grid',
  });

  const [newOfferData, setNewOfferData] = useState({
    generatorId: '',
    energyAmountKwh: '1000',
    pricePerKwh: '0.15',
    minPurchaseKwh: '10',
  });

  // ─── Fetch All Energy Generator Data from Backend API ───────────────────────
  const loadEnergyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [gRes, tRes, aRes, oRes, rRes] = await Promise.all([
        energyService.getGenerators(),
        energyService.getTransactions(),
        energyService.getAnalytics(),
        energyService.getMyOffers(),
        energyService.getReceivedRequests(),
      ]);
      const fetchedGens = gRes.data?.generators || [];
      setGenerators(fetchedGens);
      if (fetchedGens.length > 0) {
        if (!uploadData.generatorId) setUploadData((prev) => ({ ...prev, generatorId: fetchedGens[0].id }));
        if (!newOfferData.generatorId) setNewOfferData((prev) => ({ ...prev, generatorId: fetchedGens[0].id }));
      }

      setTransactions(tRes.data?.transactions || []);
      setAnalytics(aRes.data || null);
      setMyOffers(oRes.data?.offers || []);
      setReceivedRequests(rRes.data?.requests || []);
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

    if (!newGenData.name?.trim()) {
      setNotification({ type: 'error', title: 'Validation Error', message: 'Generator name is required.' });
      return;
    }

    if (!newGenData.locationAddress?.trim()) {
      setNotification({ type: 'error', title: 'Validation Error', message: 'Location address is required.' });
      return;
    }

    if (!newGenData.locationCity?.trim()) {
      setNotification({ type: 'error', title: 'Validation Error', message: 'Location city is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await energyService.createGenerator({
        name: newGenData.name.trim(),
        type: newGenData.type,
        capacityKw: parseFloat(newGenData.capacityKw),
        tariffRatePerKwh: parseFloat(newGenData.tariffRatePerKwh),
        locationAddress: newGenData.locationAddress.trim(),
        locationCity: newGenData.locationCity.trim(),
        gridConnection: newGenData.gridConnection,
      });

      setGenerators((prev) => [res.data.generator, ...prev]);
      setIsAddGeneratorModalOpen(false);
      setNewGenData({ name: '', type: 'solar', capacityKw: '1000', tariffRatePerKwh: '0.15', locationAddress: '', locationCity: '', gridConnection: 'grid' });
      setNotification({ type: 'success', title: 'Generator Registered! ☀️', message: `${res.data.generator.name} saved in Supabase DB.` });
      loadEnergyData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Registration Failed', message: err.message || err.response?.data?.message || 'Could not register facility.' });
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

  // ─── Create Energy Offer Handler ─────────────────────────────────────────
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!newOfferData.generatorId) {
      setNotification({ type: 'error', title: 'Validation Error', message: 'Select a generator facility.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await energyService.createOffer({
        generatorId: newOfferData.generatorId,
        energyAmountKwh: parseFloat(newOfferData.energyAmountKwh),
        pricePerKwh: parseFloat(newOfferData.pricePerKwh),
        minPurchaseKwh: parseFloat(newOfferData.minPurchaseKwh || 10),
      });

      setIsCreateOfferModalOpen(false);
      setNotification({ type: 'success', title: 'Energy Offer Published! ⚡', message: 'Offer is now live on the Energy Marketplace.' });
      loadEnergyData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Offer Failed', message: err.message || 'Could not publish energy offer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Respond to Purchase Request Handler ─────────────────────────────────
  const handleRespondRequest = async (requestId, status) => {
    setIsSubmitting(true);
    try {
      await energyService.updateRequestStatus(requestId, status);
      setNotification({
        type: status === 'accepted' ? 'success' : 'warning',
        title: status === 'accepted' ? 'Request Accepted! ⚡' : 'Request Declined ❌',
        message: status === 'accepted' ? 'Energy allocated and transaction created.' : 'Purchase request declined.',
      });
      loadEnergyData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Action Failed', message: err.message || 'Could not update request status.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics (Derived purely from DB data)
  const totalCapacityKw = generators.reduce((acc, g) => acc + (g.capacityKw || 0), 0);
  const currentOutputKw = generators.reduce((acc, g) => acc + (g.currentOutputKw || 0), 0);
  const totalRevenue = generators.reduce((acc, g) => acc + (g.totalRevenue || 0), 0);

  const pendingRequestsCount = receivedRequests.filter((r) => r.status === 'pending').length;

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
          <Button variant="secondary" size="md" onClick={() => setIsCreateOfferModalOpen(true)}>
            ⚡ Publish Energy Offer
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
          title="Marketplace Requests"
          value={`${pendingRequestsCount} Pending`}
          change={`${receivedRequests.length} Total Requests`}
          changeType={pendingRequestsCount > 0 ? 'increase' : 'neutral'}
          periodText="buyer requests"
          badgeText="Marketplace"
          badgeVariant="warning"
          icon={<span className="text-xl">🛒</span>}
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
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'marketplace'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>⚡ My Marketplace Offers ({myOffers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>📩 Energy Purchase Requests ({receivedRequests.length})</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold">
              {pendingRequestsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          💰 Sales & Settlement Transactions ({transactions.length})
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
                      <span className="text-slate-500">Location:</span>
                      <span className="text-slate-900 font-semibold">{gen.locationAddress || gen.locationCity || 'San Francisco, CA'}</span>
                    </div>
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

      {/* TAB 2: Marketplace Offers */}
      {activeTab === 'marketplace' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">My Energy Offers</h2>
              <p className="text-xs text-slate-500">Active clean energy lots offered for sale to Charging Port Owners.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsCreateOfferModalOpen(true)}>
              + Publish Energy Offer
            </Button>
          </div>

          {myOffers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-4xl block">⚡</span>
              <h3 className="text-lg font-bold text-slate-900">No renewable energy offers currently published.</h3>
              <p className="text-xs text-slate-500">Click "+ Publish Energy Offer" above to list clean energy for EV Charging Port Owners.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myOffers.map((offer) => (
                <Card key={offer.id} variant="solid" padding="normal" className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-mono text-emerald-800 uppercase font-bold">{offer.generator?.type || 'Clean Energy'}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{offer.generator?.name}</h3>
                      </div>
                      <Badge variant={offer.status === 'active' ? 'success' : 'neutral'} dot>
                        {offer.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2 py-3 my-3 border-y border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available Energy:</span>
                        <span className="text-emerald-800 font-bold text-sm">{offer.availableKwh} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Selling Price:</span>
                        <span className="text-slate-900 font-bold text-sm">${offer.pricePerKwh} / kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min Order:</span>
                        <span className="text-slate-700 font-semibold">{offer.minPurchaseKwh} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Facility Location:</span>
                        <span className="text-slate-700 font-semibold">{offer.generator?.locationAddress || offer.generator?.locationCity || 'San Francisco, CA'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: Purchase Requests */}
      {activeTab === 'requests' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Incoming Energy Purchase Requests</h2>
              <p className="text-xs text-slate-500">Review and approve energy purchase requests from Charging Port Owners.</p>
            </div>
            <Badge variant="warning">{pendingRequestsCount} Pending Approval</Badge>
          </div>

          {receivedRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-4xl block">📩</span>
              <h3 className="text-lg font-bold text-slate-900">No energy purchase requests yet.</h3>
              <p className="text-xs text-slate-500">When Charging Port Owners request clean energy from your published offers, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {receivedRequests.map((req) => (
                <Card key={req.id} variant="solid" padding="normal" className="flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-400 font-bold">{req.requestReference}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{req.chargingPort?.stationName || 'EV Charging Port'}</h3>
                        <p className="text-xs text-slate-500">Requested By: <span className="font-semibold text-slate-800">{req.chargingPort?.operator?.name || 'Station Owner'}</span></p>
                      </div>
                      <Badge
                        variant={req.status === 'accepted' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}
                        dot
                      >
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 my-3 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500 block">Requested Energy</span>
                        <span className="text-slate-900 font-bold text-sm">{req.requestedKwh} kWh</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Price Rate</span>
                        <span className="text-slate-900 font-bold text-sm">${req.pricePerKwh} / kWh</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Target Facility</span>
                        <span className="text-emerald-800 font-semibold">{req.offer?.generator?.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total Transaction Value</span>
                        <span className="text-emerald-700 font-extrabold text-sm">${req.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleRespondRequest(req.id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleRespondRequest(req.id, 'accepted')}
                      >
                        Accept & Allocate Energy
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: Settlement Transactions */}
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
            label="Facility Name *"
            required
            placeholder="e.g. Desert Sun Solar Array Alpha"
            value={newGenData.name}
            onChange={(e) => setNewGenData({ ...newGenData, name: e.target.value })}
          />

          <Input
            label="Location Address *"
            required
            placeholder="Enter the complete facility address"
            value={newGenData.locationAddress}
            onChange={(e) => setNewGenData({ ...newGenData, locationAddress: e.target.value })}
          />

          <Input
            label="Facility City *"
            required
            placeholder="e.g. San Francisco"
            value={newGenData.locationCity}
            onChange={(e) => setNewGenData({ ...newGenData, locationCity: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Energy Source Type *"
              value={newGenData.type}
              onChange={(e) => setNewGenData({ ...newGenData, type: e.target.value })}
              options={[
                { value: 'solar', label: 'Solar Photovoltaic' },
                { value: 'wind', label: 'Wind Turbine' },
                { value: 'hydro', label: 'Hydroelectric' },
                { value: 'biomass', label: 'Biomass Energy' },
                { value: 'geothermal', label: 'Geothermal Energy' },
              ]}
            />
            <Input
              label="Rated Capacity (kW) *"
              type="number"
              required
              placeholder="e.g. 1200"
              value={newGenData.capacityKw}
              onChange={(e) => setNewGenData({ ...newGenData, capacityKw: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tariff Rate ($ / kWh) *"
              type="number"
              required
              placeholder="e.g. 0.16"
              value={newGenData.tariffRatePerKwh}
              onChange={(e) => setNewGenData({ ...newGenData, tariffRatePerKwh: e.target.value })}
            />
            <Select
              label="Grid Connection Type *"
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

      {/* MODAL 3: Publish Energy Offer */}
      <Modal
        isOpen={isCreateOfferModalOpen}
        onClose={() => setIsCreateOfferModalOpen(false)}
        title="Publish Renewable Energy Offer"
        subtitle="List clean energy for sale on the Energy Marketplace"
      >
        <form onSubmit={handleCreateOffer} className="space-y-4 py-2">
          <Select
            label="Select Generator Facility *"
            value={newOfferData.generatorId}
            onChange={(e) => setNewOfferData({ ...newOfferData, generatorId: e.target.value })}
            options={generators.map((g) => ({ value: g.id, label: `${g.name} (${g.type} - ${g.capacityKw} kW)` }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Energy Available for Sale (kWh) *"
              type="number"
              required
              placeholder="e.g. 2500"
              value={newOfferData.energyAmountKwh}
              onChange={(e) => setNewOfferData({ ...newOfferData, energyAmountKwh: e.target.value })}
            />
            <Input
              label="Selling Price ($ / kWh) *"
              type="number"
              required
              placeholder="e.g. 0.15"
              value={newOfferData.pricePerKwh}
              onChange={(e) => setNewOfferData({ ...newOfferData, pricePerKwh: e.target.value })}
            />
          </div>

          <Input
            label="Minimum Purchase Quantity (kWh) *"
            type="number"
            required
            placeholder="e.g. 50"
            value={newOfferData.minPurchaseKwh}
            onChange={(e) => setNewOfferData({ ...newOfferData, minPurchaseKwh: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <Button variant="secondary" onClick={() => setIsCreateOfferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Offer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
