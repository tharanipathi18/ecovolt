import asyncHandler from 'express-async-handler';
import * as energyService from '../services/energy.service.js';

/**
 * @desc    Create new energy generator
 * @route   POST /api/energy/generators
 * @access  Private (generator, admin)
 */
export const createGenerator = asyncHandler(async (req, res) => {
  const generator = await energyService.createGenerator(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Energy generator facility created successfully',
    data: { generator },
  });
});

/**
 * @desc    Get all generators for current operator
 * @route   GET /api/energy/generators
 * @access  Private (generator, admin)
 */
export const getGenerators = asyncHandler(async (req, res) => {
  const generators = await energyService.getGenerators(req.user.id, req.user.role, req.query);
  res.status(200).json({
    success: true,
    count: generators.length,
    data: { generators },
  });
});

/**
 * @desc    Get single generator details
 * @route   GET /api/energy/generators/:id
 * @access  Private (generator, admin)
 */
export const getGeneratorById = asyncHandler(async (req, res) => {
  const generator = await energyService.getGeneratorById(req.params.id, req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    data: { generator },
  });
});

/**
 * @desc    Update generator facility
 * @route   PUT /api/energy/generators/:id
 * @access  Private (generator, admin)
 */
export const updateGenerator = asyncHandler(async (req, res) => {
  const generator = await energyService.updateGenerator(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: 'Generator updated successfully',
    data: { generator },
  });
});

/**
 * @desc    Upload energy production log
 * @route   POST /api/energy/production/upload
 * @access  Private (generator, admin)
 */
export const uploadEnergyProduction = asyncHandler(async (req, res) => {
  const result = await energyService.logProduction(
    req.body.generatorId,
    req.user.id,
    req.body,
  );
  res.status(201).json({
    success: true,
    message: 'Energy production batch uploaded and logged successfully',
    data: result,
  });
});

/**
 * @desc    Get generator analytics summary
 * @route   GET /api/energy/analytics
 * @access  Private (generator, admin)
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await energyService.getGeneratorAnalytics(req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    data: analytics,
  });
});

/**
 * @desc    Get energy transactions for operator
 * @route   GET /api/energy/transactions
 * @access  Private (generator, admin)
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await energyService.getEnergyTransactions(req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    count: transactions.length,
    data: { transactions },
  });
});

/**
 * @desc    Create energy offer for marketplace
 * @route   POST /api/energy/offers
 * @access  Private (generator, admin)
 */
export const createOffer = asyncHandler(async (req, res) => {
  const offer = await energyService.createOffer(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Energy offer published to Marketplace successfully',
    data: { offer },
  });
});

/**
 * @desc    Get active energy offers for marketplace
 * @route   GET /api/energy/offers
 * @access  Private (ev_port, generator, admin)
 */
export const getActiveOffers = asyncHandler(async (req, res) => {
  const offers = await energyService.getActiveOffers();
  res.status(200).json({
    success: true,
    count: offers.length,
    data: { offers },
  });
});

/**
 * @desc    Get energy offers published by current generator
 * @route   GET /api/energy/offers/my
 * @access  Private (generator, admin)
 */
export const getMyOffers = asyncHandler(async (req, res) => {
  const offers = await energyService.getMyOffers(req.user.id);
  res.status(200).json({
    success: true,
    count: offers.length,
    data: { offers },
  });
});

/**
 * @desc    Create energy purchase request (Port Owner -> Generator)
 * @route   POST /api/energy/requests
 * @access  Private (ev_port, admin)
 */
export const createPurchaseRequest = asyncHandler(async (req, res) => {
  const request = await energyService.createPurchaseRequest(req.user.id, req.user.role, req.body);
  res.status(201).json({
    success: true,
    message: 'Energy purchase request sent to generator operator successfully',
    data: { request },
  });
});

/**
 * @desc    Get purchase requests received by generator operator
 * @route   GET /api/energy/requests/received
 * @access  Private (generator, admin)
 */
export const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await energyService.getReceivedRequests(req.user.id);
  res.status(200).json({
    success: true,
    count: requests.length,
    data: { requests },
  });
});

/**
 * @desc    Get purchase requests submitted by port owner
 * @route   GET /api/energy/requests/my
 * @access  Private (ev_port, admin)
 */
export const getMyPurchaseRequests = asyncHandler(async (req, res) => {
  const requests = await energyService.getMyPurchaseRequests(req.user.id);
  res.status(200).json({
    success: true,
    count: requests.length,
    data: { requests },
  });
});

/**
 * @desc    Respond to energy purchase request (Accept / Reject)
 * @route   PUT /api/energy/requests/:id/status
 * @access  Private (generator, admin)
 */
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await energyService.updateRequestStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.status,
  );
  res.status(200).json({
    success: true,
    message: `Energy purchase request ${req.body.status} successfully`,
    data: { request },
  });
});

/**
 * @desc    Get Admin Energy Trading Summary & Logs
 * @route   GET /api/energy/admin/trading
 * @access  Private (admin)
 */
export const getAdminTradingData = asyncHandler(async (req, res) => {
  const data = await energyService.getAdminTradingData();
  res.status(200).json({
    success: true,
    data,
  });
});
