import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ProficiencyLevel, Discipline } from '@prisma/client';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
    },
    assignment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    employeeSkill: {
      findMany: jest.fn(),
    },
    suggestion: {
      findMany: jest.fn(),
    },
    seniorityHistory: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Authorization - EMPLOYEE Role', () => {
    it('should allow employee to access their own profile', async () => {
      const userId = 'user-123';
      const profileId = 'user-123';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: profileId,
        name: 'John Doe',
        email: 'john@example.com',
        currentSeniorityLevel: 'Senior Developer',
        avatarUrl: null,
      });

      // Mock for both getSkillsTiers and getCurrentAssignments
      mockPrismaService.assignment.findMany.mockResolvedValue([]);
      mockPrismaService.employeeSkill.findMany.mockResolvedValue([]);
      mockPrismaService.suggestion.findMany.mockResolvedValue([]);
      mockPrismaService.seniorityHistory.findMany.mockResolvedValue([]);

      const result = await service.getProfile(userId, Role.EMPLOYEE, profileId);

      expect(result).toBeDefined();
      expect(result.id).toBe(profileId);
    });

    it('should deny employee access to another profile', async () => {
      const userId = 'user-123';
      const otherProfileId = 'user-456';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: otherProfileId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        currentSeniorityLevel: 'Developer',
        avatarUrl: null,
      });

      await expect(
        service.getProfile(userId, Role.EMPLOYEE, otherProfileId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Authorization - TECH_LEAD Role', () => {
    it('should allow tech lead to access team member profile', async () => {
      const techLeadId = 'lead-123';
      const teamMemberId = 'member-456';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: teamMemberId,
        name: 'Team Member',
        email: 'member@example.com',
        currentSeniorityLevel: 'Developer',
        avatarUrl: null,
      });

      mockPrismaService.assignment.findFirst.mockResolvedValue({
        id: 'assignment-1',
        profileId: teamMemberId,
        projectId: 'project-1',
      });

      mockPrismaService.assignment.findMany.mockResolvedValue([]);
      mockPrismaService.employeeSkill.findMany.mockResolvedValue([]);
      mockPrismaService.suggestion.findMany.mockResolvedValue([]);
      mockPrismaService.seniorityHistory.findMany.mockResolvedValue([]);

      const result = await service.getProfile(
        techLeadId,
        Role.TECH_LEAD,
        teamMemberId,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(teamMemberId);
    });

    it('should deny tech lead access to non-team member profile', async () => {
      const techLeadId = 'lead-123';
      const nonTeamMemberId = 'other-456';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: nonTeamMemberId,
        name: 'Non Team Member',
        email: 'other@example.com',
        currentSeniorityLevel: 'Developer',
        avatarUrl: null,
      });

      mockPrismaService.assignment.findFirst.mockResolvedValue(null);

      await expect(
        service.getProfile(techLeadId, Role.TECH_LEAD, nonTeamMemberId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Authorization - ADMIN Role', () => {
    it('should allow admin to access any profile', async () => {
      const adminId = 'admin-123';
      const anyProfileId = 'user-456';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: anyProfileId,
        name: 'Any User',
        email: 'user@example.com',
        currentSeniorityLevel: 'Developer',
        avatarUrl: null,
      });

      mockPrismaService.assignment.findMany.mockResolvedValue([]);
      mockPrismaService.employeeSkill.findMany.mockResolvedValue([]);
      mockPrismaService.suggestion.findMany.mockResolvedValue([]);
      mockPrismaService.seniorityHistory.findMany.mockResolvedValue([]);

      const result = await service.getProfile(
        adminId,
        Role.ADMIN,
        anyProfileId,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(anyProfileId);
    });
  });

  describe('Profile Not Found', () => {
    it('should throw NotFoundException when profile does not exist', async () => {
      const userId = 'user-123';
      const nonExistentProfileId = 'non-existent';

      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(
        service.getProfile(userId, Role.ADMIN, nonExistentProfileId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Skills Tiering Logic', () => {
    it('should correctly partition skills into Core Stack and Validated Inventory', async () => {
      const userId = 'user-123';
      const profileId = 'user-123';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: profileId,
        name: 'John Doe',
        email: 'john@example.com',
        currentSeniorityLevel: 'Senior Developer',
        avatarUrl: null,
      });

      // Mock assignments - needs to return different data for different calls
      // First call (getSkillsTiers) - just needs tags
      // Second call (getCurrentAssignments) - needs full project relation
      mockPrismaService.assignment.findMany
        .mockResolvedValueOnce([
          {
            id: 'assignment-1',
            tags: ['TypeScript', 'React'],
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'assignment-1',
            role: 'Developer',
            tags: ['TypeScript', 'React'],
            project: {
              name: 'Project Alpha',
              techLead: null,
            },
          },
        ]);

      // Mock employee skills - TypeScript matches tag, Node.js does not
      mockPrismaService.employeeSkill.findMany.mockResolvedValue([
        {
          id: 'skill-1',
          proficiencyLevel: ProficiencyLevel.EXPERT,
          validatedAt: new Date('2024-01-01'),
          skill: {
            name: 'TypeScript',
            discipline: Discipline.LANGUAGES,
          },
          validatedBy: {
            id: 'validator-1',
            name: 'Validator One',
          },
        },
        {
          id: 'skill-2',
          proficiencyLevel: ProficiencyLevel.ADVANCED,
          validatedAt: new Date('2024-01-02'),
          skill: {
            name: 'Node.js',
            discipline: Discipline.BACKEND,
          },
          validatedBy: {
            id: 'validator-2',
            name: 'Validator Two',
          },
        },
      ]);

      mockPrismaService.suggestion.findMany.mockResolvedValue([]);
      mockPrismaService.seniorityHistory.findMany.mockResolvedValue([]);

      const result = await service.getProfile(userId, Role.EMPLOYEE, profileId);

      // TypeScript should be in Core Stack (matches assignment tag)
      expect(result.skills.coreStack).toHaveLength(1);
      expect(result.skills.coreStack[0].skillName).toBe('TypeScript');

      // Node.js should be in Validated Inventory (no tag match)
      expect(result.skills.validatedInventory).toHaveLength(1);
      expect(result.skills.validatedInventory[0].skillName).toBe('Node.js');
    });

    it('should include pending suggestions in the pending tier', async () => {
      const userId = 'user-123';
      const profileId = 'user-123';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: profileId,
        name: 'John Doe',
        email: 'john@example.com',
        currentSeniorityLevel: 'Senior Developer',
        avatarUrl: null,
      });

      mockPrismaService.assignment.findMany.mockResolvedValue([]);
      mockPrismaService.employeeSkill.findMany.mockResolvedValue([]);

      // Mock pending suggestions
      mockPrismaService.suggestion.findMany.mockResolvedValue([
        {
          id: 'suggestion-1',
          suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
          createdAt: new Date('2024-02-01'),
          skill: {
            name: 'Python',
            discipline: Discipline.LANGUAGES,
          },
        },
      ]);

      mockPrismaService.seniorityHistory.findMany.mockResolvedValue([]);

      const result = await service.getProfile(userId, Role.EMPLOYEE, profileId);

      expect(result.skills.pending).toHaveLength(1);
      expect(result.skills.pending[0].skillName).toBe('Python');
      expect(result.skills.pending[0].suggestedProficiency).toBe(
        ProficiencyLevel.INTERMEDIATE,
      );
    });
  });

  describe('Seniority History', () => {
    it('should return seniority history sorted by start_date descending', async () => {
      const userId = 'user-123';
      const profileId = 'user-123';

      mockPrismaService.profile.findUnique.mockResolvedValue({
        id: profileId,
        name: 'John Doe',
        email: 'john@example.com',
        currentSeniorityLevel: 'Senior Developer',
        avatarUrl: null,
      });

      mockPrismaService.assignment.findMany.mockResolvedValue([]);
      mockPrismaService.employeeSkill.findMany.mockResolvedValue([]);
      mockPrismaService.suggestion.findMany.mockResolvedValue([]);

      mockPrismaService.seniorityHistory.findMany.mockResolvedValue([
        {
          id: 'history-1',
          seniorityLevel: 'Senior Developer',
          start_date: new Date('2024-01-01'),
          end_date: null,
          createdBy: {
            id: 'admin-1',
            name: 'Admin User',
          },
        },
        {
          id: 'history-2',
          seniorityLevel: 'Developer',
          start_date: new Date('2023-01-01'),
          end_date: new Date('2023-12-31'),
          createdBy: {
            id: 'admin-1',
            name: 'Admin User',
          },
        },
      ]);

      const result = await service.getProfile(userId, Role.EMPLOYEE, profileId);

      expect(result.seniorityHistory).toHaveLength(2);
      // Verify that seniority history maintains descending order
      expect(result.seniorityHistory[0].seniorityLevel).toBe(
        'Senior Developer',
      );
      expect(result.seniorityHistory[1].seniorityLevel).toBe('Developer');
    });
  });
});
