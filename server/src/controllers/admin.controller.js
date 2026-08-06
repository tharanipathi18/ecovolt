import asyncHandler from 'express-async-handler';
import * as adminService from '../services/admin.service.js';

export const getOverview = asyncHandler(async (req, res) => {
  const stats = await adminService.getSystemOverview();
  res.status(200).json({ success: true, data: { stats } });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers(req.query);
  res.status(200).json({ success: true, count: users.length, data: { users } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRoleAndStatus(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'User updated successfully', data: { user } });
});

export const getPendingStationApplications = asyncHandler(async (req, res) => {
  const applications = await adminService.getPendingStationApplications();
  res.status(200).json({ success: true, count: applications.length, data: { applications } });
});

export const reviewStationApplication = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  const application = await adminService.reviewStationApplication(req.params.id, decision);
  res.status(200).json({
    success: true,
    message: `Station application ${decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'}`,
    data: { application },
  });
});

export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await adminService.getAllVehicles();
  res.status(200).json({ success: true, count: vehicles.length, data: { vehicles } });
});

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await adminService.getAllBookings();
  res.status(200).json({ success: true, count: bookings.length, data: { bookings } });
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await adminService.getAllSessions();
  res.status(200).json({ success: true, count: sessions.length, data: { sessions } });
});

export const getGenerators = asyncHandler(async (req, res) => {
  const generators = await adminService.getAllGenerators();
  res.status(200).json({ success: true, count: generators.length, data: { generators } });
});

export const getChargingPorts = asyncHandler(async (req, res) => {
  const ports = await adminService.getAllPorts();
  res.status(200).json({ success: true, count: ports.length, data: { ports } });
});
export const getPendingGeneratorApplications = asyncHandler(async (req, res) => {
  const generators = await adminService.getPendingGenerators();
  res.status(200).json({
    success: true,
    count: generators.length,
    data: { generators },
  });
});

export const reviewGeneratorApplication = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  const generator = await adminService.reviewGeneratorApplication(req.params.id, decision);
  res.status(200).json({
    success: true,
    message: `Generator application ${decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'}`,
    data: { generator },
  });
});

