import asyncHandler from 'express-async-handler';
import * as fleetService from '../services/fleet.service.js';

// ─── Fleet Vehicles ────────────────────────────────────────────────────────

/**
 * @desc    Get consolidated fleet dashboard data in a single optimized call
 * @route   GET /api/fleet/dashboard
 * @access  Private (fleet_manager, admin)
 */
export const getFleetDashboard = asyncHandler(async (req, res) => {
  const dashboardData = await fleetService.getFleetDashboard(req.user.id, req.user.role);
  res.status(200).json({ success: true, data: dashboardData });
});

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
 * @desc    Register a new fleet vehicle (inline vehicle data — no vehicleId FK)
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
 * @desc    Update fleet vehicle status
 * @route   PATCH /api/fleet/vehicles/:id/status
 * @access  Private (fleet_manager, admin)
 */
export const updateFleetVehicleStatus = asyncHandler(async (req, res) => {
  const { vehicleStatus } = req.body;
  const fleetVehicle = await fleetService.updateFleetVehicleStatus(req.params.id, req.user.id, vehicleStatus);
  res.status(200).json({ success: true, message: 'Vehicle status updated', data: { fleetVehicle } });
});

/**
 * @desc    Update charging schedule for fleet vehicle
 * @route   PUT /api/fleet/vehicles/:id/schedule
 * @access  Private (fleet_manager, admin)
 */
export const updateChargingSchedule = asyncHandler(async (req, res) => {
  const fleetVehicle = await fleetService.updateChargingSchedule(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Charging schedule updated', data: { fleetVehicle } });
});

// ─── Drivers ───────────────────────────────────────────────────────────────

/**
 * @desc    Get all drivers for current manager
 * @route   GET /api/fleet/drivers
 * @access  Private (fleet_manager, admin)
 */
export const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await fleetService.getDrivers(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: drivers.length, data: { drivers } });
});

/**
 * @desc    Create a driver (creates User account + Driver profile atomically)
 * @route   POST /api/fleet/drivers
 * @access  Private (fleet_manager, admin)
 */
export const createDriver = asyncHandler(async (req, res) => {
  const driver = await fleetService.createDriver(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Driver registered successfully. Default password: EcoVolt@Driver123',
    data: { driver },
  });
});

/**
 * @desc    Assign a driver to a fleet vehicle
 * @route   POST /api/fleet/assign-driver
 * @access  Private (fleet_manager, admin)
 */
export const assignDriver = asyncHandler(async (req, res) => {
  const result = await fleetService.assignDriverToVehicle(req.user.id, req.body);
  res.status(200).json({ success: true, message: 'Driver assigned to vehicle', data: result });
});

// ─── Complaints ───────────────────────────────────────────────────────────

/**
 * @desc    Get all complaints for fleet manager's vehicles
 * @route   GET /api/fleet/complaints
 * @access  Private (fleet_manager, driver, admin)
 */
export const getComplaints = asyncHandler(async (req, res) => {
  const complaints = await fleetService.getComplaints(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: complaints.length, data: { complaints } });
});

/**
 * @desc    Driver raises a complaint
 * @route   POST /api/fleet/complaints
 * @access  Private (driver, fleet_manager)
 */
export const createComplaint = asyncHandler(async (req, res) => {
  // Determine driverId — if driver role, look up their driver profile
  let driverId = req.body.driverId;
  let managerId = req.user.id;

  if (req.user.role === 'driver') {
    const { prisma } = await import('../config/db.js');
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) {
      res.status(404);
      throw new Error('Driver profile not found for your account');
    }
    driverId = driver.id;
    managerId = driver.employerManagerId;
  }

  const complaint = await fleetService.createComplaint(driverId, managerId, req.body);
  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully. Your fleet manager has been notified.',
    data: { complaint },
  });
});

/**
 * @desc    Update complaint status
 * @route   PUT /api/fleet/complaints/:id
 * @access  Private (fleet_manager, admin)
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const complaint = await fleetService.updateComplaintStatus(req.params.id, req.user.id, status);
  res.status(200).json({ success: true, message: 'Complaint status updated', data: { complaint } });
});

// ─── Maintenance Schedules ─────────────────────────────────────────────────

/**
 * @desc    Get all maintenance schedules
 * @route   GET /api/fleet/maintenance
 * @access  Private (fleet_manager, admin)
 */
export const getMaintenanceSchedules = asyncHandler(async (req, res) => {
  const schedules = await fleetService.getMaintenanceSchedules(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: schedules.length, data: { schedules } });
});

/**
 * @desc    Schedule maintenance (in response to a complaint)
 * @route   POST /api/fleet/maintenance
 * @access  Private (fleet_manager, admin)
 */
export const scheduleMaintenance = asyncHandler(async (req, res) => {
  const schedule = await fleetService.scheduleMaintenance(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Maintenance scheduled. Vehicle status set to IN_MAINTENANCE.',
    data: { schedule },
  });
});

/**
 * @desc    Update maintenance schedule status (mark complete/cancelled)
 * @route   PUT /api/fleet/maintenance/:id
 * @access  Private (fleet_manager, admin)
 */
export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { status, actualCost } = req.body;
  const schedule = await fleetService.updateMaintenanceStatus(req.params.id, req.user.id, status, actualCost);
  res.status(200).json({ success: true, message: 'Maintenance schedule updated', data: { schedule } });
});

// ─── Analytics ────────────────────────────────────────────────────────────

/**
 * @desc    Get fleet analytics summary (all from real DB)
 * @route   GET /api/fleet/analytics
 * @access  Private (fleet_manager, admin)
 */
export const getFleetAnalytics = asyncHandler(async (req, res) => {
  const analytics = await fleetService.getFleetAnalytics(req.user.id, req.user.role);
  res.status(200).json({ success: true, data: analytics });
});

// ─── Fleet Charging ────────────────────────────────────────────────────────

/**
 * @desc    Get nearby approved charging ports for fleet manager
 * @route   GET /api/fleet/charging/nearby-ports
 * @access  Private (fleet_manager, admin)
 */
export const getNearbyPorts = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const ports = await fleetService.getNearbyPortsForFleet(req.user.id, lat, lng);
  res.status(200).json({ success: true, count: ports.length, data: { ports } });
});

/**
 * @desc    Create a fleet charging slot booking (status = pending)
 * @route   POST /api/fleet/charging/bookings
 * @access  Private (fleet_manager, admin)
 */
export const createFleetBooking = asyncHandler(async (req, res) => {
  const booking = await fleetService.createFleetBooking(req.user.id, req.body);
  res.status(201).json({ success: true, data: { booking } });
});

/**
 * @desc    Get all fleet charging bookings for this manager
 * @route   GET /api/fleet/charging/bookings
 * @access  Private (fleet_manager, admin)
 */
export const getFleetBookings = asyncHandler(async (req, res) => {
  const bookings = await fleetService.getFleetBookings(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: bookings.length, data: { bookings } });
});

/**
 * @desc    Get fleet charging session history for this manager
 * @route   GET /api/fleet/charging/history
 * @access  Private (fleet_manager, admin)
 */
export const getFleetChargingHistory = asyncHandler(async (req, res) => {
  const sessions = await fleetService.getFleetChargingHistory(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: sessions.length, data: { sessions } });
});

