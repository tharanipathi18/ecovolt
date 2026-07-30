-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ev_user',
    "phone" TEXT,
    "avatar" TEXT,
    "addressStreet" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressZipCode" TEXT,
    "addressCountry" TEXT DEFAULT 'USA',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordExpire" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_generators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacityKw" DOUBLE PRECISION NOT NULL,
    "currentOutputKw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "excessEnergyKw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tariffRatePerKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.12,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "gridConnection" TEXT NOT NULL DEFAULT 'grid',
    "locationAddress" TEXT,
    "locationCity" TEXT,
    "locationState" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_generators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_production_logs" (
    "id" TEXT NOT NULL,
    "generatorId" TEXT NOT NULL,
    "energyProducedKwh" DOUBLE PRECISION NOT NULL,
    "peakOutputKw" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_production_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_ports" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "portIdentifier" TEXT NOT NULL,
    "connectorType" TEXT NOT NULL,
    "maxPowerOutputKw" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'available',
    "pricingRatePerKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "locationCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_queues" (
    "id" TEXT NOT NULL,
    "chargingPortId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "queuePosition" INTEGER NOT NULL,
    "estimatedWaitTimeMinutes" INTEGER NOT NULL DEFAULT 15,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vin" TEXT,
    "batteryCapacityKwh" DOUBLE PRECISION NOT NULL,
    "currentStateOfCharge" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "connectorType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chargingPortId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_vehicles" (
    "id" TEXT NOT NULL,
    "fleetName" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "assignedDriverId" TEXT,
    "fleetUnitNumber" TEXT NOT NULL,
    "chargingPriority" TEXT NOT NULL DEFAULT 'medium',
    "preferredChargeStartTime" TEXT NOT NULL DEFAULT '22:00',
    "targetStateOfCharge" DOUBLE PRECISION NOT NULL DEFAULT 90,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employerManagerId" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpirationDate" TIMESTAMP(3) NOT NULL,
    "drivingRating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "ecoScore" DOUBLE PRECISION NOT NULL DEFAULT 85.0,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chargingPortId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "startStateOfCharge" DOUBLE PRECISION NOT NULL,
    "endStateOfCharge" DOUBLE PRECISION,
    "energyConsumedKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renewableEnergyPercentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_transactions" (
    "id" TEXT NOT NULL,
    "transactionReference" TEXT NOT NULL,
    "generatorId" TEXT NOT NULL,
    "chargingPortId" TEXT NOT NULL,
    "energyAmountKwh" DOUBLE PRECISION NOT NULL,
    "tariffRatePerKwh" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battery_reports" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "stateOfHealthPercentage" DOUBLE PRECISION NOT NULL,
    "stateOfChargePercentage" DOUBLE PRECISION NOT NULL,
    "batteryTemperatureCelsius" DOUBLE PRECISION NOT NULL,
    "voltage" DOUBLE PRECISION NOT NULL,
    "fastChargeCycles" INTEGER NOT NULL DEFAULT 0,
    "healthStatus" TEXT NOT NULL DEFAULT 'excellent',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battery_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_reports" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "vehicleId" TEXT,
    "chargingPortId" TEXT,
    "generatorId" TEXT,
    "reportedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT NOT NULL DEFAULT 'credit_card',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_predictions" (
    "id" TEXT NOT NULL,
    "chargingPortId" TEXT NOT NULL,
    "predictedDemandKw" DOUBLE PRECISION NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "peakDemandWindow" TEXT NOT NULL,
    "recommendedActivePorts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GeneratorToPort" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GeneratorToPort_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON "vehicles"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingReference_key" ON "bookings"("bookingReference");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_vehicles_vehicleId_key" ON "fleet_vehicles"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_vehicles_assignedDriverId_key" ON "fleet_vehicles"("assignedDriverId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "energy_transactions_transactionReference_key" ON "energy_transactions"("transactionReference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentReference_key" ON "payments"("paymentReference");

-- CreateIndex
CREATE INDEX "_GeneratorToPort_B_index" ON "_GeneratorToPort"("B");

-- AddForeignKey
ALTER TABLE "energy_generators" ADD CONSTRAINT "energy_generators_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_production_logs" ADD CONSTRAINT "energy_production_logs_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "energy_generators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_ports" ADD CONSTRAINT "charging_ports_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_queues" ADD CONSTRAINT "charging_queues_chargingPortId_fkey" FOREIGN KEY ("chargingPortId") REFERENCES "charging_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_queues" ADD CONSTRAINT "charging_queues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_queues" ADD CONSTRAINT "charging_queues_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_chargingPortId_fkey" FOREIGN KEY ("chargingPortId") REFERENCES "charging_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_vehicles" ADD CONSTRAINT "fleet_vehicles_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_vehicles" ADD CONSTRAINT "fleet_vehicles_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_vehicles" ADD CONSTRAINT "fleet_vehicles_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_chargingPortId_fkey" FOREIGN KEY ("chargingPortId") REFERENCES "charging_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_transactions" ADD CONSTRAINT "energy_transactions_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "energy_generators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_transactions" ADD CONSTRAINT "energy_transactions_chargingPortId_fkey" FOREIGN KEY ("chargingPortId") REFERENCES "charging_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battery_reports" ADD CONSTRAINT "battery_reports_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_chargingPortId_fkey" FOREIGN KEY ("chargingPortId") REFERENCES "charging_ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "energy_generators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneratorToPort" ADD CONSTRAINT "_GeneratorToPort_A_fkey" FOREIGN KEY ("A") REFERENCES "charging_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneratorToPort" ADD CONSTRAINT "_GeneratorToPort_B_fkey" FOREIGN KEY ("B") REFERENCES "energy_generators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
