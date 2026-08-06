/**
 * Energy Generator Approval Workflow Verification Script
 */
import { prisma } from './src/config/db.js';
import * as energyService from './src/services/energy.service.js';
import * as adminService from './src/services/admin.service.js';

async function testGeneratorWorkflow() {
  console.log('='.repeat(60));
  console.log('STARTING ENERGY GENERATOR WORKFLOW VERIFICATION');
  console.log('='.repeat(60));

  // 1. Setup a test operator
  const email = `operator_test_${Date.now()}@ecovolt.com`;
  const operator = await prisma.user.create({
    data: {
      name: 'Test Generator Operator',
      email: email,
      password: 'hashedpassword',
      role: 'generator',
      isActive: true,
    },
  });
  console.log('✅ Created test generator operator:', operator.email);

  // 2. Register a new generator (should start as PENDING)
  const generator1Name = `Solar Array Alpha ${Date.now()}`;
  const generator1 = await energyService.createGenerator(operator.id, {
    name: generator1Name,
    type: 'solar',
    capacityKw: 250.0,
    tariffRatePerKwh: 0.12,
    gridConnection: 'microgrid',
  });
  console.log('✅ Registered generator 1:', generator1.name);
  console.log('   Initial Status:', generator1.status);
  if (generator1.status !== 'PENDING') {
    throw new Error(`Expected initial status to be PENDING, got ${generator1.status}`);
  }

  // 3. Verify it is returned in the pending list
  const pendingGenerators = await adminService.getPendingGenerators();
  const foundPending = pendingGenerators.find(g => g.id === generator1.id);
  if (!foundPending) {
    throw new Error('Created generator not found in pending applications list!');
  }
  console.log('✅ Generator found in pending list. Operator details verified:', foundPending.operator?.email);

  // 4. Try uploading production log to PENDING generator (should fail)
  try {
    await energyService.logProduction(generator1.id, operator.id, {
      energyProducedKwh: 50.0,
      peakOutputKw: 10.0,
    });
    throw new Error('Expected logProduction to fail for PENDING generator, but it succeeded.');
  } catch (err) {
    if (err.message === 'Generator is waiting for admin approval.') {
      console.log('✅ Rejected production log for PENDING generator with correct message:', err.message);
    } else {
      throw new Error(`Expected "Generator is waiting for admin approval." but got "${err.message}"`);
    }
  }

  // 5. Admin Approves Generator 1
  const approvedGen = await adminService.reviewGeneratorApplication(generator1.id, 'APPROVE');
  console.log('✅ Approved generator. Current status in DB:', approvedGen.status);
  if (approvedGen.status !== 'APPROVED') {
    throw new Error(`Expected APPROVED status, got ${approvedGen.status}`);
  }

  // Verify notification was sent
  const notifications = await prisma.notification.findMany({
    where: { userId: operator.id },
  });
  const approvalNotification = notifications.find(n => n.title.includes('APPROVED'));
  if (!approvalNotification) {
    throw new Error('Approval notification not found for operator!');
  }
  console.log('✅ Approval notification verified:', approvalNotification.title);

  // 6. Try uploading production log to APPROVED generator (should succeed)
  const productionResult = await energyService.logProduction(generator1.id, operator.id, {
    energyProducedKwh: 120.0,
    peakOutputKw: 25.0,
  });
  console.log('✅ Uploaded production log successfully. Log ID:', productionResult.log.id);
  console.log('   New generator revenue:', productionResult.generator.totalRevenue);

  // 7. Register a second generator to test REJECTION
  const generator2Name = `Wind Array Beta ${Date.now()}`;
  const generator2 = await energyService.createGenerator(operator.id, {
    name: generator2Name,
    type: 'wind',
    capacityKw: 500.0,
    tariffRatePerKwh: 0.15,
    gridConnection: 'grid',
  });
  console.log('✅ Registered generator 2:', generator2.name);

  // 8. Admin Rejects Generator 2
  const rejectedGen = await adminService.reviewGeneratorApplication(generator2.id, 'REJECT');
  console.log('✅ Rejected generator. Current status in DB:', rejectedGen.status);
  if (rejectedGen.status !== 'REJECTED') {
    throw new Error(`Expected REJECTED status, got ${rejectedGen.status}`);
  }

  // Verify rejection notification was sent
  const operatorNotifications = await prisma.notification.findMany({
    where: { userId: operator.id },
  });
  const rejectionNotification = operatorNotifications.find(n => n.title.includes('Rejected'));
  if (!rejectionNotification) {
    throw new Error('Rejection notification not found for operator!');
  }
  console.log('✅ Rejection notification verified:', rejectionNotification.title);

  // 9. Try uploading production log to REJECTED generator (should fail)
  try {
    await energyService.logProduction(generator2.id, operator.id, {
      energyProducedKwh: 80.0,
      peakOutputKw: 15.0,
    });
    throw new Error('Expected logProduction to fail for REJECTED generator, but it succeeded.');
  } catch (err) {
    if (err.message === 'Generator has been rejected.') {
      console.log('✅ Rejected production log for REJECTED generator with correct message:', err.message);
    } else {
      throw new Error(`Expected "Generator has been rejected." but got "${err.message}"`);
    }
  }

  // 10. Clean up test data
  console.log('🧹 Cleaning up test database entries...');
  await prisma.energyProductionLog.deleteMany({
    where: { generatorId: { in: [generator1.id, generator2.id] } },
  });
  await prisma.energyGenerator.deleteMany({
    where: { id: { in: [generator1.id, generator2.id] } },
  });
  await prisma.notification.deleteMany({
    where: { userId: operator.id },
  });
  await prisma.user.delete({
    where: { id: operator.id },
  });
  console.log('✅ Cleanup completed.');

  console.log('='.repeat(60));
  console.log('🎉 ALL ENERGY GENERATOR WORKFLOW CHECKS PASSED SUCCESSFULLY!');
  console.log('='.repeat(60));
}

testGeneratorWorkflow()
  .catch((err) => {
    console.error('❌ VERIFICATION FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
