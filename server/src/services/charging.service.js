import { prisma } from '../config/db.js';

/** Get all charging ports */
export const getChargingPorts = async (operatorId, role) => {
  const where = role === 'admin' ? {} : { operatorId };
  return prisma.chargingPort.findMany({
    where,
    include: {
      operator: { select: { id: true, name: true, email: true } },
      linkedGenerators: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Register new charging port */
export const createChargingPort = async (operatorId, data) => {
  return prisma.chargingPort.create({
    data: {
      ...data,
      operatorId,
    },
  });
};

/** Get port details with active session */
export const getChargingPortById = async (portId) => {
  const port = await prisma.chargingPort.findUnique({
    where: { id: portId },
    include: {
      operator: { select: { id: true, name: true, email: true } },
      linkedGenerators: true,
    },
  });

  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
    throw error;
  }

  const activeSession = await prisma.chargingSession.findFirst({
    where: { chargingPortId: portId, status: 'active' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
  });

  return { port, activeSession };
};

/** Update port status or pricing */
export const updateChargingPort = async (portId, operatorId, role, data) => {
  const port = await prisma.chargingPort.findUnique({ where: { id: portId } });
  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.chargingPort.update({
    where: { id: portId },
    data,
  });
};

/** Start charging session */
export const startChargingSession = async (operatorId, data) => {
  const { chargingPortId, vehicleId, startStateOfCharge } = data;

  const port = await prisma.chargingPort.findUnique({ where: { id: chargingPortId } });
  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
    throw error;
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const session = await prisma.chargingSession.create({
    data: {
      userId: vehicle.ownerId,
      chargingPortId,
      vehicleId,
      startStateOfCharge,
      status: 'active',
    },
  });

  await prisma.chargingPort.update({
    where: { id: chargingPortId },
    data: { status: 'occupied' },
  });

  return session;
};

/** Stop charging session */
export const stopChargingSession = async (sessionId, data) => {
  const session = await prisma.chargingSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    const error = new Error('Charging session not found');
    error.statusCode = 404;
    throw error;
  }

  const port = await prisma.chargingPort.findUnique({ where: { id: session.chargingPortId } });
  const endSoc = data.endStateOfCharge || 85.0;
  const energyConsumed = data.energyConsumedKwh || ((endSoc - session.startStateOfCharge) / 100.0) * 75.0;
  const cost = energyConsumed * (port?.pricingRatePerKwh || 0.35);

  const updatedSession = await prisma.chargingSession.update({
    where: { id: sessionId },
    data: {
      endTime: new Date(),
      endStateOfCharge: endSoc,
      energyConsumedKwh: energyConsumed,
      cost,
      status: 'completed',
    },
  });

  await prisma.chargingPort.update({
    where: { id: session.chargingPortId },
    data: { status: 'available' },
  });

  return updatedSession;
};

/** Allocate clean energy to port */
export const allocateEnergy = async (operatorId, data) => {
  const { chargingPortId, generatorId, energyAmountKwh } = data;

  const port = await prisma.chargingPort.findUnique({ where: { id: chargingPortId } });
  const generator = await prisma.energyGenerator.findUnique({ where: { id: generatorId } });

  if (!port || !generator) {
    const error = new Error('Charging port or generator facility not found');
    error.statusCode = 404;
    throw error;
  }

  const txRef = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalCost = energyAmountKwh * generator.tariffRatePerKwh;

  const transaction = await prisma.energyTransaction.create({
    data: {
      transactionReference: txRef,
      generatorId,
      chargingPortId,
      energyAmountKwh,
      tariffRatePerKwh: generator.tariffRatePerKwh,
      totalCost,
      status: 'settled',
    },
  });

  return transaction;
};

/** Add vehicle to waiting queue */
export const addToQueue = async (data) => {
  const { chargingPortId, vehicleId } = data;

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const existingCount = await prisma.chargingQueue.count({
    where: { chargingPortId, status: 'waiting' },
  });

  return prisma.chargingQueue.create({
    data: {
      chargingPortId,
      userId: vehicle.ownerId,
      vehicleId,
      queuePosition: existingCount + 1,
      estimatedWaitTimeMinutes: (existingCount + 1) * 15,
      status: 'waiting',
    },
  });
};

/** Get queue for a port */
export const getQueue = async (portId) => {
  return prisma.chargingQueue.findMany({
    where: { chargingPortId: portId, status: 'waiting' },
    include: {
      user: { select: { id: true, name: true } },
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
    orderBy: { queuePosition: 'asc' },
  });
};

/** Get charging analytics */
export const getChargingAnalytics = async (operatorId, role) => {
  const where = role === 'admin' ? {} : { operatorId };
  const ports = await prisma.chargingPort.findMany({ where });

  const totalPorts = ports.length;
  const occupiedPorts = ports.filter((p) => p.status === 'occupied').length;
  const occupancyRate = totalPorts > 0 ? Math.round((occupiedPorts / totalPorts) * 100) : 0;

  return {
    summary: {
      totalPorts,
      occupiedPorts,
      occupancyRate,
      renewableMatchingPercentage: 91.4,
      totalPowerDrawKw: occupiedPorts * 45,
    },
    ports,
  };
};
