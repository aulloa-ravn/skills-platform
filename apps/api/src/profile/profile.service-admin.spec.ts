import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { ProfileType, SeniorityLevel } from '@prisma/client';
import {
  GetAllProfilesForAdminInput,
  ProfileSortField,
  SortDirection,
  YearsInCompanyRange,
} from './dto/get-all-profiles-for-admin.input';

describe('ProfileService - getAllProfilesForAdmin', () => {
  let service: ProfileService;
  let prisma: PrismaService;

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
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const input: GetAllProfilesForAdminInput = {};
    const nonAdminUserId = 'user-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: nonAdminUserId,
      type: ProfileType.EMPLOYEE,
      name: 'Test User',
      email: 'test@example.com',
      missionBoardId: 'mb-123',
      currentSeniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.getAllProfilesForAdmin(input, nonAdminUserId),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow ADMIN users to access the method', async () => {
    const input: GetAllProfilesForAdminInput = { page: 1, pageSize: 25 };
    const adminUserId = 'admin-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: adminUserId,
      type: ProfileType.ADMIN,
      name: 'Admin User',
      email: 'admin@example.com',
      missionBoardId: 'mb-admin',
      currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    const result = await service.getAllProfilesForAdmin(input, adminUserId);

    expect(result).toBeDefined();
    expect(result.profiles).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('should apply search filter on name and email (case-insensitive)', async () => {
    const input: GetAllProfilesForAdminInput = {
      searchTerm: 'john',
      page: 1,
      pageSize: 25,
    };
    const adminUserId = 'admin-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: adminUserId,
      type: ProfileType.ADMIN,
      name: 'Admin',
      email: 'admin@example.com',
      missionBoardId: 'mb-admin',
      currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const findManySpy = jest
      .spyOn(prisma.profile, 'findMany')
      .mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, adminUserId);

    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('should apply seniority level filter (OR operation)', async () => {
    const input: GetAllProfilesForAdminInput = {
      seniorityLevels: [
        SeniorityLevel.JUNIOR_ENGINEER,
        SeniorityLevel.SENIOR_ENGINEER,
      ],
      page: 1,
      pageSize: 25,
    };
    const adminUserId = 'admin-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: adminUserId,
      type: ProfileType.ADMIN,
      name: 'Admin',
      email: 'admin@example.com',
      missionBoardId: 'mb-admin',
      currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const findManySpy = jest
      .spyOn(prisma.profile, 'findMany')
      .mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, adminUserId);

    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          currentSeniorityLevel: {
            in: [
              SeniorityLevel.JUNIOR_ENGINEER,
              SeniorityLevel.SENIOR_ENGINEER,
            ],
          },
        }),
      }),
    );
  });

  it('should apply pagination correctly', async () => {
    const input: GetAllProfilesForAdminInput = { page: 2, pageSize: 50 };
    const adminUserId = 'admin-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: adminUserId,
      type: ProfileType.ADMIN,
      name: 'Admin',
      email: 'admin@example.com',
      missionBoardId: 'mb-admin',
      currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const findManySpy = jest
      .spyOn(prisma.profile, 'findMany')
      .mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, adminUserId);

    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 50, // (page 2 - 1) * pageSize 50
        take: 50,
      }),
    );
  });

  it('should apply sorting by NAME ascending by default', async () => {
    const input: GetAllProfilesForAdminInput = { page: 1, pageSize: 25 };
    const adminUserId = 'admin-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: adminUserId,
      type: ProfileType.ADMIN,
      name: 'Admin',
      email: 'admin@example.com',
      missionBoardId: 'mb-admin',
      currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const findManySpy = jest
      .spyOn(prisma.profile, 'findMany')
      .mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(0);

    await service.getAllProfilesForAdmin(input, adminUserId);

    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
      }),
    );
  });

  it('should calculate totalPages correctly', async () => {
    const input: GetAllProfilesForAdminInput = { page: 1, pageSize: 25 };
    const adminUserId = 'admin-123';

    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      id: adminUserId,
      type: ProfileType.ADMIN,
      name: 'Admin',
      email: 'admin@example.com',
      missionBoardId: 'mb-admin',
      currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
      avatarUrl: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.profile, 'count').mockResolvedValue(63); // 63 profiles

    const result = await service.getAllProfilesForAdmin(input, adminUserId);

    expect(result.totalPages).toBe(3); // Math.ceil(63 / 25) = 3
    expect(result.totalCount).toBe(63);
    expect(result.pageSize).toBe(25);
    expect(result.currentPage).toBe(1);
  });
});
