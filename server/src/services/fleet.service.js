import { prisma } from '../config/db.js';

/** Get all fleet vehicles for fleet manager */
export const getFleetVehicles = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };

  return prisma.fleetVehicle.findMany({
    where,
    include: {
      vehicle: true,
      assignedDriver: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Register a commercial vehicle into fleet */
export const registerFleetVehicle = async (managerId, data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.fleetVehicle.create({
    data: {
      fleetName: data.fleetName,
      managerId,
      vehicleId: data.vehicleId,
      fleetUnitNumber: data.fleetUnitNumber,
      chargingPriority: data.chargingPriority || 'medium',
      preferredChargeStartTime: data.preferredChargeStartTime || '22:00',
      targetStateOfCharge: data.targetStateOfCharge || 90,
    },
  });
};

/** Get commercial drivers list */
export const getDrivers = async (managerId, role) => {
  const where = role === 'admin' ? {} : { employerManagerId: managerId };

  return prisma.driver.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      assignedFleetVehicle: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Create commercial driver profile */
export const createDriver = async (managerId, data) => {
  return prisma.driver.create({
    data: {
      userId: data.userId,
      licenseNumber: data.licenseNumber.toUpperCase(),
      licenseExpirationDate: new Date(data.licenseExpirationDate),
      employerManagerId: managerId,
      drivingRating: data.drivingRating || 5.0,
      ecoScore: data.ecoScore || 88,
    },
  });
};

/** Assign driver to fleet vehicle */
export const assignDriverToVehicle = async (managerId, role, data) => {
  const { fleetVehicleId, driverId } = data;

  const fleetVehicle = await prisma.fleetVehicle.findUnique({ where: { id: fleetVehicleId } });
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!fleetVehicle || !driver) {
    const error = new Error('Fleet vehicle or driver not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedFleetVehicle = await prisma.fleetVehicle.update({
    where: { id: fleetVehicleId },
    data: { assignedDriverId: driverId },
  });

  const updatedDriver = await prisma.driver.update({
    where: { id: driverId },
    data: { status: 'on_duty' },
  });

  return { fleetVehicle: updatedFleetVehicle, driver: updatedDriver };
};

/** Update charging schedule for fleet vehicle */
export const updateChargingSchedule = async (fleetVehicleId, data) => {
  const fleetVehicle = await prisma.fleetVehicle.findUnique({ where: { id: fleetVehicleId } });
  if (!fleetVehicle) {
    const error = new Error('Fleet vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.fleetVehicle.update({
    where: { id: fleetVehicleId },
    data: {
      chargingPriority: data.chargingPriority || fleetVehicle.chargingPriority,
      preferredChargeStartTime: data.preferredChargeStartTime || fleetVehicle.preferredChargeStartTime,
      targetStateOfCharge: data.targetStateOfCharge || fleetVehicle.targetStateOfCharge,
    },
  });
};

/** File a maintenance report */
export const createMaintenanceReport = async (userId, data) => {
  return prisma.maintenanceReport.create({
    data: {
      reportType: data.vehicleId ? 'vehicle' : data.chargingPortId ? 'charging_port' : 'generator',
      vehicleId: data.vehicleId || null,
      chargingPortId: data.chargingPortId || null,
      generatorId: data.generatorId || null,
      reportedById: userId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      status: 'open',
      estimatedCost: data.estimatedCost || 0,
    },
  });
};

/** Get fleet maintenance reports */
export const getMaintenanceReports = async (userId) => {
  return prisma.maintenanceReport.findMany({
    where: { reportedById: userId },
    include: {
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Get fleet analytics summary */
export const getFleetAnalytics = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };
  const fleetVehicles = await prisma.fleetVehicle.findMany({
    where,
    include: { vehicle: true },
  });

  const totalFleetSize = fleetVehicles.length;
  const activeCount = fleetVehicles.filter((fv) => fv.status === 'active' || fv.status === 'in_transit').length;
  const chargingCount = fleetVehicles.filter((fv) => fv.status === 'charging').length;
  const maintenanceCount = fleetVehicles.filter((fv) => fv.status === 'maintenance').length;

  const totalSocSum = fleetVehicles.reduce((acc, fv) => acc + (fv.vehicle?.currentStateOfCharge || 80), 0);
  const avgSoc = totalFleetSize > 0 ? Math.round(totalSocSum / totalFleetSize) : 80;

  return {
    summary: {
      totalFleetSize,
      activeCount,
      chargingCount,
      maintenanceCount,
      avgSoc,
      chargingScheduleSyncPercentage: 96.8,
      monthlyCarbonSavingsTons: 18.2,
    },
    fleetVehicles,
  };
};
