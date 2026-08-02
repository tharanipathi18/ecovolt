import { prisma } from '../config/db.js';
import { createNotification } from './notification.service.js';
import bcrypt from 'bcryptjs';

// ─── Fleet Vehicles ────────────────────────────────────────────────────────

/**
 * Get all fleet vehicles for a given fleet manager (or all if admin).
 */
export const getFleetVehicles = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };
  return prisma.fleetVehicle.findMany({
    where,
    include: {
      assignedDriver: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      complaints: { where: { status: 'OPEN' }, select: { id: true } },
      maintenanceSchedules: {
        where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
        select: { id: true, status: true, estimatedCost: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Register a new fleet vehicle directly (no link to consumer Vehicle table).
 * All vehicle details are stored inline on FleetVehicle.
 */
export const registerFleetVehicle = async (managerId, data) => {
  // Prevent duplicate registration numbers
  const existing = await prisma.fleetVehicle.findUnique({
    where: { registrationNumber: data.registrationNumber.toUpperCase() },
  });
  if (existing) {
    const error = new Error(`Vehicle with registration number ${data.registrationNumber} is already registered`);
    error.statusCode = 409;
    throw error;
  }

  return prisma.fleetVehicle.create({
    data: {
      fleetName:               data.fleetName || 'EcoVolt Fleet',
      managerId,
      fleetUnitNumber:         data.fleetUnitNumber,
      registrationNumber:      data.registrationNumber.toUpperCase(),
      make:                    data.make,
      model:                   data.model,
      vehicleType:             data.vehicleType || 'car',
      batteryCapacityKwh:      parseFloat(data.batteryCapacityKwh) || 60.0,
      manufacturingYear:       parseInt(data.manufacturingYear) || new Date().getFullYear(),
      odometer:                parseFloat(data.odometer) || 0,
      connectorType:           data.connectorType || 'ccs_2',
      vehicleStatus:           data.vehicleStatus || 'ACTIVE',
      chargingPriority:        data.chargingPriority || 'medium',
      preferredChargeStartTime: data.preferredChargeStartTime || '22:00',
      targetStateOfCharge:     parseFloat(data.targetStateOfCharge) || 90.0,
    },
  });
};

/**
 * Update fleet vehicle status (ACTIVE, IN_MAINTENANCE, CHARGING, INACTIVE)
 */
export const updateFleetVehicleStatus = async (fleetVehicleId, managerId, vehicleStatus) => {
  const fv = await prisma.fleetVehicle.findFirst({ where: { id: fleetVehicleId, managerId } });
  if (!fv) {
    const error = new Error('Fleet vehicle not found or not authorized');
    error.statusCode = 404;
    throw error;
  }
  return prisma.fleetVehicle.update({
    where: { id: fleetVehicleId },
    data: { vehicleStatus },
  });
};

// ─── Drivers ───────────────────────────────────────────────────────────────

/**
 * Get all drivers employed by this fleet manager.
 */
export const getDrivers = async (managerId, role) => {
  const where = role === 'admin' ? {} : { employerManagerId: managerId };
  return prisma.driver.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      assignedFleetVehicle: {
        select: { id: true, registrationNumber: true, make: true, model: true, vehicleStatus: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Create a driver. Atomically creates a User (role=driver) + Driver profile.
 * Enforces: fleet manager must have at least one fleet vehicle before adding drivers.
 * Enforces: one active driver per vehicle.
 */
export const createDriver = async (managerId, data) => {
  // Guard: fleet manager must have at least one vehicle
  const vehicleCount = await prisma.fleetVehicle.count({ where: { managerId } });
  if (vehicleCount === 0) {
    const error = new Error('You must register at least one fleet vehicle before adding drivers');
    error.statusCode = 400;
    throw error;
  }

  // Guard: validate the assigned vehicle belongs to this manager
  if (data.assignedFleetVehicleId) {
    const fv = await prisma.fleetVehicle.findFirst({
      where: { id: data.assignedFleetVehicleId, managerId },
    });
    if (!fv) {
      const error = new Error('Fleet vehicle not found or does not belong to you');
      error.statusCode = 404;
      throw error;
    }
    // Guard: one driver per vehicle
    if (fv.assignedDriverId) {
      const error = new Error('This vehicle already has an assigned driver. Please unassign the current driver first');
      error.statusCode = 409;
      throw error;
    }
  }

  // Check if user with this email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser && existingUser.role !== 'driver') {
    const error = new Error('A user with this email already exists with a different role');
    error.statusCode = 409;
    throw error;
  }

  // Sequential operations (Supabase PgBouncer does not support interactive transactions)
  let driverUser = existingUser;

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('EcoVolt@Driver123', 10);
    driverUser = await prisma.user.create({
      data: {
        name:            data.name,
        email:           data.email,
        password:        hashedPassword,
        role:            'driver',
        phone:           data.phone || null,
        isEmailVerified: false,
        isActive:        true,
      },
    });
  }

  const driver = await prisma.driver.create({
    data: {
      userId:                driverUser.id,
      employerManagerId:     managerId,
      licenseNumber:         data.licenseNumber.toUpperCase(),
      licenseExpirationDate: new Date(data.licenseExpirationDate),
      drivingRating:         5.0,
      ecoScore:              100.0,
      status:                data.assignedFleetVehicleId ? 'on_duty' : 'available',
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (data.assignedFleetVehicleId) {
    await prisma.fleetVehicle.update({
      where: { id: data.assignedFleetVehicleId },
      data:  { assignedDriverId: driver.id },
    });
  }

  return driver;
};

/**
 * Assign or reassign a driver to a fleet vehicle.
 */
export const assignDriverToVehicle = async (managerId, data) => {
  const { fleetVehicleId, driverId } = data;

  const [fv, driver] = await Promise.all([
    prisma.fleetVehicle.findFirst({ where: { id: fleetVehicleId, managerId } }),
    prisma.driver.findFirst({ where: { id: driverId, employerManagerId: managerId } }),
  ]);

  if (!fv) {
    const error = new Error('Fleet vehicle not found or not authorized');
    error.statusCode = 404;
    throw error;
  }
  if (!driver) {
    const error = new Error('Driver not found or not employed by you');
    error.statusCode = 404;
    throw error;
  }
  if (fv.assignedDriverId && fv.assignedDriverId !== driverId) {
    const error = new Error('This vehicle already has an assigned driver');
    error.statusCode = 409;
    throw error;
  }

  // Sequential operations (PgBouncer compatibility)
  if (driver.assignedFleetVehicle) {
    await prisma.fleetVehicle.update({
      where: { id: driver.assignedFleetVehicle.id },
      data:  { assignedDriverId: null },
    });
  }

  const updatedFv = await prisma.fleetVehicle.update({
    where: { id: fleetVehicleId },
    data:  { assignedDriverId: driverId },
    include: {
      assignedDriver: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  await prisma.driver.update({
    where: { id: driverId },
    data:  { status: 'on_duty' },
  });

  return updatedFv;
};

// ─── Complaints ───────────────────────────────────────────────────────────

/**
 * Get all complaints for a fleet manager's vehicles.
 */
export const getComplaints = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };
  return prisma.complaint.findMany({
    where,
    include: {
      driver: { include: { user: { select: { id: true, name: true, email: true } } } },
      fleetVehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
      maintenanceSchedule: { select: { id: true, status: true, maintenanceDate: true } },
    },
    orderBy: { reportedAt: 'desc' },
  });
};

/**
 * Driver raises a complaint about their assigned vehicle.
 */
export const createComplaint = async (driverId, managerId, data) => {
  // Validate that the fleet vehicle belongs to this driver's employer
  const fv = await prisma.fleetVehicle.findFirst({
    where: { id: data.fleetVehicleId, managerId },
  });
  if (!fv) {
    const error = new Error('Fleet vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const complaint = await prisma.complaint.create({
    data: {
      fleetVehicleId: data.fleetVehicleId,
      driverId,
      managerId,
      title:          data.title,
      description:    data.description,
      category:       data.category || 'OTHER',
      priority:       data.priority || 'MEDIUM',
      status:         'OPEN',
    },
    include: {
      driver: { include: { user: { select: { id: true, name: true } } } },
      fleetVehicle: { select: { id: true, registrationNumber: true } },
    },
  });

  // Notify fleet manager
  await createNotification({
    userId:   managerId,
    title:    `New Complaint: ${data.title} 🚨`,
    message:  `Driver ${complaint.driver.user.name} filed a ${data.priority} priority complaint on vehicle ${fv.registrationNumber}.`,
    type:     data.priority === 'CRITICAL' ? 'error' : 'warning',
    severity: data.priority === 'CRITICAL' ? 'high' : 'medium',
  });

  return complaint;
};

/**
 * Update complaint status (fleet manager reviews).
 */
export const updateComplaintStatus = async (complaintId, managerId, status) => {
  const complaint = await prisma.complaint.findFirst({ where: { id: complaintId, managerId } });
  if (!complaint) {
    const error = new Error('Complaint not found or not authorized');
    error.statusCode = 404;
    throw error;
  }
  return prisma.complaint.update({
    where: { id: complaintId },
    data: { status },
  });
};

// ─── Maintenance Schedules ─────────────────────────────────────────────────

/**
 * Get all maintenance schedules for fleet manager's vehicles.
 */
export const getMaintenanceSchedules = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };
  return prisma.maintenanceSchedule.findMany({
    where,
    include: {
      fleetVehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
      complaint: { select: { id: true, title: true, category: true, priority: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Schedule maintenance in response to a complaint.
 * Automatically sets the fleet vehicle's vehicleStatus to IN_MAINTENANCE.
 */
export const scheduleMaintenance = async (managerId, data) => {
  // Validate the fleet vehicle
  const fv = await prisma.fleetVehicle.findFirst({ where: { id: data.fleetVehicleId, managerId } });
  if (!fv) {
    const error = new Error('Fleet vehicle not found or not authorized');
    error.statusCode = 404;
    throw error;
  }

  // If complaint provided, validate it
  if (data.complaintId) {
    const complaint = await prisma.complaint.findFirst({ where: { id: data.complaintId, managerId } });
    if (!complaint) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      throw error;
    }
  }

  // Sequential operations (PgBouncer compatibility)
  const schedule = await prisma.maintenanceSchedule.create({
    data: {
      fleetVehicleId:  data.fleetVehicleId,
      complaintId:     data.complaintId || null,
      managerId,
      mechanic:        data.mechanic,
      workshop:        data.workshop,
      maintenanceDate: new Date(data.maintenanceDate),
      estimatedCost:   parseFloat(data.estimatedCost) || 0,
      description:     data.description,
      status:          'SCHEDULED',
    },
    include: {
      fleetVehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
      complaint:    { select: { id: true, title: true } },
    },
  });

  await prisma.fleetVehicle.update({
    where: { id: data.fleetVehicleId },
    data:  { vehicleStatus: 'IN_MAINTENANCE' },
  });

  let driverUserId = null;
  if (data.complaintId) {
    await prisma.complaint.update({
      where: { id: data.complaintId },
      data:  { status: 'IN_REVIEW' },
    });
    const linkedComplaint = await prisma.complaint.findUnique({
      where: { id: data.complaintId },
      include: { driver: { select: { userId: true } } },
    });
    driverUserId = linkedComplaint?.driver?.userId || null;
  }

  if (driverUserId) {
    await createNotification({
      userId:   driverUserId,
      title:    'Maintenance Scheduled 🔧',
      message:  `Your complaint has been reviewed. Maintenance scheduled at ${data.workshop} on ${new Date(data.maintenanceDate).toLocaleDateString()}.`,
      type:     'info',
      severity: 'medium',
    });
  }

  return schedule;
};

/**
 * Update maintenance schedule status.
 */
export const updateMaintenanceStatus = async (scheduleId, managerId, status, actualCost) => {
  const schedule = await prisma.maintenanceSchedule.findFirst({ where: { id: scheduleId, managerId } });
  if (!schedule) {
    const error = new Error('Maintenance schedule not found');
    error.statusCode = 404;
    throw error;
  }

  // Sequential operations (PgBouncer compatibility)
  const updated = await prisma.maintenanceSchedule.update({
    where: { id: scheduleId },
    data: {
      status,
      actualCost: actualCost ? parseFloat(actualCost) : undefined,
    },
  });

  if (status === 'COMPLETED') {
    await prisma.fleetVehicle.update({
      where: { id: schedule.fleetVehicleId },
      data:  { vehicleStatus: 'ACTIVE' },
    });
    if (schedule.complaintId) {
      await prisma.complaint.update({
        where: { id: schedule.complaintId },
        data:  { status: 'RESOLVED' },
      });
    }
  }

  return updated;
};

// ─── Fleet Dashboard & Analytics ──────────────────────────────────────────

/**
 * Consolidated Fleet Dashboard Data.
 * Fetches vehicles, drivers, complaints, and maintenance in a SINGLE optimized payload.
 * Executes only 4 parallel queries instead of 13+, avoiding DB connection pool exhaustion.
 */
export const getFleetDashboard = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };
  const driverWhere = role === 'admin' ? {} : { employerManagerId: managerId };

  const [fleetVehicles, drivers, complaints, schedules] = await Promise.all([
    prisma.fleetVehicle.findMany({
      where,
      include: {
        assignedDriver: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } },
        },
        complaints: { where: { status: 'OPEN' }, select: { id: true, title: true, priority: true } },
        maintenanceSchedules: {
          where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          select: { id: true, status: true, maintenanceDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.driver.findMany({
      where: driverWhere,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        assignedFleetVehicle: {
          select: { id: true, registrationNumber: true, make: true, model: true, vehicleStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.complaint.findMany({
      where,
      include: {
        driver: { include: { user: { select: { id: true, name: true, email: true } } } },
        fleetVehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
        maintenanceSchedule: { select: { id: true, status: true, maintenanceDate: true } },
      },
      orderBy: { reportedAt: 'desc' },
    }),
    prisma.maintenanceSchedule.findMany({
      where,
      include: {
        fleetVehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
        complaint: { select: { id: true, title: true, category: true, priority: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Compute analytics summary in memory without extra DB count queries
  const totalFleet = fleetVehicles.length;
  const activeCount = fleetVehicles.filter((v) => v.vehicleStatus === 'ACTIVE').length;
  const chargingCount = fleetVehicles.filter((v) => v.vehicleStatus === 'CHARGING').length;
  const maintenanceCount = fleetVehicles.filter((v) => v.vehicleStatus === 'IN_MAINTENANCE').length;
  const inactiveCount = fleetVehicles.filter((v) => v.vehicleStatus === 'INACTIVE').length;
  const assignedDriversCount = fleetVehicles.filter((v) => v.assignedDriverId !== null).length;
  const pendingComplaintsCount = complaints.filter((c) => c.status === 'OPEN').length;
  const totalMaintenanceCost = Number(
    schedules.reduce((acc, s) => acc + (s.actualCost || s.estimatedCost || 0), 0).toFixed(2),
  );

  return {
    fleetVehicles,
    drivers,
    complaints,
    schedules,
    analytics: {
      totalFleet,
      activeCount,
      chargingCount,
      maintenanceCount,
      inactiveCount,
      assignedDriversCount,
      pendingComplaintsCount,
      totalMaintenanceCost,
    },
  };
};

/**
 * Get fleet analytics summary — optimized to 3 parallel DB queries instead of 9.
 */
export const getFleetAnalytics = async (managerId, role) => {
  const where = role === 'admin' ? {} : { managerId };

  const [fleetVehicles, openComplaintsCount, allSchedules] = await Promise.all([
    prisma.fleetVehicle.findMany({
      where,
      include: {
        assignedDriver: { include: { user: { select: { id: true, name: true } } } },
        complaints: { where: { status: 'OPEN' }, select: { id: true, title: true, priority: true } },
        maintenanceSchedules: { select: { id: true, status: true, maintenanceDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.complaint.count({ where: { ...where, status: 'OPEN' } }),
    prisma.maintenanceSchedule.findMany({ where, select: { estimatedCost: true, actualCost: true } }),
  ]);

  const totalFleet = fleetVehicles.length;
  const activeCount = fleetVehicles.filter((v) => v.vehicleStatus === 'ACTIVE').length;
  const chargingCount = fleetVehicles.filter((v) => v.vehicleStatus === 'CHARGING').length;
  const maintenanceCount = fleetVehicles.filter((v) => v.vehicleStatus === 'IN_MAINTENANCE').length;
  const inactiveCount = fleetVehicles.filter((v) => v.vehicleStatus === 'INACTIVE').length;
  const assignedDriversCount = fleetVehicles.filter((v) => v.assignedDriverId !== null).length;
  const totalMaintenanceCost = Number(
    allSchedules.reduce((acc, s) => acc + (s.actualCost || s.estimatedCost || 0), 0).toFixed(2),
  );

  return {
    summary: {
      totalFleet,
      activeCount,
      chargingCount,
      maintenanceCount,
      inactiveCount,
      assignedDriversCount,
      pendingComplaintsCount: openComplaintsCount,
      totalMaintenanceCost,
    },
    fleetVehicles,
  };
};

/**
 * Update charging schedule for fleet vehicle.
 */
export const updateChargingSchedule = async (fleetVehicleId, data) => {
  const fv = await prisma.fleetVehicle.findUnique({ where: { id: fleetVehicleId } });
  if (!fv) {
    const error = new Error('Fleet vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return prisma.fleetVehicle.update({
    where: { id: fleetVehicleId },
    data: {
      chargingPriority:        data.chargingPriority || fv.chargingPriority,
      preferredChargeStartTime: data.preferredChargeStartTime || fv.preferredChargeStartTime,
      targetStateOfCharge:     data.targetStateOfCharge || fv.targetStateOfCharge,
    },
  });
};
