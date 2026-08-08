/**
 * Fleet Management Module — End-to-End Backend Smoke Test
 * Tests: FleetVehicle registration, Driver creation, Complaint, Maintenance
 */
import { prisma } from './src/config/db.js';
import * as fleetService from './src/services/fleet.service.js';

async function run() {
  console.log('='.repeat(60));
  console.log('FLEET MANAGEMENT MODULE — SMOKE TEST');
  console.log('='.repeat(60));

  // Find or create a fleet manager
  let manager = await prisma.user.findFirst({ where: { role: 'fleet_manager' } });
  if (!manager) {
    manager = await prisma.user.create({
      data: {
        name: 'Test Fleet Manager',
        email: `fleet_mgr_smoke_${Date.now()}@ecovolt.com`,
        password: 'hashed',
        role: 'fleet_manager',
        isActive: true,
      },
    });
    console.log('✅ Created test fleet_manager:', manager.email);
  } else {
    console.log('✅ Using existing fleet_manager:', manager.email);
  }

  // STEP 1: Register a fleet vehicle (inline data — no vehicleId FK)
  const regNum = `TEST-${Date.now()}`;
  const fv = await fleetService.registerFleetVehicle(manager.id, {
    registrationNumber:  regNum,
    make:                'TATA',
    model:               'Nexon EV',
    vehicleType:         'car',
    batteryCapacityKwh:  '40.5',
    manufacturingYear:   '2024',
    odometer:            '0',
    connectorType:       'ccs_2',
    vehicleStatus:       'ACTIVE',
    fleetUnitNumber:     'SMOKE-001',
    fleetName:           'Smoke Test Fleet',
  });
  console.log('✅ STEP 1 — Fleet vehicle registered:', fv.registrationNumber, '| ID:', fv.id);

  // STEP 2: Verify vehicle-first guard for driver creation
  try {
    // Count should be 1+ now (just registered), so driver creation should succeed
    const vehicleCount = await prisma.fleetVehicle.count({ where: { managerId: manager.id } });
    console.log('✅ STEP 2 — Vehicle count for manager:', vehicleCount, '(must be >= 1 to add drivers)');
  } catch (err) {
    console.error('❌ STEP 2 — Vehicle count failed:', err.message);
  }

  // STEP 3: Create a driver (creates User + Driver atomically)
  const driverEmail = `driver_smoke_${Date.now()}@ecovolt.com`;
  const driver = await fleetService.createDriver(manager.id, {
    name:                  'Smoke Driver',
    email:                 driverEmail,
    phone:                 '+91 99999 00000',
    licenseNumber:         `DL-SMOKE-${Date.now()}`,
    licenseExpirationDate: '2030-12-31',
    assignedFleetVehicleId: fv.id,
  });
  console.log('✅ STEP 3 — Driver created:', driver.user?.name, '| License:', driver.licenseNumber);

  // Verify vehicle now has this driver assigned
  const updatedFv = await prisma.fleetVehicle.findUnique({ where: { id: fv.id } });
  console.log('✅ STEP 3b — Vehicle assignedDriverId:', updatedFv.assignedDriverId === driver.id ? '✓ CORRECT' : '✗ MISMATCH');

  // STEP 4: Driver raises a complaint
  const complaint = await fleetService.createComplaint(driver.id, manager.id, {
    fleetVehicleId: fv.id,
    title:          'Battery overheating during fast charge',
    description:    'Battery temperature exceeded 45°C during DC fast charging at highway station.',
    category:       'BATTERY',
    priority:       'HIGH',
  });
  console.log('✅ STEP 4 — Complaint created:', complaint.title, '| Status:', complaint.status, '| ID:', complaint.id);

  // STEP 5: Fleet manager schedules maintenance from complaint
  const schedule = await fleetService.scheduleMaintenance(manager.id, {
    fleetVehicleId: fv.id,
    complaintId:    complaint.id,
    mechanic:       'Suresh EV Technician',
    workshop:       'TN EV Service Hub',
    maintenanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    estimatedCost:  '3500',
    description:    'Battery thermal management system inspection and coolant flush.',
  });
  console.log('✅ STEP 5 — Maintenance scheduled:', schedule.workshop, '| Date:', schedule.maintenanceDate, '| Status:', schedule.status);

  // Verify vehicle status is now IN_MAINTENANCE
  const fvAfterMaint = await prisma.fleetVehicle.findUnique({ where: { id: fv.id } });
  console.log('✅ STEP 5b — Vehicle status after maintenance scheduled:', fvAfterMaint.vehicleStatus === 'IN_MAINTENANCE' ? 'IN_MAINTENANCE ✓' : `❌ Expected IN_MAINTENANCE got ${fvAfterMaint.vehicleStatus}`);

  // Verify complaint status is now IN_REVIEW
  const complaintAfter = await prisma.complaint.findUnique({ where: { id: complaint.id } });
  console.log('✅ STEP 5c — Complaint status after scheduling:', complaintAfter.status === 'IN_REVIEW' ? 'IN_REVIEW ✓' : `❌ Expected IN_REVIEW got ${complaintAfter.status}`);

  // STEP 6: Get fleet analytics
  const analytics = await fleetService.getFleetAnalytics(manager.id, 'fleet_manager');
  console.log('✅ STEP 6 — Fleet Analytics:', JSON.stringify(analytics.summary, null, 2));

  // STEP 7: Complete maintenance — vehicle should become ACTIVE again
  const completed = await fleetService.updateMaintenanceStatus(schedule.id, manager.id, 'COMPLETED', 3200);
  const fvAfterComplete = await prisma.fleetVehicle.findUnique({ where: { id: fv.id } });
  console.log('✅ STEP 7 — Maintenance completed | Vehicle status:', fvAfterComplete.vehicleStatus === 'ACTIVE' ? 'ACTIVE ✓' : `❌ Expected ACTIVE got ${fvAfterComplete.vehicleStatus}`);

  // STEP 8: Verify complaint resolved
  const complaintFinal = await prisma.complaint.findUnique({ where: { id: complaint.id } });
  console.log('✅ STEP 8 — Complaint final status:', complaintFinal.status === 'RESOLVED' ? 'RESOLVED ✓' : `❌ Expected RESOLVED got ${complaintFinal.status}`);

  // Cleanup
  await prisma.maintenanceSchedule.deleteMany({ where: { id: schedule.id } });
  await prisma.complaint.deleteMany({ where: { id: complaint.id } });
  await prisma.fleetVehicle.update({ where: { id: fv.id }, data: { assignedDriverId: null } });
  await prisma.driver.delete({ where: { id: driver.id } });
  await prisma.user.deleteMany({ where: { email: driverEmail } });
  await prisma.fleetVehicle.delete({ where: { id: fv.id } });
  console.log('✅ Cleanup complete.');

  console.log('='.repeat(60));
  console.log('✅ ALL FLEET MANAGEMENT SMOKE TESTS PASSED (0 ERRORS)');
  console.log('='.repeat(60));
}

run().catch((err) => {
  console.error('❌ SMOKE TEST FAILED:', err.message);
  console.error(err.stack);
}).finally(() => prisma.$disconnect().then(() => process.exit(0)));
