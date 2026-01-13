import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { SuggestionsService } from './suggestions.service';
import { ProficiencyLevel, ProfileType, SuggestionStatus } from '@prisma/client';
import { SubmitSkillSuggestionInput } from './dto/submit-skill-suggestion.input';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';

describe('ProfileResolver - submitSkillSuggestion Mutation', () => {
  let resolver: ProfileResolver;
  let suggestionsService: SuggestionsService;

  const mockProfileService = {
    getProfile: jest.fn(),
    getAllProfilesForAdmin: jest.fn(),
  };

  const mockSuggestionsService = {
    createSelfReportSuggestion: jest.fn(),
  };

  const mockEmployeeUser: CurrentUserType = {
    id: 'employee-123',
    email: 'employee@ravn.com',
    type: ProfileType.EMPLOYEE,
  };

  const mockTechLeadUser: CurrentUserType = {
    id: 'tech-lead-456',
    email: 'techlead@ravn.com',
    type: ProfileType.TECH_LEAD,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: SuggestionsService,
          useValue: mockSuggestionsService,
        },
      ],
    }).compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
    suggestionsService = module.get<SuggestionsService>(SuggestionsService);

    jest.clearAllMocks();
  });

  describe('submitSkillSuggestion', () => {
    it('should successfully create suggestion with valid inputs', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 1,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

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

      mockSuggestionsService.createSelfReportSuggestion.mockResolvedValue(
        mockCreatedSuggestion,
      );

      const result = await resolver.submitSkillSuggestion(mockEmployeeUser, input);

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

      expect(suggestionsService.createSelfReportSuggestion).toHaveBeenCalledWith(
        'employee-123',
        1,
        ProficiencyLevel.INTERMEDIATE,
      );
    });

    it('should throw SKILL_ALREADY_EXISTS when EmployeeSkill exists', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 1,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      const error = new BadRequestException({
        message: 'Employee already has this skill',
        extensions: {
          code: 'SKILL_ALREADY_EXISTS',
        },
      });

      mockSuggestionsService.createSelfReportSuggestion.mockRejectedValue(error);

      await expect(
        resolver.submitSkillSuggestion(mockEmployeeUser, input),
      ).rejects.toThrow(BadRequestException);

      try {
        await resolver.submitSkillSuggestion(mockEmployeeUser, input);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.response).toEqual({
          message: 'Employee already has this skill',
          extensions: {
            code: 'SKILL_ALREADY_EXISTS',
          },
        });
      }
    });

    it('should throw SKILL_ALREADY_EXISTS when Suggestion exists', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 1,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      const error = new BadRequestException({
        message: 'Employee already has a suggestion for this skill',
        extensions: {
          code: 'SKILL_ALREADY_EXISTS',
        },
      });

      mockSuggestionsService.createSelfReportSuggestion.mockRejectedValue(error);

      await expect(
        resolver.submitSkillSuggestion(mockEmployeeUser, input),
      ).rejects.toThrow(BadRequestException);

      try {
        await resolver.submitSkillSuggestion(mockEmployeeUser, input);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.response.extensions.code).toBe('SKILL_ALREADY_EXISTS');
      }
    });

    it('should throw SKILL_NOT_FOUND when skill does not exist', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 999,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      const error = new NotFoundException({
        message: 'Skill not found',
        extensions: {
          code: 'SKILL_NOT_FOUND',
        },
      });

      mockSuggestionsService.createSelfReportSuggestion.mockRejectedValue(error);

      await expect(
        resolver.submitSkillSuggestion(mockEmployeeUser, input),
      ).rejects.toThrow(NotFoundException);

      try {
        await resolver.submitSkillSuggestion(mockEmployeeUser, input);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response.extensions.code).toBe('SKILL_NOT_FOUND');
      }
    });

    it('should throw SKILL_INACTIVE when skill is inactive', async () => {
      const input: SubmitSkillSuggestionInput = {
        skillId: 1,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      const error = new BadRequestException({
        message: 'Skill is inactive',
        extensions: {
          code: 'SKILL_INACTIVE',
        },
      });

      mockSuggestionsService.createSelfReportSuggestion.mockRejectedValue(error);

      await expect(
        resolver.submitSkillSuggestion(mockEmployeeUser, input),
      ).rejects.toThrow(BadRequestException);

      try {
        await resolver.submitSkillSuggestion(mockEmployeeUser, input);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.response.extensions.code).toBe('SKILL_INACTIVE');
      }
    });

    it('should enforce EMPLOYEE role restriction', async () => {
      // Note: In actual execution, RolesGuard would prevent this from reaching the resolver
      // This test verifies the mutation is decorated with @Roles(ProfileType.EMPLOYEE)
      // The guard enforcement is tested separately in integration tests

      const input: SubmitSkillSuggestionInput = {
        skillId: 1,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
      };

      // Verify decorator is applied (metadata check)
      const metadata = Reflect.getMetadata(
        'roles',
        resolver.submitSkillSuggestion,
      );
      expect(metadata).toEqual([ProfileType.EMPLOYEE]);
    });
  });
});
