import asyncHandler from 'express-async-handler';
import * as evUserService from '../services/evUser.service.js';

/**
 * @desc    Get current user's registered vehicles
 * @route   GET /api/ev/vehicles
 * @access  Private (ev_user, admin)
 */
export const getUserVehicles = asyncHandler(async (req, res) => {
  const vehicles = await evUserService.getUserVehicles(req.user.id);
  res.status(200).json({ success: true, count: vehicles.length, data: { vehicles } });
});

/**
 * @desc    Register a new vehicle to the current user's account
 * @route   POST /api/ev/vehicles
 * @access  Private (ev_user, admin)
 */
export const registerVehicle = asyncHandler(async (req, res) => {
  const vehicle = await evUserService.registerVehicle(req.user.id, req.body);
  res
    .status(201)
    .json({ success: true, message: 'Vehicle registered successfully', data: { vehicle } });
});

/**
 * @desc    Get details of a specific vehicle (with latest battery report)
 * @route   GET /api/ev/vehicles/:id
 * @access  Private (ev_user, admin)
 */
export const getVehicleDetails = asyncHandler(async (req, res) => {
  const details = await evUserService.getVehicleDetails(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: details });
});

/**
 * @desc    Get nearby charging stations
 * @route   GET /api/ev/stations/nearby
 * @access  Private (ev_user, admin)
 */
export const getNearbyStations = asyncHandler(async (req, res) => {
  const { lng, lat, radius } = req.query;
  const stations = await evUserService.getNearbyStations(
    lng ? parseFloat(lng) : undefined,
    lat ? parseFloat(lat) : undefined,
    radius ? parseFloat(radius) : undefined,
  );
  res.status(200).json({ success: true, count: stations.length, data: { stations } });
});

/**
 * @desc    Create a booking (reserve a charging slot)
 * @route   POST /api/ev/bookings
 * @access  Private (ev_user, admin)
 */
export const createBooking = asyncHandler(async (req, res) => {
  const booking = await evUserService.createBooking(req.user.id, req.body);
  res
    .status(201)
    .json({ success: true, message: 'Slot booking confirmed', data: { booking } });
});

/**
 * @desc    Get current user's bookings
 * @route   GET /api/ev/bookings
 * @access  Private (ev_user, admin)
 */
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await evUserService.getUserBookings(req.user.id);
  res.status(200).json({ success: true, count: bookings.length, data: { bookings } });
});

/**
 * @desc    Get current user's charging session history
 * @route   GET /api/ev/history
 * @access  Private (ev_user, admin)
 */
export const getUserChargingHistory = asyncHandler(async (req, res) => {
  const history = await evUserService.getUserChargingHistory(req.user.id);
  res.status(200).json({ success: true, count: history.length, data: { history } });
});

/**
 * @desc    Get sustainability metrics (CO₂ saved, kWh delivered, etc.)
 * @route   GET /api/ev/sustainability
 * @access  Private (ev_user, admin)
 */
export const getSustainabilityMetrics = asyncHandler(async (req, res) => {
  const metrics = await evUserService.getSustainabilityMetrics(req.user.id);
  res.status(200).json({ success: true, data: metrics });
});

/**
 * @desc    Update authenticated user's profile
 * @route   PATCH /api/ev/profile
 * @access  Private (ev_user, admin)
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await evUserService.updateUserProfile(req.user.id, req.body);
  res
    .status(200)
    .json({ success: true, message: 'Profile updated successfully', data: { user } });
});
