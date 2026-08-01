import asyncHandler from 'express-async-handler';
import * as adminService from '../services/admin.service.js';

/**
 * @desc    Get platform-wide system overview metrics
 * @route   GET /api/admin/overview
 * @access  Private (admin)
 */
export const getOverview = asyncHandler(async (_req, res) => {
  const overview = await adminService.getSystemOverview();
  res.status(200).json({ success: true, data: overview });
});

/**
 * @desc    Get all users (with optional role/search filter)
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers(req.query);
  res.status(200).json({ success: true, count: users.length, data: { users } });
});

/**
 * @desc    Update a user's role and/or active status
 * @route   PATCH /api/admin/users/:id
 * @access  Private (admin)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRoleAndStatus(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'User role & status updated', data: { user } });
});

/**
 * @desc    Get all energy generators across the platform
 * @route   GET /api/admin/generators
 * @access  Private (admin)
 */
export const getGenerators = asyncHandler(async (_req, res) => {
  const generators = await adminService.getAllGenerators();
  res.status(200).json({ success: true, count: generators.length, data: { generators } });
});

/**
 * @desc    Get all charging ports across the platform
 * @route   GET /api/admin/ports
 * @access  Private (admin)
 */
export const getPorts = asyncHandler(async (_req, res) => {
  const ports = await adminService.getAllPorts();
  res.status(200).json({ success: true, count: ports.length, data: { ports } });
});

/**
 * @desc    Get all energy transactions (last 100)
 * @route   GET /api/admin/transactions
 * @access  Private (admin)
 */
export const getTransactions = asyncHandler(async (_req, res) => {
  const transactions = await adminService.getAllTransactions();
  res.status(200).json({ success: true, count: transactions.length, data: { transactions } });
});

/**
 * @desc    Dispatch an in-app notification (broadcast or targeted)
 * @route   POST /api/admin/notify
 * @access  Private (admin)
 */
export const sendNotification = asyncHandler(async (req, res) => {
  const notifications = await adminService.sendNotification(req.user.id, req.body);
  res
    .status(201)
    .json({ success: true, message: 'Notification dispatched', count: notifications.length });
});

/**
 * @desc    Get current system settings
 * @route   GET /api/admin/settings
 * @access  Private (admin)
 */
export const getSettings = asyncHandler(async (_req, res) => {
  const settings = adminService.getSystemSettings();
  res.status(200).json({ success: true, data: { settings } });
});

/**
 * @desc    Update system settings
 * @route   PATCH /api/admin/settings
 * @access  Private (admin)
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = adminService.updateSystemSettings(req.body);
  res.status(200).json({ success: true, message: 'System settings updated', data: { settings } });
});
