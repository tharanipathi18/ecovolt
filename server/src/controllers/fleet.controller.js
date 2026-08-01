import asyncHandler from 'express-async-handler';
import * as fleetService from '../services/fleet.service.js';

/**
 * @desc    Get all fleet vehicles for current manager
 * @route   GET /api/fleet/vehicles
 * @access  Private (fleet_manager, admin)
 */
export const getFleetVehicles = asyncHandler(async (req, res) => {
  const fleetVehicles = await fleetService.getFleetVehicles(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: fleetVehicles.length, data: { fleetVehicles } });
});

/**
 * @desc    Register a vehicle into the fleet
 * @route   POST /api/fleet/vehicles
 * @access  Private (fleet_manager, admin)
 */
export const registerFleetVehicle = asyncHandler(async (req, res) => {
  const fleetVehicle = await fleetService.registerFleetVehicle(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Fleet vehicle registered successfully',
    data: { fleetVehicle },
  });
});

/**
 * @desc    Get all commercial drivers
 * @route   GET /api/fleet/drivers
 * @access  Private (fleet_manager, admin)
 */
export const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await fleetService.getDrivers(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: drivers.length, data: { drivers } });
});

/**
 * @desc    Create a commercial driver profile
 * @route   POST /api/fleet/drivers
 * @access  Private (fleet_manager, admin)
 */
export const createDriver = asyncHandler(async (req, res) => {
  const driver = await fleetService.createDriver(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Driver created successfully', data: { driver } });
});

/**
 * @desc    Assign a driver to a fleet vehicle
 * @route   POST /api/fleet/assign-driver
 * @access  Private (fleet_manager, admin)
 */
export const assignDriver = asyncHandler(async (req, res) => {
  const result = await fleetService.assignDriverToVehicle(req.user.id, req.user.role, req.body);
  res.status(200).json({ success: true, message: 'Driver assigned to vehicle', data: result });
});

/**
 * @desc    Update charging schedule for a fleet vehicle
 * @route   PATCH /api/fleet/vehicles/:id/schedule
 * @access  Private (fleet_manager, admin)
 */
export const updateChargingSchedule = asyncHandler(async (req, res) => {
  const fleetVehicle = await fleetService.updateChargingSchedule(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Charging schedule updated',
    data: { fleetVehicle },
  });
});

/**
 * @desc    File a maintenance report
 * @route   POST /api/fleet/maintenance
 * @access  Private (fleet_manager, admin)
 */
export const createMaintenanceReport = asyncHandler(async (req, res) => {
  const report = await fleetService.createMaintenanceReport(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Maintenance report filed',
    data: { report },
  });
});

/**
 * @desc    Get all maintenance reports filed by user
 * @route   GET /api/fleet/maintenance
 * @access  Private (fleet_manager, admin)
 */
export const getMaintenanceReports = asyncHandler(async (req, res) => {
  const reports = await fleetService.getMaintenanceReports(req.user.id);
  res.status(200).json({ success: true, count: reports.length, data: { reports } });
});

/**
 * @desc    Get fleet analytics summary
 * @route   GET /api/fleet/analytics
 * @access  Private (fleet_manager, admin)
 */
export const getFleetAnalytics = asyncHandler(async (req, res) => {
  const analytics = await fleetService.getFleetAnalytics(req.user.id, req.user.role);
  res.status(200).json({ success: true, data: analytics });
});
