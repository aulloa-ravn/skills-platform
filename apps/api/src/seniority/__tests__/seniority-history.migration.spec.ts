import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { SeniorityLevel } from '@prisma/client';

describe('SeniorityHistory Migration - updatedAt Field', () => {
  let prisma: PrismaService;
  let testProfileId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);

    // Create a test profile for testing
    const testProfile = await prisma.profile.create({
      data: {
        missionBoardId: `test-migration-${Date.now()}`,
        email: `test-migration-${Date.now()}@example.com`,
        name: 'Test User for Migration',
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

  it('should set updatedAt automatically on record creation', async () => {
    const beforeCreate = new Date();

    const seniorityRecord = await prisma.seniorityHistory.create({
      data: {
        profileId: testProfileId,
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
    });

    const afterCreate = new Date();

    expect(seniorityRecord.updatedAt).toBeDefined();
    expect(seniorityRecord.updatedAt).toBeInstanceOf(Date);
    expect(seniorityRecord.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeCreate.getTime(),
    );
    expect(seniorityRecord.updatedAt.getTime()).toBeLessThanOrEqual(
      afterCreate.getTime(),
    );
  });

  it('should update updatedAt automatically when record is modified', async () => {
    // Create initial record
    const initialRecord = await prisma.seniorityHistory.create({
      data: {
        profileId: testProfileId,
        seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      },
    });

    const initialUpdatedAt = initialRecord.updatedAt;

    // Wait a moment to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update the record
    const beforeUpdate = new Date();
    const updatedRecord = await prisma.seniorityHistory.update({
      where: { id: initialRecord.id },
      data: {
        seniorityLevel: SeniorityLevel.MID_ENGINEER,
      },
    });
    const afterUpdate = new Date();

    expect(updatedRecord.updatedAt).toBeDefined();
    expect(updatedRecord.updatedAt.getTime()).toBeGreaterThan(
      initialUpdatedAt.getTime(),
    );
    expect(updatedRecord.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    );
    expect(updatedRecord.updatedAt.getTime()).toBeLessThanOrEqual(
      afterUpdate.getTime(),
    );
  });

  it('should default updatedAt to now() for new records', async () => {
    const record = await prisma.seniorityHistory.create({
      data: {
        profileId: testProfileId,
        seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        startDate: new Date('2025-01-01'),
        endDate: null,
      },
    });

    // updatedAt should be approximately equal to createdAt for new records
    const timeDiff = Math.abs(
      record.updatedAt.getTime() - record.createdAt.getTime(),
    );

    expect(record.updatedAt).toBeDefined();
    expect(record.createdAt).toBeDefined();
    // Allow up to 1 second difference due to database timing
    expect(timeDiff).toBeLessThan(1000);
  });
});
