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

  /** Get generator analytics and revenue metrics */
  getAnalytics: () => apiClient.get('/energy/analytics'),

  /** Get energy credit dispatch transactions */
  getTransactions: () => apiClient.get('/energy/transactions'),
};

export default energyService;
