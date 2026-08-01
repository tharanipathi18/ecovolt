import { prisma } from '../config/db.js';
import { createNotification } from './notification.service.js';

/** Get user's registered vehicles */
export const getUserVehicles = async (userId) => {
  return prisma.vehicle.findMany({
    where: { ownerId: userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
};

/** Register a new vehicle (No admin approval required for EV users) */
export const registerVehicle = async (userId, data) => {
  const existingPlate = await prisma.vehicle.findUnique({
    where: { licensePlate: data.licensePlate.toUpperCase().trim() },
  });
  if (existingPlate) {
    const error = new Error('A vehicle with this license plate is already registered');
    error.statusCode = 400;
    throw error;
  }

  return prisma.vehicle.create({
    data: {
      make: data.make.trim(),
      model: data.model.trim(),
      year: parseInt(data.year, 10),
      licensePlate: data.licensePlate.toUpperCase().trim(),
      vin: data.vin ? data.vin.trim() : `5YJ${Math.floor(100000 + Math.random() * 900000)}`,
      batteryCapacityKwh: parseFloat(data.batteryCapacityKwh),
      connectorType: data.connectorType,
      ownerId: userId,
    },
  });
};

/** Update existing vehicle */
export const updateVehicle = async (vehicleId, userId, data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  if (vehicle.ownerId !== userId) {
    const error = new Error('Not authorized to edit this vehicle');
    error.statusCode = 403;
    throw error;
  }

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      make: data.make ? data.make.trim() : vehicle.make,
      model: data.model ? data.model.trim() : vehicle.model,
      year: data.year ? parseInt(data.year, 10) : vehicle.year,
      licensePlate: data.licensePlate ? data.licensePlate.toUpperCase().trim() : vehicle.licensePlate,
      batteryCapacityKwh: data.batteryCapacityKwh ? parseFloat(data.batteryCapacityKwh) : vehicle.batteryCapacityKwh,
      connectorType: data.connectorType || vehicle.connectorType,
    },
  });
};

/** Delete / Deactivate vehicle */
export const deleteVehicle = async (vehicleId, userId) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  if (vehicle.ownerId !== userId) {
    const error = new Error('Not authorized to delete this vehicle');
    error.statusCode = 403;
    throw error;
  }

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isActive: false },
  });
};

/** Get vehicle details with latest battery diagnostic report */
export const getVehicleDetails = async (vehicleId, userId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  if (vehicle.ownerId !== userId) {
    const error = new Error('Not authorized to access this vehicle');
    error.statusCode = 403;
    throw error;
  }

  const latestBatteryReport = await prisma.batteryReport.findFirst({
    where: { vehicleId },
    orderBy: { reportedAt: 'desc' },
  });

  return { vehicle, batteryReport: latestBatteryReport };
};

/** Get ONLY Approved Charging Stations for EV Users */
export const getNearbyStations = async (_longitude = -118.2437, _latitude = 34.0522, _radiusKm = 20) => {
  return prisma.chargingPort.findMany({
    where: {
      isApproved: true,
      approvalStatus: 'APPROVED',
      status: { in: ['available', 'occupied', 'reserved'] },
      isPublic: true,
    },
    include: {
      operator: { select: { id: true, name: true, email: true } },
      linkedGenerators: { select: { id: true, name: true, type: true, capacityKw: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};

/** Reserve a charging slot at a port (Status = PENDING for station owner approval) */
export const createBooking = async (userId, data) => {
  const { chargingPortId, vehicleId, scheduledStartTime, durationMinutes } = data;

  // 1. Verify charging port exists & is approved
  const port = await prisma.chargingPort.findUnique({ where: { id: chargingPortId } });
  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
    throw error;
  }
  if (!port.isApproved || port.approvalStatus !== 'APPROVED') {
    const error = new Error('Charging station has not been approved for public bookings yet');
    error.statusCode = 403;
    throw error;
  }

  // 2. Verify vehicle exists and belongs to user
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  if (vehicle.ownerId !== userId) {
    const error = new Error('Vehicle does not belong to the authenticated user');
    error.statusCode = 403;
    throw error;
  }

  // Parse start time and compute duration
  const requestedStart = new Date(scheduledStartTime);
  if (isNaN(requestedStart.getTime())) {
    const error = new Error('Invalid scheduled start time date');
    error.statusCode = 400;
    throw error;
  }

  const duration = durationMinutes ? parseInt(durationMinutes, 10) : 45;
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 1000);

  // 3. Double Booking Check: Check for overlapping bookings for the same charging port
  const existingBookings = await prisma.booking.findMany({
    where: {
      chargingPortId,
      status: { in: ['confirmed', 'pending'] },
    },
  });

  const isDoubleBooked = existingBookings.some((existing) => {
    const existingStart = new Date(existing.scheduledStartTime);
    const existingEnd = new Date(existingStart.getTime() + existing.durationMinutes * 60 * 1000);
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (isDoubleBooked) {
    const error = new Error('This charging port is already booked for the selected time window');
    error.statusCode = 409;
    throw error;
  }

  // 4. Create booking with Prisma into Supabase DB (Status = pending)
  const bookingRef = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
  const rate = port.pricingRatePerKwh || 0.35;
  const estimatedEnergyKwh = Number(((port.maxPowerOutputKw * (duration / 60)) * 0.8).toFixed(2));
  const estimatedCost = Number((estimatedEnergyKwh * rate).toFixed(2));

  const booking = await prisma.booking.create({
    data: {
      bookingReference: bookingRef,
      userId,
      chargingPortId,
      vehicleId,
      scheduledStartTime: requestedStart,
      durationMinutes: duration,
      estimatedCost,
      status: 'pending', // ⚡ PENDING approval by Charging Station Owner
    },
    include: {
      chargingPort: {
        select: { id: true, stationName: true, portIdentifier: true, connectorType: true, pricingRatePerKwh: true, operatorId: true },
      },
      vehicle: {
        select: { id: true, make: true, model: true, licensePlate: true },
      },
    },
  });

  // 5. Notify Station Owner & User
  await createNotification({
    userId: port.operatorId,
    title: 'Booking Request Pending ⏳',
    message: `New slot booking request (${bookingRef}) at ${port.stationName} from ${vehicle.make} ${vehicle.model}. Please accept or reject in your dashboard.`,
    type: 'warning',
  });

  await createNotification({
    userId,
    title: 'Booking Submitted ⏳',
    message: `Your booking request (${bookingRef}) at ${port.stationName} has been submitted and is pending station owner approval.`,
    type: 'info',
  });

  return booking;
};

/** Get user's active & past bookings */
export const getUserBookings = async (userId) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true, connectorType: true } },
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
    orderBy: { scheduledStartTime: 'desc' },
  });
};

/** Get user's charging session history */
export const getUserChargingHistory = async (userId) => {
  return prisma.chargingSession.findMany({
    where: { userId },
    include: {
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
    orderBy: { startTime: 'desc' },
  });
};

/** Get user's sustainability metrics directly from Supabase DB */
export const getSustainabilityMetrics = async (userId) => {
  const sessions = await prisma.chargingSession.findMany({
    where: { userId, status: 'completed' },
  });

  const totalKwh = sessions.reduce((acc, s) => acc + (s.energyConsumedKwh || 0), 0);
  const co2SavedKg = Number((totalKwh * 0.705).toFixed(1));
  const treesEquivalent = Number((co2SavedKg / 20).toFixed(1));
  const avgCleanPercentage = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.renewableEnergyPercentage || 100), 0) / sessions.length)
    : 0;

  return {
    totalSessionsCount: sessions.length,
    totalKwhDelivered: Number(totalKwh.toFixed(2)),
    co2SavedKg,
    treesEquivalent,
    avgCleanPercentage,
  };
};

/** Update user profile */
export const updateUserProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name ? data.name.trim() : user.name,
      phone: data.phone ? data.phone.trim() : user.phone,
      addressStreet: data.address ? data.address.trim() : user.addressStreet,
    },
  });
};
