import { Test, TestingModule } from '@nestjs/testing';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import {
  ProficiencyLevel,
  Discipline,
  ProfileType,
  SeniorityLevel,
} from '@prisma/client';
import { CurrentUserType } from '../auth/decorators/current-user.decorator';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;
  let profileService: ProfileService;

  const mockProfileService = {
    getProfile: jest.fn(),
  };

  const mockCurrentUser: CurrentUserType = {
    id: 'user-123',
    email: 'user@example.com',
    type: ProfileType.EMPLOYEE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
    profileService = module.get<ProfileService>(ProfileService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getProfile', () => {
    it('should call profileService.getProfile with correct parameters', async () => {
      const profileId = 'profile-123';
      const mockProfile = {
        id: profileId,
        name: 'John Doe',
        email: 'john@example.com',
        currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        avatarUrl: 'https://example.com/avatar.png',
        skills: {
          coreStack: [],
          validatedInventory: [],
          pending: [],
        },
        seniorityHistory: [],
        currentAssignments: [],
      };

      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const result = await resolver.getProfile(mockCurrentUser, profileId);

      expect(profileService.getProfile).toHaveBeenCalledWith(
        mockCurrentUser.id,
        mockCurrentUser.type,
        profileId,
      );
      expect(result).toEqual(mockProfile);
    });

    it('should return complete profile response with all nested structures', async () => {
      const profileId = 'profile-123';
      const mockProfile = {
        id: profileId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
        avatarUrl: undefined,
        skills: {
          coreStack: [
            {
              skillName: 'TypeScript',
              discipline: Discipline.LANGUAGES,
              proficiencyLevel: ProficiencyLevel.EXPERT,
              validatedAt: new Date('2024-01-01'),
              validator: {
                id: 'validator-1',
                name: 'Validator One',
              },
            },
          ],
          validatedInventory: [
            {
              skillName: 'Python',
              discipline: Discipline.BACKEND,
              proficiencyLevel: ProficiencyLevel.ADVANCED,
              validatedAt: new Date('2024-01-02'),
              validator: {
                id: 'validator-2',
                name: 'Validator Two',
              },
            },
          ],
          pending: [
            {
              skillName: 'Go',
              discipline: Discipline.BACKEND,
              suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
              createdAt: new Date('2024-02-01'),
            },
          ],
        },
        seniorityHistory: [
          {
            seniorityLevel: SeniorityLevel.STAFF_ENGINEER,
            start_date: new Date('2024-01-01'),
            end_date: undefined,
            createdBy: {
              id: 'admin-1',
              name: 'Admin User',
            },
          },
        ],
        currentAssignments: [
          {
            projectName: 'Project Alpha',
            role: 'Full Stack Developer',
            tags: ['TypeScript', 'React', 'Node.js'],
            techLead: {
              id: 'lead-1',
              name: 'Tech Lead',
              email: 'lead@example.com',
            },
          },
        ],
      };

      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const result = await resolver.getProfile(mockCurrentUser, profileId);

      expect(result).toEqual(mockProfile);
      expect(result.skills.coreStack).toHaveLength(1);
      expect(result.skills.validatedInventory).toHaveLength(1);
      expect(result.skills.pending).toHaveLength(1);
      expect(result.seniorityHistory).toHaveLength(1);
      expect(result.currentAssignments).toHaveLength(1);
    });

    it('should propagate ForbiddenException from service', async () => {
      const profileId = 'other-profile';

      mockProfileService.getProfile.mockRejectedValue(
        new ForbiddenException({
          message: 'You do not have permission to view this profile',
          extensions: {
            code: 'FORBIDDEN',
          },
        }),
      );

      await expect(
        resolver.getProfile(mockCurrentUser, profileId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate NotFoundException from service', async () => {
      const profileId = 'non-existent';

      mockProfileService.getProfile.mockRejectedValue(
        new NotFoundException({
          message: 'Profile not found',
          extensions: {
            code: 'NOT_FOUND',
          },
        }),
      );

      await expect(
        resolver.getProfile(mockCurrentUser, profileId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should extract user info from CurrentUser decorator correctly', async () => {
      const techLeadUser: CurrentUserType = {
        id: 'lead-123',
        email: 'lead@example.com',
        type: ProfileType.TECH_LEAD,
      };

      const profileId = 'team-member-123';
      const mockProfile = {
        id: profileId,
        name: 'Team Member',
        email: 'member@example.com',
        currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        skills: {
          coreStack: [],
          validatedInventory: [],
          pending: [],
        },
        seniorityHistory: [],
        currentAssignments: [],
      };

      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      await resolver.getProfile(techLeadUser, profileId);

      expect(profileService.getProfile).toHaveBeenCalledWith(
        techLeadUser.id,
        techLeadUser.type,
        profileId,
      );
    });
  });
});
