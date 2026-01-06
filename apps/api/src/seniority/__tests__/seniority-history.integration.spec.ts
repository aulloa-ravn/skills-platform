import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { SeniorityHistoryService } from '../seniority-history.service';
import { SeniorityLevel } from '@prisma/client';

describe('SeniorityHistory Integration - Profile Sync', () => {
  let service: SeniorityHistoryService;
  let prisma: PrismaService;
  let testProfileId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeniorityHistoryService, PrismaService],
    }).compile();

    service = module.get<SeniorityHistoryService>(SeniorityHistoryService);
    prisma = module.get<PrismaService>(PrismaService);

    // Create a test profile for integration testing
    const testProfile = await prisma.profile.create({
      data: {
        missionBoardId: `test-integration-${Date.now()}`,
        email: `test-integration-${Date.now()}@example.com`,
        name: 'Test User for Integration',
        currentSeniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
      },
    });
    testProfileId = testProfile.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.seniorityHistory.deleteMany({
      where: { profileId: testProfileId },
    });
    await prisma.profile.delete({
      where: { id: testProfileId },
    });
    await prisma.$disconnect();
  });

  it('should sync Profile.currentSeniorityLevel when creating current record (endDate = null)', async () => {
    // Create a current seniority record
    const record = await service.createSeniorityHistory({
      profileId: testProfileId,
      seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
      startDate: new Date('2025-01-01'),
      endDate: null,
    });

    // Verify the profile was synced
    const profile = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });

    expect(record.seniorityLevel).toBe(SeniorityLevel.SENIOR_ENGINEER);
    expect(record.endDate).toBeNull();
    expect(profile?.currentSeniorityLevel).toBe(SeniorityLevel.SENIOR_ENGINEER);
  });

  it('should NOT sync Profile.currentSeniorityLevel when creating historical record (endDate provided)', async () => {
    // Get current profile state
    const profileBefore = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });

    // Create a historical record with an end date
    const record = await service.createSeniorityHistory({
      profileId: testProfileId,
      seniorityLevel: SeniorityLevel.MID_ENGINEER,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    });

    // Verify the profile was NOT changed
    const profileAfter = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });

    expect(record.endDate).not.toBeNull();
    expect(profileAfter?.currentSeniorityLevel).toBe(
      profileBefore?.currentSeniorityLevel,
    );
  });

  it('should sync Profile.currentSeniorityLevel when updating to current record', async () => {
    // Create a historical record first
    const historicalRecord = await service.createSeniorityHistory({
      profileId: testProfileId,
      seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
    });

    // Update it to be the current record (remove endDate)
    const updatedRecord = await service.updateSeniorityHistory({
      id: historicalRecord.id,
      seniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      startDate: new Date('2023-01-01'),
      endDate: null,
    });

    // Verify the profile was synced
    const profile = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });

    expect(updatedRecord.endDate).toBeNull();
    expect(profile?.currentSeniorityLevel).toBe(SeniorityLevel.STAFF_ENGINEER);
  });

  it('should complete full workflow: create -> update -> verify sync', async () => {
    // Step 1: Create initial current record
    const created = await service.createSeniorityHistory({
      profileId: testProfileId,
      seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
      startDate: new Date('2020-01-01'),
      endDate: null,
    });

    let profile = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });
    expect(profile?.currentSeniorityLevel).toBe(SeniorityLevel.JUNIOR_ENGINEER);

    // Step 2: Update to a different seniority level
    const updated = await service.updateSeniorityHistory({
      id: created.id,
      seniorityLevel: SeniorityLevel.MID_ENGINEER,
      startDate: created.startDate,
      endDate: null,
    });

    profile = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });
    expect(profile?.currentSeniorityLevel).toBe(SeniorityLevel.MID_ENGINEER);

    // Step 3: Update to make it historical (add end date)
    await service.updateSeniorityHistory({
      id: updated.id,
      seniorityLevel: SeniorityLevel.MID_ENGINEER,
      startDate: updated.startDate,
      endDate: new Date('2024-12-31'),
    });

    // Profile should remain at MID_ENGINEER since we just added an end date
    profile = await prisma.profile.findUnique({
      where: { id: testProfileId },
    });
    expect(profile?.currentSeniorityLevel).toBe(SeniorityLevel.MID_ENGINEER);

    // Step 4: Fetch all history and verify order
    const history = await service.getSeniorityHistory(testProfileId);
    expect(history.length).toBeGreaterThan(0);
    // Verify descending order by startDate
    for (let i = 0; i < history.length - 1; i++) {
      expect(new Date(history[i].startDate).getTime()).toBeGreaterThanOrEqual(
        new Date(history[i + 1].startDate).getTime(),
      );
    }
  });
});
