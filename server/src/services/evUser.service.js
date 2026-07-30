import { prisma } from '../config/db.js';

/** Get user's registered vehicles */
export const getUserVehicles = async (userId) => {
  return prisma.vehicle.findMany({
    where: { ownerId: userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
};

/** Register a new vehicle */
export const registerVehicle = async (userId, data) => {
  const existingPlate = await prisma.vehicle.findUnique({
    where: { licensePlate: data.licensePlate.toUpperCase() },
  });
  if (existingPlate) {
    const error = new Error('A vehicle with this license plate is already registered');
    error.statusCode = 400;
    throw error;
  }

  return prisma.vehicle.create({
    data: {
      ...data,
      ownerId: userId,
      licensePlate: data.licensePlate.toUpperCase(),
    },
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

/** Get nearby charging stations */
export const getNearbyStations = async (_longitude = -118.2437, _latitude = 34.0522, _radiusKm = 20) => {
  return prisma.chargingPort.findMany({
    where: {
      status: { in: ['available', 'occupied', 'reserved'] },
      isPublic: true,
    },
    include: {
      linkedGenerators: { select: { id: true, name: true, type: true, capacityKw: true } },
    },
    take: 20,
  });
};

/** Reserve a charging slot at a port */
export const createBooking = async (userId, data) => {
  const { chargingPortId, vehicleId, scheduledStartTime, durationMinutes } = data;

  const port = await prisma.chargingPort.findUnique({ where: { id: chargingPortId } });
  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
    throw error;
  }

  const bookingRef = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
  const rate = port.pricingRatePerKwh || 0.30;
  const estimatedEnergyKwh = (port.maxPowerOutputKw * ((durationMinutes || 45) / 60)) * 0.8;
  const estimatedCost = Number((estimatedEnergyKwh * rate).toFixed(2));

  return prisma.booking.create({
    data: {
      bookingReference: bookingRef,
      userId,
      chargingPortId,
      vehicleId,
      scheduledStartTime: new Date(scheduledStartTime),
      durationMinutes: durationMinutes || 45,
      estimatedCost,
      status: 'confirmed',
    },
  });
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

/** Get user's sustainability metrics */
export const getSustainabilityMetrics = async (userId) => {
  const sessions = await prisma.chargingSession.findMany({
    where: { userId, status: 'completed' },
  });

  const totalKwh = sessions.reduce((acc, s) => acc + s.energyConsumedKwh, 0);
  const co2SavedKg = Number((totalKwh * 0.705).toFixed(1));
  const treesEquivalent = Number((co2SavedKg / 20).toFixed(1));
  const avgCleanPercentage = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.renewableEnergyPercentage, 0) / sessions.length)
    : 88;

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
      name: data.name || user.name,
      phone: data.phone || user.phone,
      addressStreet: data.address || user.addressStreet,
    },
  });
};
