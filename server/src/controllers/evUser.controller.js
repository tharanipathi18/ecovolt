import asyncHandler from 'express-async-handler';
import * as evUserService from '../services/evUser.service.js';

export const getUserVehicles = asyncHandler(async (req, res) => {
  const vehicles = await evUserService.getUserVehicles(req.user._id);
  res.status(200).json({ success: true, count: vehicles.length, data: { vehicles } });
});

export const registerVehicle = asyncHandler(async (req, res) => {
  const vehicle = await evUserService.registerVehicle(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Vehicle registered successfully', data: { vehicle } });
});

export const getVehicleDetails = asyncHandler(async (req, res) => {
  const details = await evUserService.getVehicleDetails(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: details });
});

export const getNearbyStations = asyncHandler(async (req, res) => {
  const { lng, lat, radius } = req.query;
  const stations = await evUserService.getNearbyStations(
    lng ? parseFloat(lng) : undefined,
    lat ? parseFloat(lat) : undefined,
    radius ? parseFloat(radius) : undefined,
  );
  res.status(200).json({ success: true, count: stations.length, data: { stations } });
});

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await evUserService.createBooking(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Slot booking confirmed', data: { booking } });
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await evUserService.getUserBookings(req.user._id);
  res.status(200).json({ success: true, count: bookings.length, data: { bookings } });
});

export const getUserChargingHistory = asyncHandler(async (req, res) => {
  const history = await evUserService.getUserChargingHistory(req.user._id);
  res.status(200).json({ success: true, count: history.length, data: { history } });
});

export const getSustainabilityMetrics = asyncHandler(async (req, res) => {
  const metrics = await evUserService.getSustainabilityMetrics(req.user._id);
  res.status(200).json({ success: true, data: metrics });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await evUserService.updateUserProfile(req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user } });
});
