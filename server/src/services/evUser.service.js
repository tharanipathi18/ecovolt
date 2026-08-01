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

/** Get nearby charging stations (auto-seeds default stations if 0 exist in DB) */
export const getNearbyStations = async (_longitude = -118.2437, _latitude = 34.0522, _radiusKm = 20) => {
  let ports = await prisma.chargingPort.findMany({
    where: {
      status: { in: ['available', 'occupied', 'reserved'] },
      isPublic: true,
    },
    include: {
      linkedGenerators: { select: { id: true, name: true, type: true, capacityKw: true } },
    },
    take: 20,
  });

  // Auto-seed initial public charging ports if DB is empty
  if (ports.length === 0) {
    let operator = await prisma.user.findFirst({ where: { role: 'ev_port' } });
    if (!operator) {
      operator = await prisma.user.findFirst({ where: { role: 'admin' } });
    }
    if (!operator) {
      operator = await prisma.user.findFirst();
    }

    if (operator) {
      const defaultPorts = [
        {
          operatorId: operator.id,
          stationName: 'Downtown Solar Charging Hub',
          portIdentifier: 'PORT-SOLAR-01',
          connectorType: 'ccs_2',
          maxPowerOutputKw: 150,
          status: 'available',
          pricingRatePerKwh: 0.32,
          isPublic: true,
          locationAddress: '100 Solar Way',
          locationCity: 'San Francisco',
        },
        {
          operatorId: operator.id,
          stationName: 'Metro Wind Power Station',
          portIdentifier: 'PORT-WIND-02',
          connectorType: 'ccs_2',
          maxPowerOutputKw: 120,
          status: 'available',
          pricingRatePerKwh: 0.28,
          isPublic: true,
          locationAddress: '250 Metro Blvd',
          locationCity: 'San Francisco',
        },
        {
          operatorId: operator.id,
          stationName: 'Suburban Clean Energy Hub',
          portIdentifier: 'PORT-CLEAN-03',
          connectorType: 'type_2',
          maxPowerOutputKw: 50,
          status: 'available',
          pricingRatePerKwh: 0.25,
          isPublic: true,
          locationAddress: '50 Suburban Park',
          locationCity: 'San Francisco',
        },
      ];

      for (const p of defaultPorts) {
        await prisma.chargingPort.create({ data: p });
      }

      ports = await prisma.chargingPort.findMany({
        where: {
          status: { in: ['available', 'occupied', 'reserved'] },
          isPublic: true,
        },
        include: {
          linkedGenerators: { select: { id: true, name: true, type: true, capacityKw: true } },
        },
        take: 20,
      });
    }
  }

  return ports;
};

/** Reserve a charging slot at a port */
export const createBooking = async (userId, data) => {
  const { chargingPortId, vehicleId, scheduledStartTime, durationMinutes } = data;

  // 1. Verify charging port exists
  const port = await prisma.chargingPort.findUnique({ where: { id: chargingPortId } });
  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
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

  // 4. Create booking with Prisma into Supabase DB
  const bookingRef = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
  const rate = port.pricingRatePerKwh || 0.35;
  const estimatedEnergyKwh = Number(((port.maxPowerOutputKw * (duration / 60)) * 0.8).toFixed(2));
  const estimatedCost = Number((estimatedEnergyKwh * rate).toFixed(2));

  return prisma.booking.create({
    data: {
      bookingReference: bookingRef,
      userId,
      chargingPortId,
      vehicleId,
      scheduledStartTime: requestedStart,
      durationMinutes: duration,
      estimatedCost,
      status: 'confirmed',
    },
    include: {
      chargingPort: {
        select: { id: true, stationName: true, portIdentifier: true, connectorType: true, pricingRatePerKwh: true },
      },
      vehicle: {
        select: { id: true, make: true, model: true, licensePlate: true },
      },
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
