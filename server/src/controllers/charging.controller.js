import asyncHandler from 'express-async-handler';
import * as chargingService from '../services/charging.service.js';

/**
 * @desc    Create new charging port / station
 * @route   POST /api/charging/ports
 * @access  Private (ev_port, admin)
 */
export const createPort = asyncHandler(async (req, res) => {
  const port = await chargingService.createPort(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Charging port created successfully',
    data: { port },
  });
});

/**
 * @desc    Get all charging ports
 * @route   GET /api/charging/ports
 * @access  Private / Public
 */
export const getPorts = asyncHandler(async (req, res) => {
  const ports = await chargingService.getPorts(req.user._id, req.user.role, req.query);
  res.status(200).json({
    success: true,
    count: ports.length,
    data: { ports },
  });
});

/**
 * @desc    Get single charging port details
 * @route   GET /api/charging/ports/:id
 * @access  Private / Public
 */
export const getPortById = asyncHandler(async (req, res) => {
  const port = await chargingService.getPortById(req.params.id);
  res.status(200).json({
    success: true,
    data: { port },
  });
});

/**
 * @desc    Update charging port configuration or status
 * @route   PUT /api/charging/ports/:id
 * @access  Private (ev_port, admin)
 */
export const updatePort = asyncHandler(async (req, res) => {
  const port = await chargingService.updatePort(req.params.id, req.user._id, req.user.role, req.body);
  res.status(200).json({
    success: true,
    message: 'Charging port updated successfully',
    data: { port },
  });
});

/**
 * @desc    Start a charging session
 * @route   POST /api/charging/sessions/start
 * @access  Private
 */
export const startSession = asyncHandler(async (req, res) => {
  const session = await chargingService.startSession(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Charging session started successfully',
    data: { session },
  });
});

/**
 * @desc    Stop an active charging session
 * @route   PATCH /api/charging/sessions/:id/stop
 * @access  Private
 */
export const stopSession = asyncHandler(async (req, res) => {
  const session = await chargingService.stopSession(req.params.id, req.user._id, req.user.role, req.body);
  res.status(200).json({
    success: true,
    message: 'Charging session completed',
    data: { session },
  });
});

/**
 * @desc    Allocate renewable energy to port
 * @route   POST /api/charging/allocate-energy
 * @access  Private (ev_port, generator, admin)
 */
export const allocateEnergy = asyncHandler(async (req, res) => {
  const result = await chargingService.allocateEnergyToPort(req.user._id, req.user.role, req.body);
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
  const queueEntry = await chargingService.addToQueue(req.user._id, req.body);
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
  const analytics = await chargingService.getChargingAnalytics(req.user._id, req.user.role);
  res.status(200).json({
    success: true,
    data: analytics,
  });
});
