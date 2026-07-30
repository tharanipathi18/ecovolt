import { prisma } from '../config/db.js';

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

  const { energyProducedKwh, peakOutputKw } = data;
  const log = await prisma.energyProductionLog.create({
    data: {
      generatorId,
      energyProducedKwh,
      peakOutputKw,
    },
  });

  const updatedCurrentOutput = peakOutputKw;
  const updatedExcess = Math.max(0, energyProducedKwh - peakOutputKw * 0.5);
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
    orderBy: { timestamp: 'desc' },
  });
};
