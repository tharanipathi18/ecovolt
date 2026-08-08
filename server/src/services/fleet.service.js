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

  // ── Charging stats: 2 additional queries keyed on fleet vehicles already loaded ──
  const vehicleIds = fleetVehicles.map((v) => v.id);

  let pendingChargingCount = 0;
  let completedChargingCount = 0;
  let totalChargingCost = 0;

  if (vehicleIds.length > 0 || role === 'admin') {
    const chargingBookingWhere =
      role === 'admin'
        ? { fleetVehicleId: { not: null }, status: 'pending' }
        : { userId: managerId, fleetVehicleId: { not: null }, status: 'pending' };

    const chargingSessionWhere =
      role === 'admin'
        ? { fleetVehicleId: { not: null } }
        : { fleetVehicleId: { in: vehicleIds } };

    const [pendingCount, fleetSessions] = await Promise.all([
      prisma.booking.count({ where: chargingBookingWhere }),
      prisma.chargingSession.findMany({
        where: chargingSessionWhere,
        select: { cost: true, status: true },
      }),
    ]);

    pendingChargingCount = pendingCount;
    completedChargingCount = fleetSessions.filter((s) => s.status === 'completed').length;
    totalChargingCost = Number(
      fleetSessions.reduce((acc, s) => acc + (s.cost || 0), 0).toFixed(2),
    );
  }

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
      pendingChargingCount,
      completedChargingCount,
      totalChargingCost,
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

// ─── Fleet Charging ─────────────────────────────────────────────────────────

/**
 * Haversine distance calculation (returns km).
 */
const calcDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

/**
 * Find nearby approved charging ports for a fleet manager.
 * Returns all APPROVED, public ports — optionally sorted by distance.
 */
export const getNearbyPortsForFleet = async (_managerId, lat, lng) => {
  const ports = await prisma.chargingPort.findMany({
    where: {
      isApproved: true,
      approvalStatus: 'APPROVED',
      isPublic: true,
      status: { in: ['available', 'occupied', 'reserved'] },
    },
    include: {
      operator: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (lat && lng) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const portsWithDist = ports.map((p) => ({
      ...p,
      distanceKm:
        p.latitude && p.longitude
          ? calcDistanceKm(parsedLat, parsedLng, p.latitude, p.longitude)
          : null,
    }));
    return portsWithDist.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  return ports;
};

/**
 * Create a fleet charging slot booking (status = pending, awaiting station owner approval).
 */
export const createFleetBooking = async (managerId, data) => {
  const { fleetVehicleId, chargingPortId, scheduledStartTime, durationMinutes } = data;

  // Verify fleet vehicle belongs to this manager
  const fleetVehicle = await prisma.fleetVehicle.findFirst({
    where: { id: fleetVehicleId, managerId },
  });
  if (!fleetVehicle) {
    const error = new Error('Fleet vehicle not found or not authorized');
    error.statusCode = 404;
    throw error;
  }

  // Verify charging port exists and is approved
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

  const requestedStart = new Date(scheduledStartTime);
  if (isNaN(requestedStart.getTime())) {
    const error = new Error('Invalid scheduled start time');
    error.statusCode = 400;
    throw error;
  }

  const duration = durationMinutes ? parseInt(durationMinutes, 10) : 60;
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 1000);

  // Double-booking check
  const existingBookings = await prisma.booking.findMany({
    where: { chargingPortId, status: { in: ['confirmed', 'pending'] } },
  });

  const isDoubleBooked = existingBookings.some((existing) => {
    const existingStart = new Date(existing.scheduledStartTime);
    const existingEnd = new Date(
      existingStart.getTime() + existing.durationMinutes * 60 * 1000,
    );
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (isDoubleBooked) {
    const error = new Error(
      'This charging port is already booked for the selected time window',
    );
    error.statusCode = 409;
    throw error;
  }

  const bookingRef = `FLT-${Math.floor(100000 + Math.random() * 900000)}`;
  const rate = port.pricingRatePerKwh || 0.35;
  const estimatedEnergyKwh = Number(
    ((port.maxPowerOutputKw * (duration / 60)) * 0.8).toFixed(2),
  );
  const estimatedCost = Number((estimatedEnergyKwh * rate).toFixed(2));

  const booking = await prisma.booking.create({
    data: {
      bookingReference: bookingRef,
      userId: managerId,
      chargingPortId,
      fleetVehicleId,
      // vehicleId intentionally null — this is a fleet booking
      scheduledStartTime: requestedStart,
      durationMinutes: duration,
      estimatedCost,
      status: 'pending',
    },
    include: {
      chargingPort: {
        select: { id: true, stationName: true, portIdentifier: true, pricingRatePerKwh: true },
      },
      fleetVehicle: {
        select: { id: true, registrationNumber: true, make: true, model: true },
      },
    },
  });

  // Notify station owner
  await createNotification({
    userId: port.operatorId,
    title: 'Fleet Booking Request ⏳',
    message: `Fleet booking request (${bookingRef}) at ${port.stationName} for vehicle ${fleetVehicle.registrationNumber}. Please approve or reject.`,
    type: 'warning',
  });

  // Notify fleet manager
  await createNotification({
    userId: managerId,
    title: 'Fleet Booking Submitted ⏳',
    message: `Booking (${bookingRef}) for ${fleetVehicle.registrationNumber} at ${port.stationName} is pending station owner approval.`,
    type: 'info',
  });

  return booking;
};

/**
 * Get all charging bookings for fleet vehicles managed by this manager.
 */
export const getFleetBookings = async (managerId, role) => {
  const where =
    role === 'admin'
      ? { fleetVehicleId: { not: null } }
      : { userId: managerId, fleetVehicleId: { not: null } };

  return prisma.booking.findMany({
    where,
    include: {
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
      fleetVehicle: {
        select: { id: true, registrationNumber: true, make: true, model: true },
      },
    },
    orderBy: { scheduledStartTime: 'desc' },
  });
};

/**
 * Get all charging session history for fleet vehicles managed by this manager.
 */
export const getFleetChargingHistory = async (managerId, role) => {
  if (role === 'admin') {
    return prisma.chargingSession.findMany({
      where: { fleetVehicleId: { not: null } },
      include: {
        chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
        fleetVehicle: {
          select: { id: true, registrationNumber: true, make: true, model: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  // Get manager's fleet vehicle IDs
  const fleetVehicles = await prisma.fleetVehicle.findMany({
    where: { managerId },
    select: { id: true },
  });
  const vehicleIds = fleetVehicles.map((v) => v.id);

  if (vehicleIds.length === 0) return [];

  return prisma.chargingSession.findMany({
    where: { fleetVehicleId: { in: vehicleIds } },
    include: {
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
      fleetVehicle: {
        select: { id: true, registrationNumber: true, make: true, model: true },
      },
    },
    orderBy: { startTime: 'desc' },
  });
};

