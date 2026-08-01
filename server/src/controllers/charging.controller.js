import asyncHandler from 'express-async-handler';
import * as chargingService from '../services/charging.service.js';

/**
 * @desc    Submit Station Owner Application (Status = PENDING until Admin approval)
 * @route   POST /api/charging/apply-station
 * @access  Private
 */
export const applyStation = asyncHandler(async (req, res) => {
  const application = await chargingService.submitStationApplication(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Station owner application submitted successfully and is pending Admin approval',
    data: { application },
  });
});

/**
 * @desc    Create new charging port / station
 * @route   POST /api/charging/ports
 * @access  Private (ev_port, admin)
 */
export const createPort = asyncHandler(async (req, res) => {
  const port = await chargingService.createChargingPort(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Charging port created successfully',
    data: { port },
  });
});

/**
 * @desc    Get all charging ports
 * @route   GET /api/charging/ports
 * @access  Private
 */
export const getPorts = asyncHandler(async (req, res) => {
  const ports = await chargingService.getChargingPorts(req.user.id, req.user.role, req.query);
  res.status(200).json({
    success: true,
    count: ports.length,
    data: { ports },
  });
});

/**
 * @desc    Get single charging port details
 * @route   GET /api/charging/ports/:id
 * @access  Private
 */
export const getPortById = asyncHandler(async (req, res) => {
  const result = await chargingService.getChargingPortById(req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Update charging port configuration or status
 * @route   PUT /api/charging/ports/:id
 * @access  Private (ev_port, admin)
 */
export const updatePort = asyncHandler(async (req, res) => {
  const port = await chargingService.updateChargingPort(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: 'Charging port updated successfully',
    data: { port },
  });
});

/**
 * @desc    Get charging sessions (active/completed)
 * @route   GET /api/charging/sessions
 * @access  Private
 */
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await chargingService.getChargingSessions(req.user.id, req.user.role, req.query.status);
  res.status(200).json({
    success: true,
    count: sessions.length,
    data: { sessions },
  });
});

/**
 * @desc    Start a charging session
 * @route   POST /api/charging/sessions/start
 * @access  Private
 */
export const startSession = asyncHandler(async (req, res) => {
  const session = await chargingService.startChargingSession(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Charging session started successfully',
    data: { session },
  });
});

/**
 * @desc    Stop / Release an active charging session
 * @route   PATCH /api/charging/sessions/:id/stop
 * @access  Private
 */
export const stopSession = asyncHandler(async (req, res) => {
  const session = await chargingService.stopChargingSession(
    req.params.id,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: 'Charging session completed & port freed',
    data: { session },
  });
});

/**
 * @desc    Get operator's bookings to review
 * @route   GET /api/charging/bookings
 * @access  Private (ev_port, admin)
 */
export const getOperatorBookings = asyncHandler(async (req, res) => {
  const bookings = await chargingService.getOperatorBookings(req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: { bookings },
  });
});

/**
 * @desc    Accept or Reject a booking
 * @route   PUT /api/charging/bookings/:id/status
 * @access  Private (ev_port, admin)
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await chargingService.updateBookingStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.status,
  );
  res.status(200).json({
    success: true,
    message: `Booking status updated to ${req.body.status}`,
    data: { booking },
  });
});

/**
 * @desc    Allocate renewable energy to port
 * @route   POST /api/charging/allocate-energy
 * @access  Private (ev_port, generator, admin)
 */
export const allocateEnergy = asyncHandler(async (req, res) => {
  const result = await chargingService.allocateEnergy(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Renewable energy allocated to charging port',
    data: result,
  });
});

/**
 * @desc    Get queue for charging port
 * @route   GET /api/charging/queue/:portId
 * @access  Private
 */
export const getQueue = asyncHandler(async (req, res) => {
  const queue = await chargingService.getQueue(req.params.portId);
  res.status(200).json({
    success: true,
    count: queue.length,
    data: { queue },
  });
});

/**
 * @desc    Add vehicle to waiting queue
 * @route   POST /api/charging/queue
 * @access  Private
 */
export const addToQueue = asyncHandler(async (req, res) => {
  const queueEntry = await chargingService.addToQueue(req.body);
  res.status(201).json({
    success: true,
    message: 'Vehicle added to waiting queue',
    data: { queueEntry },
  });
});

/**
 * @desc    Get charging analytics
 * @route   GET /api/charging/analytics
 * @access  Private (ev_port, admin)
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await chargingService.getChargingAnalytics(req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    data: analytics,
  });
});
