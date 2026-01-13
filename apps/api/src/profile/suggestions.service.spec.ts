import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProficiencyLevel, SuggestionStatus } from '@prisma/client';

describe('SuggestionsService', () => {
  let service: SuggestionsService;
  let prisma: PrismaService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SuggestionsService>(SuggestionsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateSkillExists', () => {
    it('should throw NotFoundException when skill does not exist', async () => {
      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(service.validateSkillExists(999)).rejects.toThrow(
        NotFoundException,
      );

      try {
        await service.validateSkillExists(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toEqual({
          message: 'Skill not found',
          extensions: { code: 'SKILL_NOT_FOUND' },
        });
      }
    });

    it('should throw BadRequestException when skill is inactive', async () => {
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: false,
      });

      await expect(service.validateSkillExists(1)).rejects.toThrow(
        BadRequestException,
      );

      try {
        await service.validateSkillExists(1);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toEqual({
          message: 'Skill is inactive',
          extensions: { code: 'SKILL_INACTIVE' },
        });
      }
    });

    it('should pass validation when skill exists and is active', async () => {
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: true,
      });

      await expect(service.validateSkillExists(1)).resolves.not.toThrow();
    });
  });

  describe('validateSkillAvailability', () => {
    it('should throw BadRequestException when EmployeeSkill exists', async () => {
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue({
        id: 1,
        profileId: 'profile-123',
        skillId: 1,
      });
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

      await expect(
        service.validateSkillAvailability('profile-123', 1),
      ).rejects.toThrow(BadRequestException);

      try {
        await service.validateSkillAvailability('profile-123', 1);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toEqual({
          message: 'Employee already has this skill',
          extensions: { code: 'SKILL_ALREADY_EXISTS' },
        });
      }
    });

    it('should throw BadRequestException when Suggestion exists (ANY status)', async () => {
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.findFirst.mockResolvedValue({
        id: 1,
        profileId: 'profile-123',
        skillId: 1,
        status: SuggestionStatus.PENDING,
      });

      await expect(
        service.validateSkillAvailability('profile-123', 1),
      ).rejects.toThrow(BadRequestException);

      try {
        await service.validateSkillAvailability('profile-123', 1);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toEqual({
          message: 'Employee already has a suggestion for this skill',
          extensions: { code: 'SKILL_ALREADY_EXISTS' },
        });
      }
    });

    it('should pass validation when neither EmployeeSkill nor Suggestion exists', async () => {
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

      await expect(
        service.validateSkillAvailability('profile-123', 1),
      ).resolves.not.toThrow();
    });
  });

  describe('findEmployeeTechLead', () => {
    it('should return Tech Lead ID from employee assignment', async () => {
      mockPrismaService.assignment.findFirst.mockResolvedValue({
        id: 'assignment-123',
        profileId: 'profile-123',
        project: {
          techLeadId: 'tech-lead-456',
        },
      });

      const techLeadId = await service.findEmployeeTechLead('profile-123');
      expect(techLeadId).toBe('tech-lead-456');
      expect(mockPrismaService.assignment.findFirst).toHaveBeenCalledWith({
        where: { profileId: 'profile-123' },
        include: {
          project: {
            select: { techLeadId: true },
          },
        },
      });
    });
  });

  describe('createSelfReportSuggestion', () => {
    it('should create suggestion with correct fields when validations pass', async () => {
      // Mock validateSkillExists - skill is active
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: true,
      });

      // Mock validateSkillAvailability - no existing records
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

      // Mock suggestion creation
      const mockCreatedSuggestion = {
        id: 1,
        profileId: 'profile-123',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        source: 'SELF_REPORT',
        createdAt: new Date(),
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

      const result = await service.createSelfReportSuggestion(
        'profile-123',
        1,
        ProficiencyLevel.INTERMEDIATE,
      );

      expect(result).toEqual(mockCreatedSuggestion);
      expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
        data: {
          profileId: 'profile-123',
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

    it('should throw error when skill does not exist', async () => {
      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(
        service.createSelfReportSuggestion(
          'profile-123',
          999,
          ProficiencyLevel.INTERMEDIATE,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when skill already exists in EmployeeSkill', async () => {
      // Mock validateSkillExists - skill is active
      mockPrismaService.skill.findUnique.mockResolvedValue({
        id: 1,
        name: 'JavaScript',
        isActive: true,
      });

      // Mock validateSkillAvailability - EmployeeSkill exists
      mockPrismaService.employeeSkill.findFirst.mockResolvedValue({
        id: 1,
        profileId: 'profile-123',
        skillId: 1,
      });

      await expect(
        service.createSelfReportSuggestion(
          'profile-123',
          1,
          ProficiencyLevel.INTERMEDIATE,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
