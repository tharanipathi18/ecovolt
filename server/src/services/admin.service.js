import { prisma } from '../config/db.js';

// In-memory system settings default
let systemSettings = {
  maintenanceMode: false,
  rateLimitMaxRequests: 100,
  aiServiceUrl: 'http://localhost:8000',
  jwtExpire: '7d',
  gridSyncFrequencySeconds: 15,
};

/** Get platform-wide overview metrics */
export const getSystemOverview = async () => {
  const usersCount = await prisma.user.count();
  const generatorsCount = await prisma.energyGenerator.count();
  const portsCount = await prisma.chargingPort.count();
  const fleetCount = await prisma.fleetVehicle.count();
  const activePortsCount = await prisma.chargingPort.count({ where: { status: 'occupied' } });

  const transactions = await prisma.energyTransaction.findMany({ where: { status: 'settled' } });
  const totalKwh = transactions.reduce((acc, t) => acc + t.energyAmountKwh, 0);
  const totalRevenue = transactions.reduce((acc, t) => acc + t.totalCost, 0);

  return {
    usersCount,
    generatorsCount,
    portsCount,
    activePortsCount,
    fleetCount,
    totalEnergyGwh: Number((totalKwh / 1000000).toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    systemHealthPercentage: 100,
  };
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

/** Dispatch in-app notification */
export const sendNotification = async (_senderId, data) => {
  const { recipientId, title, message, type, severity } = data;

  if (recipientId) {
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        title,
        message,
        type: type || 'system',
        severity: severity || 'info',
      },
    });
    return [notification];
  }

  // Broadcast to all active users
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  return prisma.$transaction(
    allUsers.map((u) =>
      prisma.notification.create({
        data: {
          recipientId: u.id,
          title,
          message,
          type: type || 'system',
          severity: severity || 'info',
        },
      }),
    ),
  );
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
