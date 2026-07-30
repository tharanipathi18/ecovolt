import asyncHandler from 'express-async-handler';
import * as fleetService from '../services/fleet.service.js';

export const getFleetVehicles = asyncHandler(async (req, res) => {
  const fleetVehicles = await fleetService.getFleetVehicles(req.user._id, req.user.role);
  res.status(200).json({ success: true, count: fleetVehicles.length, data: { fleetVehicles } });
});

export const registerFleetVehicle = asyncHandler(async (req, res) => {
  const fleetVehicle = await fleetService.registerFleetVehicle(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Fleet vehicle registered successfully', data: { fleetVehicle } });
});

export const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await fleetService.getDrivers(req.user._id, req.user.role);
  res.status(200).json({ success: true, count: drivers.length, data: { drivers } });
});

export const createDriver = asyncHandler(async (req, res) => {
  const driver = await fleetService.createDriver(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Driver created successfully', data: { driver } });
});

export const assignDriver = asyncHandler(async (req, res) => {
  const result = await fleetService.assignDriverToVehicle(req.user._id, req.user.role, req.body);
  res.status(200).json({ success: true, message: 'Driver assigned to vehicle', data: result });
});

export const updateChargingSchedule = asyncHandler(async (req, res) => {
  const fleetVehicle = await fleetService.updateChargingSchedule(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Charging schedule updated', data: { fleetVehicle } });
});

export const createMaintenanceReport = asyncHandler(async (req, res) => {
  const report = await fleetService.createMaintenanceReport(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Maintenance report filed', data: { report } });
});

export const getMaintenanceReports = asyncHandler(async (req, res) => {
  const reports = await fleetService.getMaintenanceReports(req.user._id);
  res.status(200).json({ success: true, count: reports.length, data: { reports } });
});

export const getFleetAnalytics = asyncHandler(async (req, res) => {
  const analytics = await fleetService.getFleetAnalytics(req.user._id, req.user.role);
  res.status(200).json({ success: true, data: analytics });
});
