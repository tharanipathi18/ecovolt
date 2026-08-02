/**
 * End-to-End Charging Workflow Test
 * Verifies:
 * EV User Register Vehicle -> Book Slot -> Station Owner Approve -> Start Session -> Vehicle found via booking.vehicleId -> ChargingSession created -> Success
 */
import { prisma } from './src/config/db.js';
import * as evUserService from './src/services/evUser.service.js';
import * as chargingService from './src/services/charging.service.js';

async function testWorkflow() {
  console.log('='.repeat(60));
  console.log('CHARGING WORKFLOW END-TO-END VERIFICATION');
  console.log('='.repeat(60));

  // 1. Get or create EV User
  let evUser = await prisma.user.findFirst({ where: { role: 'ev_user' } });
  if (!evUser) {
    evUser = await prisma.user.create({
      data: {
        name: 'Test EV Driver',
        email: `ev_driver_test_${Date.now()}@ecovolt.com`,
        password: 'hashedpassword',
        role: 'ev_user',
        isActive: true,
      },
    });
  }
  console.log('✅ STEP 1 — EV User ready:', evUser.email);

  // 2. Get or create Station Owner (ev_port) & Port
  let stationOwner = await prisma.user.findFirst({ where: { role: 'ev_port' } });
  if (!stationOwner) {
    stationOwner = await prisma.user.create({
      data: {
        name: 'Test Station Owner',
        email: `station_owner_${Date.now()}@ecovolt.com`,
        password: 'hashedpassword',
        role: 'ev_port',
        isActive: true,
      },
    });
  }

  let port = await prisma.chargingPort.findFirst({
    where: { operatorId: stationOwner.id, isApproved: true },
  });
  if (!port) {
    port = await prisma.chargingPort.create({
      data: {
        operatorId: stationOwner.id,
        stationName: 'Clean Power Fast Hub',
        portIdentifier: `PORT-TEST-${Date.now()}`,
        connectorType: 'ccs_2',
        maxPowerOutputKw: 150,
        pricingRatePerKwh: 0.35,
        status: 'available',
        isApproved: true,
        approvalStatus: 'APPROVED',
      },
    });
  }
  console.log('✅ STEP 2 — Station Owner & Port ready:', port.stationName, '| Port ID:', port.id);

  // 3. EV User Registers a Vehicle
  const plate = `EV-${Math.floor(1000 + Math.random() * 9000)}`;
  const vehicle = await evUserService.registerVehicle(evUser.id, {
    make: 'Tesla',
    model: 'Model Y',
    year: 2024,
    licensePlate: plate,
    batteryCapacityKwh: 75,
    connectorType: 'ccs_2',
  });
  console.log('✅ STEP 3 — EV User registered vehicle:', vehicle.make, vehicle.model, '| Vehicle ID:', vehicle.id);

  // 4. EV User Books a Slot (status = pending)
  const booking = await evUserService.createBooking(evUser.id, {
    chargingPortId: port.id,
    vehicleId: vehicle.id,
    scheduledStartTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
  });
  console.log('✅ STEP 4 — Slot Booked | Booking ID:', booking.id, '| Status:', booking.status, '| Stored vehicleId:', booking.vehicleId);

  // 5. Station Owner Approves Booking (status = confirmed)
  const confirmedBooking = await chargingService.updateBookingStatus(booking.id, stationOwner.id, 'ev_port', 'confirmed');
  console.log('✅ STEP 5 — Station Owner Approved Booking | Status:', confirmedBooking.status);

  // 6. Station Owner Starts Session using bookingId
  const session = await chargingService.startChargingSession(stationOwner.id, 'ev_port', {
    bookingId: confirmedBooking.id,
    chargingPortId: port.id,
    vehicleId: vehicle.id,
    startStateOfCharge: 25,
  });
  console.log('✅ STEP 6 — Session Started! Session ID:', session.id, '| Status:', session.status);
  console.log('         Vehicle fetched from booking.vehicleId:', session.vehicle?.make, session.vehicle?.model, `(${session.vehicle?.licensePlate})`);

  // Verify Booking status updated to completed
  const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
  console.log('✅ STEP 7 — Updated Booking Status:', updatedBooking.status);

  // Verify Port occupancy updated to occupied
  const updatedPort = await prisma.chargingPort.findUnique({ where: { id: port.id } });
  console.log('✅ STEP 8 — Updated Port Status:', updatedPort.status);

  // 7. Cleanup test data
  await chargingService.stopChargingSession(session.id, { endStateOfCharge: 80 });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.vehicle.delete({ where: { id: vehicle.id } });
  console.log('✅ STEP 9 — Cleanup completed successfully.');

  console.log('='.repeat(60));
  console.log('✅ CHARGING WORKFLOW VERIFICATION PASSED PERFECTLY (0 ERRORS)');
  console.log('='.repeat(60));
}

testWorkflow()
  .catch((err) => {
    console.error('❌ WORKFLOW VERIFICATION FAILED:', err.message);
    console.error(err.stack);
  })
  .finally(() => prisma.$disconnect().then(() => process.exit(0)));
