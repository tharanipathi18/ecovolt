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
