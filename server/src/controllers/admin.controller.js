import asyncHandler from 'express-async-handler';
import * as adminService from '../services/admin.service.js';

export const getOverview = asyncHandler(async (_req, res) => {
  const overview = await adminService.getSystemOverview();
  res.status(200).json({ success: true, data: overview });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers(req.query);
  res.status(200).json({ success: true, count: users.length, data: { users } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRoleAndStatus(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'User role & status updated', data: { user } });
});

export const getGenerators = asyncHandler(async (_req, res) => {
  const generators = await adminService.getAllGenerators();
  res.status(200).json({ success: true, count: generators.length, data: { generators } });
});

export const getPorts = asyncHandler(async (_req, res) => {
  const ports = await adminService.getAllPorts();
  res.status(200).json({ success: true, count: ports.length, data: { ports } });
});

export const getTransactions = asyncHandler(async (_req, res) => {
  const transactions = await adminService.getAllTransactions();
  res.status(200).json({ success: true, count: transactions.length, data: { transactions } });
});

export const sendNotification = asyncHandler(async (req, res) => {
  const notifications = await adminService.sendNotification(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Notification dispatched', count: notifications.length });
});

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = adminService.getSystemSettings();
  res.status(200).json({ success: true, data: { settings } });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = adminService.updateSystemSettings(req.body);
  res.status(200).json({ success: true, message: 'System settings updated', data: { settings } });
});
