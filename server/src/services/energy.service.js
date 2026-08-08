import { prisma } from '../config/db.js';
import { createNotification } from './notification.service.js';

/** Get all energy generators for an operator */
export const getGenerators = async (operatorId, role) => {
  const where = role === 'admin' ? {} : { operatorId };
  return prisma.energyGenerator.findMany({
    where,
    include: {
      operator: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Register new generator facility */
export const createGenerator = async (operatorId, data) => {
  return prisma.energyGenerator.create({
    data: {
      ...data,
      operatorId,
      currentOutputKw: data.capacityKw * 0.8,
      excessEnergyKw: data.capacityKw * 0.4,
    },
  });
};

/** Get a single generator by ID (with ownership guard) */
export const getGeneratorById = async (generatorId, operatorId, role) => {
  const generator = await prisma.energyGenerator.findUnique({
    where: { id: generatorId },
    include: {
      operator: { select: { id: true, name: true, email: true } },
      productionLogs: { orderBy: { recordedAt: 'desc' }, take: 10 },
    },
  });

  if (!generator) {
    const error = new Error('Generator facility not found');
    error.statusCode = 404;
    throw error;
  }

  if (role !== 'admin' && generator.operatorId !== operatorId) {
    const error = new Error('Not authorized to access this generator');
    error.statusCode = 403;
    throw error;
  }

  return generator;
};

/** Update generator facility details */
export const updateGenerator = async (generatorId, operatorId, role, data) => {
  const generator = await prisma.energyGenerator.findUnique({ where: { id: generatorId } });
  if (!generator) {
    const error = new Error('Generator facility not found');
    error.statusCode = 404;
    throw error;
  }

  if (role !== 'admin' && generator.operatorId !== operatorId) {
    const error = new Error('Not authorized to update this generator');
    error.statusCode = 403;
    throw error;
  }

  return prisma.energyGenerator.update({
    where: { id: generatorId },
    data,
  });
};

/** Log power output production */
export const logProduction = async (generatorId, operatorId, data) => {
  const generator = await prisma.energyGenerator.findUnique({
    where: { id: generatorId },
  });
  if (!generator) {
    const error = new Error('Generator facility not found');
    error.statusCode = 404;
    throw error;
  }

  const energyProducedKwh = parseFloat(data.energyProducedKwh ?? data.energyGeneratedKwh);
  const peakOutputKw = parseFloat(data.peakOutputKw);

  const log = await prisma.energyProductionLog.create({
    data: {
      generatorId,
      energyProducedKwh,
      peakOutputKw,
    },
  });

  const updatedCurrentOutput = peakOutputKw;
  const updatedExcess = Math.max(0, generator.excessEnergyKw + energyProducedKwh);
  const earnedRevenue = energyProducedKwh * generator.tariffRatePerKwh;

  const updatedGenerator = await prisma.energyGenerator.update({
    where: { id: generatorId },
    data: {
      currentOutputKw: updatedCurrentOutput,
      excessEnergyKw: updatedExcess,
      totalRevenue: generator.totalRevenue + earnedRevenue,
    },
  });

  return { log, generator: updatedGenerator };
};

/** Get generator analytics */
export const getGeneratorAnalytics = async (operatorId, role) => {
  const where = role === 'admin' ? {} : { operatorId };
  const generators = await prisma.energyGenerator.findMany({ where });

  const totalCapacityKw = generators.reduce((acc, g) => acc + g.capacityKw, 0);
  const totalCurrentOutputKw = generators.reduce((acc, g) => acc + g.currentOutputKw, 0);
  const totalExcessEnergyKw = generators.reduce((acc, g) => acc + g.excessEnergyKw, 0);
  const totalRevenue = generators.reduce((acc, g) => acc + g.totalRevenue, 0);

  return {
    summary: {
      totalFacilities: generators.length,
      totalCapacityKw,
      totalCurrentOutputKw,
      totalExcessEnergyKw,
      totalRevenue,
    },
    generators,
  };
};

/** Get energy credit transactions */
export const getEnergyTransactions = async (operatorId, role) => {
  const where = role === 'admin' ? {} : { generator: { operatorId } };
  return prisma.energyTransaction.findMany({
    where,
    include: {
      generator: { select: { id: true, name: true, type: true } },
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Create an energy offer for sale */
export const createOffer = async (operatorId, data) => {
  const { generatorId, energyAmountKwh, pricePerKwh, minPurchaseKwh } = data;

  const generator = await prisma.energyGenerator.findUnique({ where: { id: generatorId } });
  if (!generator) {
    const error = new Error('Generator facility not found');
    error.statusCode = 404;
    throw error;
  }
  if (generator.operatorId !== operatorId) {
    const error = new Error('Not authorized to sell energy from this generator facility');
    error.statusCode = 403;
    throw error;
  }

  return prisma.energyOffer.create({
    data: {
      generatorId,
      energyAmountKwh: parseFloat(energyAmountKwh),
      availableKwh: parseFloat(energyAmountKwh),
      pricePerKwh: parseFloat(pricePerKwh),
      minPurchaseKwh: minPurchaseKwh ? parseFloat(minPurchaseKwh) : 10,
      status: 'active',
    },
    include: {
      generator: {
        select: {
          id: true,
          name: true,
          type: true,
          locationAddress: true,
          locationCity: true,
          operator: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
};

/** Get active marketplace energy offers (for Charging Port Owners) */
export const getActiveOffers = async () => {
  return prisma.energyOffer.findMany({
    where: {
      status: 'active',
      availableKwh: { gt: 0 },
    },
    include: {
      generator: {
        select: {
          id: true,
          name: true,
          type: true,
          capacityKw: true,
          locationAddress: true,
          locationCity: true,
          operator: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Get offers created by the logged in generator */
export const getMyOffers = async (operatorId) => {
  return prisma.energyOffer.findMany({
    where: {
      generator: { operatorId },
    },
    include: {
      generator: {
        select: { id: true, name: true, type: true, locationAddress: true, locationCity: true },
      },
      purchaseRequests: {
        include: {
          chargingPort: { select: { id: true, stationName: true, portIdentifier: true, locationAddress: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Create energy purchase request (Port Owner -> Generator) */
export const createPurchaseRequest = async (userId, role, data) => {
  const { offerId, chargingPortId, requestedKwh } = data;

  const port = await prisma.chargingPort.findUnique({ where: { id: chargingPortId } });
  if (!port) {
    const error = new Error('Charging port not found');
    error.statusCode = 404;
    throw error;
  }
  if (role !== 'admin' && port.operatorId !== userId) {
    const error = new Error('Not authorized to purchase energy for this charging port');
    error.statusCode = 403;
    throw error;
  }

  const offer = await prisma.energyOffer.findUnique({
    where: { id: offerId },
    include: { generator: { select: { id: true, name: true, operatorId: true } } },
  });

  if (!offer || offer.status !== 'active') {
    const error = new Error('Energy offer is no longer active');
    error.statusCode = 400;
    throw error;
  }

  const reqKwh = parseFloat(requestedKwh);
  if (reqKwh > offer.availableKwh) {
    const error = new Error(`Insufficient available energy. Maximum remaining: ${offer.availableKwh} kWh`);
    error.statusCode = 400;
    throw error;
  }

  const totalCost = reqKwh * offer.pricePerKwh;
  const requestReference = 'REQ-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const purchaseRequest = await prisma.energyPurchaseRequest.create({
    data: {
      requestReference,
      offerId,
      chargingPortId,
      requestedKwh: reqKwh,
      pricePerKwh: offer.pricePerKwh,
      totalCost,
      status: 'pending',
    },
    include: {
      offer: { include: { generator: true } },
      chargingPort: true,
    },
  });

  // Send notification to Generator Operator
  await createNotification({
    userId: offer.generator.operatorId,
    title: 'New Energy Purchase Request ⚡',
    message: `${port.stationName} requested ${reqKwh} kWh of clean energy at $${offer.pricePerKwh}/kWh (Total: $${totalCost.toFixed(2)}).`,
    type: 'info',
  });

  return purchaseRequest;
};

/** Get purchase requests received by Generator Operator */
export const getReceivedRequests = async (operatorId) => {
  return prisma.energyPurchaseRequest.findMany({
    where: {
      offer: { generator: { operatorId } },
    },
    include: {
      offer: { include: { generator: { select: { id: true, name: true, type: true } } } },
      chargingPort: {
        select: {
          id: true,
          stationName: true,
          portIdentifier: true,
          locationAddress: true,
          locationCity: true,
          operator: { select: { id: true, name: true, email: true } },
        },
      },
      transaction: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Get purchase requests submitted by Charging Port Owner */
export const getMyPurchaseRequests = async (userId) => {
  return prisma.energyPurchaseRequest.findMany({
    where: {
      chargingPort: { operatorId: userId },
    },
    include: {
      offer: { include: { generator: { select: { id: true, name: true, type: true, locationAddress: true } } } },
      chargingPort: { select: { id: true, stationName: true, portIdentifier: true } },
      transaction: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/** Respond to Purchase Request (Accept / Reject) */
export const updateRequestStatus = async (requestId, operatorId, role, newStatus) => {
  const request = await prisma.energyPurchaseRequest.findUnique({
    where: { id: requestId },
    include: {
      offer: { include: { generator: true } },
      chargingPort: { select: { id: true, stationName: true, operatorId: true } },
    },
  });

  if (!request) {
    const error = new Error('Purchase request not found');
    error.statusCode = 404;
    throw error;
  }

  if (role !== 'admin' && request.offer.generator.operatorId !== operatorId) {
    const error = new Error('Not authorized to respond to this request');
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== 'pending') {
    const error = new Error(`Request has already been ${request.status}`);
    error.statusCode = 400;
    throw error;
  }

  if (newStatus === 'rejected') {
    const updated = await prisma.energyPurchaseRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    });

    await createNotification({
      userId: request.chargingPort.operatorId,
      title: 'Energy Request Declined ❌',
      message: `Your request for ${request.requestedKwh} kWh from ${request.offer.generator.name} was declined.`,
      type: 'warning',
    });

    return updated;
  }

  if (newStatus === 'accepted') {
    return prisma.$transaction(async (tx) => {
      const currentOffer = await tx.energyOffer.findUnique({ where: { id: request.offerId } });
      if (!currentOffer || currentOffer.availableKwh < request.requestedKwh) {
        throw new Error(`Insufficient available energy. Maximum remaining: ${currentOffer?.availableKwh || 0} kWh`);
      }

      const newAvailable = currentOffer.availableKwh - request.requestedKwh;
      const offerStatus = newAvailable <= 0 ? 'closed' : 'active';

      await tx.energyOffer.update({
        where: { id: request.offerId },
        data: {
          availableKwh: newAvailable,
          status: offerStatus,
        },
      });

      await tx.energyGenerator.update({
        where: { id: request.offer.generatorId },
        data: {
          totalRevenue: { increment: request.totalCost },
        },
      });

      const txRef = 'TX-ENERGY-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const transaction = await tx.energyTransaction.create({
        data: {
          transactionReference: txRef,
          generatorId: request.offer.generatorId,
          chargingPortId: request.chargingPortId,
          energyAmountKwh: request.requestedKwh,
          tariffRatePerKwh: request.pricePerKwh,
          totalCost: request.totalCost,
          status: 'delivered',
        },
      });

      const updatedRequest = await tx.energyPurchaseRequest.update({
        where: { id: requestId },
        data: {
          status: 'accepted',
          transactionId: transaction.id,
        },
        include: {
          offer: { include: { generator: true } },
          chargingPort: true,
          transaction: true,
        },
      });

      await createNotification({
        userId: request.chargingPort.operatorId,
        title: 'Energy Request Accepted! ⚡',
        message: `Your request for ${request.requestedKwh} kWh from ${request.offer.generator.name} was accepted and $${request.totalCost.toFixed(2)} energy delivered to ${request.chargingPort.stationName}.`,
        type: 'success',
      });

      await createNotification({
        userId: request.offer.generator.operatorId,
        title: 'Energy Sale Settled! 💰',
        message: `Sold ${request.requestedKwh} kWh to ${request.chargingPort.stationName} for $${request.totalCost.toFixed(2)}.`,
        type: 'success',
      });

      return updatedRequest;
    });
  }
};

/** Get Admin Trading Overview */
export const getAdminTradingData = async () => {
  const [offers, requests, transactions] = await Promise.all([
    prisma.energyOffer.findMany({
      include: { generator: { select: { id: true, name: true, type: true, operator: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.energyPurchaseRequest.findMany({
      include: {
        offer: { include: { generator: { select: { name: true } } } },
        chargingPort: { select: { stationName: true, operator: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.energyTransaction.findMany({
      include: {
        generator: { select: { name: true } },
        chargingPort: { select: { stationName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalEnergyTradedKwh = transactions.reduce((acc, t) => acc + t.energyAmountKwh, 0);
  const totalValueTraded = transactions.reduce((acc, t) => acc + t.totalCost, 0);

  return {
    summary: {
      totalOffersCount: offers.length,
      totalRequestsCount: requests.length,
      totalTransactionsCount: transactions.length,
      totalEnergyTradedKwh,
      totalValueTraded,
    },
    offers,
    requests,
    transactions,
  };
};
