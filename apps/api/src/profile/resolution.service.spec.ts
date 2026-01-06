import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProfileType,
  SuggestionStatus,
  ProficiencyLevel,
} from '@prisma/client';
import { ResolutionAction } from './dto/resolution.input';

describe('ResolutionService', () => {
  let service: ResolutionService;
  let prisma: PrismaService;

  const mockPrismaService = {
    suggestion: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    employeeSkill: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolutionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ResolutionService>(ResolutionService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('APPROVE action', () => {
    it('should successfully approve a suggestion and create EmployeeSkill', async () => {
      const mockSuggestion = {
        id: 'suggestion-1',
        profileId: 'employee-1',
        skillId: 'skill-1',
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        profile: { id: 'employee-1', name: 'John Doe', assignments: [] },
        skill: { id: 'skill-1', name: 'TypeScript' },
      };

      mockPrismaService.suggestion.findUnique.mockResolvedValue(mockSuggestion);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          suggestion: {
            findUnique: jest.fn().mockResolvedValue(mockSuggestion),
            update: jest.fn().mockResolvedValue(mockSuggestion),
          },
          employeeSkill: {
            upsert: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.processed[0].action).toBe(ResolutionAction.APPROVE);
      expect(result.processed[0].proficiencyLevel).toBe(
        ProficiencyLevel.ADVANCED,
      );
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('REJECT action', () => {
    it('should successfully reject a suggestion without creating EmployeeSkill', async () => {
      const mockSuggestion = {
        id: 'suggestion-1',
        profileId: 'employee-1',
        skillId: 'skill-1',
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        profile: { id: 'employee-1', name: 'Jane Smith', assignments: [] },
        skill: { id: 'skill-1', name: 'React' },
      };

      mockPrismaService.suggestion.findUnique.mockResolvedValue(mockSuggestion);
      mockPrismaService.suggestion.update.mockResolvedValue({
        ...mockSuggestion,
        status: SuggestionStatus.REJECTED,
      });

      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.REJECT,
            },
          ],
        },
      );

      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.processed[0].action).toBe(ResolutionAction.REJECT);
      expect(result.errors).toHaveLength(0);
      expect(mockPrismaService.suggestion.update).toHaveBeenCalledWith({
        where: { id: 'suggestion-1' },
        data: {
          status: SuggestionStatus.REJECTED,
          resolvedAt: expect.any(Date),
        },
      });
    });
  });

  describe('TECH_LEAD authorization', () => {
    it('should allow TECH_LEAD to resolve suggestions for their team', async () => {
      const mockSuggestion = {
        id: 'suggestion-1',
        profileId: 'employee-1',
        skillId: 'skill-1',
        suggestedProficiency: ProficiencyLevel.EXPERT,
        status: SuggestionStatus.PENDING,
        profile: {
          id: 'employee-1',
          name: 'Team Member',
          assignments: [
            {
              project: {
                id: 'project-1',
                techLeadId: 'tech-lead-1',
              },
            },
          ],
        },
        skill: { id: 'skill-1', name: 'Node.js' },
      };

      // First call for authorization check, second for REJECT handler
      mockPrismaService.suggestion.findUnique
        .mockResolvedValueOnce(mockSuggestion)
        .mockResolvedValueOnce(mockSuggestion);

      mockPrismaService.suggestion.update.mockResolvedValue({
        ...mockSuggestion,
        status: SuggestionStatus.REJECTED,
      });

      const result = await service.resolveSuggestions(
        'tech-lead-1',
        ProfileType.TECH_LEAD,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.REJECT,
            },
          ],
        },
      );

      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should deny TECH_LEAD access to suggestions outside their team', async () => {
      const mockSuggestion = {
        id: 'suggestion-1',
        profileId: 'employee-1',
        skillId: 'skill-1',
        status: SuggestionStatus.PENDING,
        profile: {
          id: 'employee-1',
          name: 'Other Team Member',
          assignments: [
            {
              project: {
                id: 'project-1',
                techLeadId: 'different-tech-lead',
              },
            },
          ],
        },
      };

      mockPrismaService.suggestion.findUnique.mockResolvedValue(mockSuggestion);

      const result = await service.resolveSuggestions(
        'tech-lead-1',
        ProfileType.TECH_LEAD,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.REJECT,
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.processed).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('UNAUTHORIZED');
    });
  });

  describe('Batch processing with partial failures', () => {
    it('should process valid items and collect errors for invalid ones', async () => {
      const mockSuggestion1 = {
        id: 'suggestion-1',
        profileId: 'employee-1',
        skillId: 'skill-1',
        suggestedProficiency: ProficiencyLevel.NOVICE,
        status: SuggestionStatus.PENDING,
        profile: { id: 'employee-1', name: 'John', assignments: [] },
        skill: { id: 'skill-1', name: 'CSS' },
      };

      // First suggestion succeeds
      mockPrismaService.suggestion.findUnique
        .mockResolvedValueOnce(mockSuggestion1)
        .mockResolvedValueOnce(mockSuggestion1)
        // Second suggestion not found
        .mockResolvedValueOnce(null);

      mockPrismaService.suggestion.update.mockResolvedValue({
        ...mockSuggestion1,
        status: SuggestionStatus.REJECTED,
      });

      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.REJECT,
            },
            {
              suggestionId: 'non-existent',
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('NOT_FOUND');
    });
  });

  describe('Validation', () => {
    it('should return error when adjustedProficiency is missing for ADJUST_LEVEL', async () => {
      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.ADJUST_LEVEL,
              // Missing adjustedProficiency
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('MISSING_PROFICIENCY');
    });

    it('should return error for invalid proficiency level', async () => {
      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.ADJUST_LEVEL,
              adjustedProficiency: 'INVALID_LEVEL',
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_PROFICIENCY');
    });

    it('should return error for already processed suggestion', async () => {
      const processedSuggestion = {
        id: 'suggestion-1',
        status: SuggestionStatus.APPROVED,
      };

      mockPrismaService.suggestion.findUnique.mockResolvedValue(
        processedSuggestion,
      );

      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('ALREADY_PROCESSED');
    });
  });

  describe('Duplicate handling', () => {
    it('should process only first occurrence of duplicate suggestionIds', async () => {
      const mockSuggestion = {
        id: 'suggestion-1',
        profileId: 'employee-1',
        skillId: 'skill-1',
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        profile: { id: 'employee-1', name: 'Alice', assignments: [] },
        skill: { id: 'skill-1', name: 'Python' },
      };

      mockPrismaService.suggestion.findUnique.mockResolvedValue(mockSuggestion);
      mockPrismaService.suggestion.update.mockResolvedValue({
        ...mockSuggestion,
        status: SuggestionStatus.REJECTED,
      });

      const result = await service.resolveSuggestions(
        'admin-1',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.REJECT,
            },
            {
              suggestionId: 'suggestion-1',
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.processed[0].action).toBe(ResolutionAction.REJECT);
      expect(result.errors).toHaveLength(0);
    });
  });
});
