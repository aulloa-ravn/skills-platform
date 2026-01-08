import { Test, TestingModule } from '@nestjs/testing';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { ForbiddenException } from '@nestjs/common';
import { ProfileType, SeniorityLevel } from '@prisma/client';
import { GetAllProfilesForAdminInput } from './dto/get-all-profiles-for-admin.input';
import { PaginatedProfilesResponse } from './dto/get-all-profiles-for-admin.response';

describe('ProfileResolver - getAllProfilesForAdmin', () => {
  let resolver: ProfileResolver;
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        {
          provide: ProfileService,
          useValue: {
            getAllProfilesForAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should successfully call service for ADMIN user', async () => {
    const input: GetAllProfilesForAdminInput = { page: 1, pageSize: 25 };
    const currentUser = {
      id: 'admin-123',
      email: 'admin@example.com',
      type: ProfileType.ADMIN,
    };

    const mockResponse: PaginatedProfilesResponse = {
      profiles: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 25,
      totalPages: 0,
    };

    jest
      .spyOn(service, 'getAllProfilesForAdmin')
      .mockResolvedValue(mockResponse);

    const result = await resolver.getAllProfilesForAdmin(currentUser, input);

    expect(result).toEqual(mockResponse);
    expect(service.getAllProfilesForAdmin).toHaveBeenCalledWith(
      input,
      currentUser.id,
    );
  });

  it('should throw ForbiddenException when service throws it', async () => {
    const input: GetAllProfilesForAdminInput = { page: 1, pageSize: 25 };
    const currentUser = {
      id: 'employee-123',
      email: 'employee@example.com',
      type: ProfileType.EMPLOYEE,
    };

    jest
      .spyOn(service, 'getAllProfilesForAdmin')
      .mockRejectedValue(
        new ForbiddenException('Only administrators can access this resource'),
      );

    await expect(
      resolver.getAllProfilesForAdmin(currentUser, input),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should pass input parameters to service correctly', async () => {
    const input: GetAllProfilesForAdminInput = {
      page: 2,
      pageSize: 50,
      searchTerm: 'john',
      seniorityLevels: [SeniorityLevel.SENIOR_ENGINEER],
    };
    const currentUser = {
      id: 'admin-123',
      email: 'admin@example.com',
      type: ProfileType.ADMIN,
    };

    const mockResponse: PaginatedProfilesResponse = {
      profiles: [],
      totalCount: 0,
      currentPage: 2,
      pageSize: 50,
      totalPages: 0,
    };

    jest
      .spyOn(service, 'getAllProfilesForAdmin')
      .mockResolvedValue(mockResponse);

    await resolver.getAllProfilesForAdmin(currentUser, input);

    expect(service.getAllProfilesForAdmin).toHaveBeenCalledWith(
      input,
      currentUser.id,
    );
  });

  it('should return profiles response with correct structure', async () => {
    const input: GetAllProfilesForAdminInput = { page: 1, pageSize: 25 };
    const currentUser = {
      id: 'admin-123',
      email: 'admin@example.com',
      type: ProfileType.ADMIN,
    };

    const mockResponse: PaginatedProfilesResponse = {
      profiles: [
        {
          id: 'profile-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: undefined,
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          joinDate: new Date('2020-01-15'),
          currentAssignmentsCount: 2,
          coreStackSkills: ['React', 'TypeScript', 'Node.js'],
          remainingSkillsCount: 5,
        },
      ],
      totalCount: 1,
      currentPage: 1,
      pageSize: 25,
      totalPages: 1,
    };

    jest
      .spyOn(service, 'getAllProfilesForAdmin')
      .mockResolvedValue(mockResponse);

    const result = await resolver.getAllProfilesForAdmin(currentUser, input);

    expect(result).toEqual(mockResponse);
    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0].name).toBe('John Doe');
    expect(result.totalCount).toBe(1);
  });
});
