import { prisma } from '../config/db.js';
import { createNotification } from './notification.service.js';

// Centralized System Settings
let systemSettings = {
  maintenanceMode: false,
  rateLimitMaxRequests: 100,
  aiServiceUrl: 'http://localhost:8000',
  jwtExpire: '7d',
  gridSyncFrequencySeconds: 15,
};

/** Get platform-wide overview metrics directly from DB */
export const getSystemOverview = async () => {
  const usersCount = await prisma.user.count();
  const generatorsCount = await prisma.energyGenerator.count();
  const portsCount = await prisma.chargingPort.count({ where: { isApproved: true } });
  const pendingApplicationsCount = await prisma.chargingPort.count({ where: { approvalStatus: 'PENDING' } });
  const vehiclesCount = await prisma.vehicle.count();
  const bookingsCount = await prisma.booking.count();
  const sessionsCount = await prisma.chargingSession.count();

  const transactions = await prisma.energyTransaction.findMany({ where: { status: 'settled' } });
  const totalKwh = transactions.reduce((acc, t) => acc + t.energyAmountKwh, 0);
  const totalRevenue = transactions.reduce((acc, t) => acc + t.totalCost, 0);

  return {
    usersCount,
    generatorsCount,
    portsCount,
    pendingApplicationsCount,
    vehiclesCount,
    bookingsCount,
    sessionsCount,
    totalEnergyGwh: Number((totalKwh / 1000000).toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    systemHealthPercentage: 100,
  };
};

/** Get all pending station applications for Admin review */
export const getPendingStationApplications = async () => {
  return prisma.chargingPort.findMany({
    where: { approvalStatus: 'PENDING' },
    include: {
      operator: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Admin Approve or Reject Station Application */
export const reviewStationApplication = async (portId, decision) => {
  const port = await prisma.chargingPort.findUnique({ where: { id: portId } });
  if (!port) {
    const error = new Error('Station application not found');
    error.statusCode = 404;
    throw error;
  }

  const isApproved = decision === 'APPROVE';
  const approvalStatus = isApproved ? 'APPROVED' : 'REJECTED';
  const status = isApproved ? 'available' : 'rejected';

  const updatedPort = await prisma.chargingPort.update({
    where: { id: portId },
    data: {
      isApproved,
      approvalStatus,
      status,
    },
    include: {
      operator: { select: { id: true, name: true, email: true } },
    },
  });

  // Dispatch Notification to Station Owner
  if (isApproved) {
    await createNotification({
      userId: port.operatorId,
      title: 'Station Application APPROVED! ⚡',
      message: `Congratulations! Your charging station "${port.stationName}" has been approved by Admin and is now live on EcoVolt.`,
      type: 'success',
      severity: 'medium',
    });
  } else {
    await createNotification({
      userId: port.operatorId,
      title: 'Station Application Rejected ❌',
      message: `Your application for charging station "${port.stationName}" was rejected. Please contact support.`,
      type: 'error',
      severity: 'medium',
    });
  }

  return updatedPort;
};

/** Get paginated list of all users */
export const getAllUsers = async (query = {}) => {
  const where = {};
  if (query.role) where.role = query.role;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Update user role or active status */
export const updateUserRoleAndStatus = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      role: data.role || user.role,
      isActive: data.isActive !== undefined ? data.isActive : user.isActive,
    },
  });
};

/** Get all system vehicles */
export const getAllVehicles = async () => {
  return prisma.vehicle.findMany({
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

/** Get all system bookings */
export const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
      user: { select: { id: true, name: true, email: true } },
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
    orderBy: { scheduledStartTime: 'desc' },
  });
};

/** Get all system charging sessions */
export const getAllSessions = async () => {
  return prisma.chargingSession.findMany({
    include: {
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
      user: { select: { id: true, name: true, email: true } },
      vehicle: { select: { id: true, make: true, model: true, licensePlate: true } },
    },
    orderBy: { startTime: 'desc' },
  });
};

/** Get all system generators */
export const getAllGenerators = async () => {
  return prisma.energyGenerator.findMany({
    include: { operator: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

/** Get all system charging ports */
export const getAllPorts = async () => {
  return prisma.chargingPort.findMany({
    include: {
      operator: { select: { id: true, name: true, email: true } },
      linkedGenerators: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Get all energy transactions */
export const getAllTransactions = async () => {
  return prisma.energyTransaction.findMany({
    include: {
      generator: { select: { id: true, name: true, type: true } },
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
};

/** Get system settings */
export const getSystemSettings = () => {
  return systemSettings;
};

/** Update system settings */
export const updateSystemSettings = (data) => {
  systemSettings = { ...systemSettings, ...data };
  return systemSettings;
};
