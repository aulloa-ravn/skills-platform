import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileType, SeniorityLevel } from '@prisma/client';
import {
  GetAllProfilesForAdminInput,
  ProfileSortField,
  SortDirection,
  YearsInCompanyRange,
} from '../dto/get-all-profiles-for-admin.input';

describe('Admin Profiles List - Integration Tests', () => {
  let service: ProfileService;
  let prisma: PrismaService;

  const mockAdminProfile = {
    id: 'admin-123',
    type: ProfileType.ADMIN,
    name: 'Admin User',
    email: 'admin@example.com',
    missionBoardId: 'mb-admin',
    currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
    avatarUrl: null,
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            seniorityHistory: {
              findFirst: jest.fn(),
            },
            assignment: {
              findMany: jest.fn(),
            },
            employeeSkill: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockAdminProfile);
  });

  it('should handle skills AND operation filtering (employee must have ALL selected skills)', async () => {
    const input: GetAllProfilesForAdminInput = {
      skillIds: ['1', '2', '3'], // Use string IDs that can be converted to ints
      page: 1,
      pageSize: 25,
    };

    // Mock groupBy to return profile counts
    jest.spyOn(prisma.employeeSkill, 'groupBy').mockResolvedValue([
      { profileId: 'profile-1', _count: { profileId: 3 } },
    ] as any);
    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, 'admin-123');

    // Verify that groupBy was called with the skill IDs
    expect(prisma.employeeSkill.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['profileId'],
        where: expect.objectContaining({
          skillId: { in: [1, 2, 3] }, // Converted to ints
        }),
      }),
    );
  });

  it('should apply combined filters: search + seniority', async () => {
    const input: GetAllProfilesForAdminInput = {
      searchTerm: 'john',
      seniorityLevels: [SeniorityLevel.SENIOR_ENGINEER],
      page: 1,
      pageSize: 25,
    };

    const findManySpy = jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, 'admin-123');

    // Verify all filters are combined correctly
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'john' }) }),
            expect.objectContaining({ email: expect.objectContaining({ contains: 'john' }) }),
          ]),
          currentSeniorityLevel: expect.objectContaining({
            in: [SeniorityLevel.SENIOR_ENGINEER],
          }),
        }),
      }),
    );
  });

  it('should handle sorting by different fields and directions', async () => {
    const inputs: GetAllProfilesForAdminInput[] = [
      { sortBy: ProfileSortField.EMAIL, sortDirection: SortDirection.DESC, page: 1, pageSize: 25 },
      { sortBy: ProfileSortField.SENIORITY, sortDirection: SortDirection.ASC, page: 1, pageSize: 25 },
    ];

    for (const input of inputs) {
      const findManySpy = jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

      await service.getAllProfilesForAdmin(input, 'admin-123');

      if (input.sortBy === ProfileSortField.EMAIL) {
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { email: 'desc' },
          }),
        );
      } else if (input.sortBy === ProfileSortField.SENIORITY) {
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { currentSeniorityLevel: 'asc' },
          }),
        );
      }
    }
  });

  it('should return empty state when no employees match filters', async () => {
    const input: GetAllProfilesForAdminInput = {
      searchTerm: 'nonexistent',
      page: 1,
      pageSize: 25,
    };

    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    const result = await service.getAllProfilesForAdmin(input, 'admin-123');

    expect(result.profiles).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.currentPage).toBe(1);
  });

  it('should exclude ADMIN users from results', async () => {
    const input: GetAllProfilesForAdminInput = {
      page: 1,
      pageSize: 25,
    };

    const findManySpy = jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, 'admin-123');

    // Verify ADMIN users are excluded
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: { not: ProfileType.ADMIN },
        }),
      }),
    );
  });

  it('should handle pagination state changes correctly', async () => {
    const scenarios = [
      { page: 1, pageSize: 25, expectedSkip: 0 },
      { page: 2, pageSize: 25, expectedSkip: 25 },
      { page: 1, pageSize: 50, expectedSkip: 0 },
      { page: 3, pageSize: 100, expectedSkip: 200 },
    ];

    for (const scenario of scenarios) {
      const findManySpy = jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

      await service.getAllProfilesForAdmin(
        { page: scenario.page, pageSize: scenario.pageSize },
        'admin-123',
      );

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: scenario.expectedSkip,
          take: scenario.pageSize,
        }),
      );
    }
  });

  it('should verify ADMIN authorization check is enforced', async () => {
    const nonAdminProfile = {
      ...mockAdminProfile,
      id: 'employee-123',
      type: ProfileType.EMPLOYEE,
    };

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(nonAdminProfile);

    await expect(
      service.getAllProfilesForAdmin({ page: 1, pageSize: 25 }, 'employee-123'),
    ).rejects.toThrow();
  });

  it('should handle clear all filters by resetting to default state', async () => {
    // First call with filters
    const inputWithFilters: GetAllProfilesForAdminInput = {
      searchTerm: 'john',
      seniorityLevels: [SeniorityLevel.SENIOR_ENGINEER],
      page: 2,
      pageSize: 50,
    };

    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(inputWithFilters, 'admin-123');

    // Second call with cleared filters (defaults)
    const inputCleared: GetAllProfilesForAdminInput = {
      page: 1,
      pageSize: 25,
    };

    const findManySpy = jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(inputCleared, 'admin-123');

    // Verify cleared state has no filters
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: { not: ProfileType.ADMIN },
        }),
        skip: 0,
        take: 25,
      }),
    );
  });

  it('should support URL param persistence for shareable links', async () => {
    // This test verifies that pagination params can be provided via input
    const input: GetAllProfilesForAdminInput = {
      page: 3,
      pageSize: 100,
    };

    const findManySpy = jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    const result = await service.getAllProfilesForAdmin(input, 'admin-123');

    expect(result.currentPage).toBe(3);
    expect(result.pageSize).toBe(100);
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 200, // (3-1) * 100
        take: 100,
      }),
    );
  });
});
