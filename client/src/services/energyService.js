import apiClient from './apiClient';

/**
 * Energy API service.
 * Handles renewable energy generator management, production uploads, analytics, and settlement transactions.
 */
const energyService = {
  /** Get all generators for current operator */
  getGenerators: (params) => apiClient.get('/energy/generators', { params }),

  /** Get a single generator by ID */
  getGeneratorById: (id) => apiClient.get(`/energy/generators/${id}`),

  /** Create a new generator facility */
  createGenerator: (data) => apiClient.post('/energy/generators', data),

  /** Update an existing generator facility */
  updateGenerator: (id, data) => apiClient.put(`/energy/generators/${id}`, data),

  /** Upload energy production log */
  uploadEnergy: (data) => apiClient.post('/energy/production/upload', data),
  uploadProductionLog: (data) => apiClient.post('/energy/production/upload', data),

  /** Get generator analytics and revenue metrics */
  getAnalytics: () => apiClient.get('/energy/analytics'),

  /** Get energy credit dispatch transactions */
  getTransactions: () => apiClient.get('/energy/transactions'),

  // ─── ENERGY MARKETPLACE & TRADING API METHODS ────────────────────────────────

  /** Publish energy offer to Marketplace */
  createOffer: (data) => apiClient.post('/energy/offers', data),

  /** Get active energy offers in Marketplace */
  getActiveOffers: () => apiClient.get('/energy/offers'),

  /** Get current generator operator's published offers */
  getMyOffers: () => apiClient.get('/energy/offers/my'),

  /** Submit energy purchase request (Port Owner -> Generator) */
  createPurchaseRequest: (data) => apiClient.post('/energy/requests', data),

  /** Get purchase requests received by generator operator */
  getReceivedRequests: () => apiClient.get('/energy/requests/received'),

  /** Get purchase requests submitted by port owner */
  getMyPurchaseRequests: () => apiClient.get('/energy/requests/my'),

  /** Respond to purchase request (Accept / Reject) */
  updateRequestStatus: (id, status) => apiClient.put(`/energy/requests/${id}/status`, { status }),

  /** Get Admin Trading Overview */
  getAdminTradingData: () => apiClient.get('/energy/admin/trading'),
};

export default energyService;
