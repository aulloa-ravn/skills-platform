import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProficiencyLevel,
  SuggestionStatus,
  ProfileType,
} from '@prisma/client';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { SubmitSkillSuggestionInput } from './dto/submit-skill-suggestion.input';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';

describe('Self-Report Skills API - Integration Tests', () => {
  let resolver: ProfileResolver;
  let suggestionsService: SuggestionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    skill: {
      findUnique: jest.fn(),
    },
    employeeSkill: {
      findFirst: jest.fn(),
    },
    suggestion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    assignment: {
      findFirst: jest.fn(),
    },
  };

  const mockProfileService = {
    getProfile: jest.fn(),
    getAllProfilesForAdmin: jest.fn(),
  };

  const mockEmployeeUser: CurrentUserType = {
    id: 'employee-123',
    email: 'employee@ravn.com',
    type: ProfileType.EMPLOYEE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        ProfileResolver,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
    suggestionsService = module.get<SuggestionsService>(SuggestionsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('End-to-end: EMPLOYEE submits valid skill', () => {
    it('should create PENDING suggestion with SELF_REPORT source', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 1,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      // Mock skill exists and is active
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        discipline: 'FRONTEND',
        isActive: true,
      });

      // Mock no existing EmployeeSkill or Suggestion
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

      // Mock assignment with Tech Lead
      mockPrismaService.assignment.findFirst.mockResolvedValue({
        id: 'assignment-123',
        profileId: 'employee-123',
        project: {
          techLeadId: 'tech-lead-456',
        },
      });

      // Mock suggestion creation
      const mockCreatedSuggestion = {
        id: 1,
        profileId: 'employee-123',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        source: 'SELF_REPORT',
        createdAt: new Date('2026-01-12T00:00:00Z'),
        resolvedAt: null,
        skill: {
          id: 1,
          name: 'JavaScript',
          discipline: 'FRONTEND',
        },
      };
      mockPrismaService.suggestion.create.mockResolvedValue(
        mockCreatedSuggestion,
      );

      const result = await resolver.submitSkillSuggestion(
        mockEmployeeUser,
        input,
      );

      // Verify response structure
      expect(result).toEqual({
        suggestionId: 1,
        status: SuggestionStatus.PENDING,
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        createdAt: new Date('2026-01-12T00:00:00Z'),
        skill: {
          id: 1,
          name: 'JavaScript',
          discipline: 'FRONTEND',
        },
      });

      // Verify validation flow: skill existence checked first
      expect(mockPrismaService.skill.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      // Verify validation flow: duplicate checks performed
      expect(mockPrismaService.employeeSkill.findFirst).toHaveBeenCalledWith({
        where: { profileId: 'employee-123', skillId: 1 },
      });
      expect(mockPrismaService.suggestion.findFirst).toHaveBeenCalledWith({
        where: { profileId: 'employee-123', skillId: 1 },
      });

      // Verify suggestion created with correct data
      expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
        data: {
          profileId: 'employee-123',
          skillId: 1,
          suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
        include: {
          skill: {
            select: {
              id: true,
              name: true,
              discipline: true,
            },
          },
        },
      });
    });
  });

  describe('Integration: Duplicate prevention checks both tables', () => {
    it('should block when EmployeeSkill exists before checking Suggestion', async () => {
      // Mock skill exists
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: true,
      });

      // Mock existing EmployeeSkill
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue({
        id: 1,
        profileId: 'employee-123',
        skillId: 1,
      });

      // Suggestion check should not be reached
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

      await expect(
        suggestionsService.createSelfReportSuggestion(
          'employee-123',
          1,
          ProficiencyLevel.INTERMEDIATE,
        ),
      ).rejects.toThrow(BadRequestException);

      // Verify EmployeeSkill was checked
      expect(mockPrismaService.employeeSkill.findFirst).toHaveBeenCalledWith({
        where: { profileId: 'employee-123', skillId: 1 },
      });

      // Verify Suggestion check was NOT performed (early return)
      expect(mockPrismaService.suggestion.findFirst).not.toHaveBeenCalled();
    });

    it('should block when Suggestion exists (any status)', async () => {
      // Mock skill exists
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: true,
      });

      // Mock no EmployeeSkill
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue(null);

      // Mock existing Suggestion (REJECTED status)
      mockPrismaService.suggestion.findFirst.mockResolvedValue({
        id: 1,
        profileId: 'employee-123',
        skillId: 1,
        status: SuggestionStatus.REJECTED,
      });

      await expect(
        suggestionsService.createSelfReportSuggestion(
          'employee-123',
          1,
          ProficiencyLevel.INTERMEDIATE,
        ),
      ).rejects.toThrow(BadRequestException);

      // Verify both checks were performed
      expect(mockPrismaService.employeeSkill.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.suggestion.findFirst).toHaveBeenCalled();
    });
  });

  describe('Integration: Tech Lead routing verification', () => {
    it('should query Assignment → Project → techLeadId correctly', async () => {
      mockPrismaService.assignment.findFirst.mockResolvedValue({
        id: 'assignment-123',
        profileId: 'employee-123',
        project: {
          id: 'project-456',
          name: 'Project Alpha',
          techLeadId: 'tech-lead-789',
        },
      });

      const techLeadId =
        await suggestionsService.findEmployeeTechLead('employee-123');

      expect(techLeadId).toBe('tech-lead-789');
      expect(mockPrismaService.assignment.findFirst).toHaveBeenCalledWith({
        where: { profileId: 'employee-123' },
        include: {
          project: {
            select: { techLeadId: true },
          },
        },
      });
    });
  });

  describe('Error flow: Invalid skill ID → SKILL_NOT_FOUND', () => {
    it('should return proper GraphQL error response', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 999,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      // Mock skill does not exist
      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      try {
        await resolver.submitSkillSuggestion(mockEmployeeUser, input);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toEqual({
          message: 'Skill not found',
          extensions: {
            code: 'SKILL_NOT_FOUND',
          },
        });
      }
    });
  });

  describe('Validation order verification', () => {
    it('should validate skill existence before checking availability', async () => {
      // Mock skill does not exist
      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(
        suggestionsService.createSelfReportSuggestion(
          'employee-123',
          999,
          ProficiencyLevel.INTERMEDIATE,
        ),
      ).rejects.toThrow(NotFoundException);

      // Verify skill existence was checked
      expect(mockPrismaService.skill.findUnique).toHaveBeenCalled();

      // Verify availability checks were NOT performed (early return)
      expect(mockPrismaService.employeeSkill.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.suggestion.findFirst).not.toHaveBeenCalled();
    });

    it('should validate skill active status before checking availability', async () => {
      // Mock skill exists but is inactive
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: false,
      });

      await expect(
        suggestionsService.createSelfReportSuggestion(
          'employee-123',
          1,
          ProficiencyLevel.INTERMEDIATE,
        ),
      ).rejects.toThrow(BadRequestException);

      // Verify skill existence was checked
      expect(mockPrismaService.skill.findUnique).toHaveBeenCalled();

      // Verify availability checks were NOT performed (early return)
      expect(mockPrismaService.employeeSkill.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.suggestion.findFirst).not.toHaveBeenCalled();
    });
  });
});
