import { Test, TestingModule } from '@nestjs/testing';
import { ResolutionResolver } from './resolution.resolver';
import { ResolutionService } from './resolution.service';
import { ProfileType, SeniorityLevel } from '@prisma/client';
import { ResolutionAction } from './dto/resolution.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ResolutionResolver', () => {
  let resolver: ResolutionResolver;
  let service: ResolutionService;

  const mockResolutionService = {
    resolveSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolutionResolver,
        {
          provide: ResolutionService,
          useValue: mockResolutionService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<ResolutionResolver>(ResolutionResolver);
    service = module.get<ResolutionService>(ResolutionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('resolveSuggestions mutation', () => {
    it('should call service with correct parameters', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        type: ProfileType.ADMIN,
      };

      const mockInput = {
        decisions: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
          },
        ],
      };

      const mockResponse = {
        success: true,
        processed: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
            employeeName: 'John Doe',
            skillName: 'TypeScript',
            proficiencyLevel: 'ADVANCED',
          },
        ],
        errors: [],
      };

      mockResolutionService.resolveSuggestions.mockResolvedValue(mockResponse);

      const result = await resolver.resolveSuggestions(mockInput, mockUser);

      expect(service.resolveSuggestions).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.type,
        mockInput,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return successful response for valid mutation', async () => {
      const mockUser = {
        id: 'tech-lead-1',
        email: 'lead@example.com',
        type: ProfileType.TECH_LEAD,
      };

      const mockInput = {
        decisions: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.REJECT,
          },
        ],
      };

      const mockResponse = {
        success: true,
        processed: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.REJECT,
            employeeName: 'Jane Smith',
            skillName: 'React',
            proficiencyLevel: 'INTERMEDIATE',
          },
        ],
        errors: [],
      };

      mockResolutionService.resolveSuggestions.mockResolvedValue(mockResponse);

      const result = await resolver.resolveSuggestions(mockInput, mockUser);

      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle batch processing response', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        type: ProfileType.ADMIN,
      };

      const mockInput = {
        decisions: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
          },
          {
            suggestionId: 'suggestion-2',
            action: ResolutionAction.ADJUST_LEVEL,
            adjustedProficiency: 'EXPERT',
          },
          {
            suggestionId: 'suggestion-3',
            action: ResolutionAction.REJECT,
          },
        ],
      };

      const mockResponse = {
        success: true,
        processed: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
            employeeName: 'Alice',
            skillName: 'Python',
            proficiencyLevel: 'NOVICE',
          },
          {
            suggestionId: 'suggestion-2',
            action: ResolutionAction.ADJUST_LEVEL,
            employeeName: 'Bob',
            skillName: 'Java',
            proficiencyLevel: 'EXPERT',
          },
          {
            suggestionId: 'suggestion-3',
            action: ResolutionAction.REJECT,
            employeeName: 'Charlie',
            skillName: 'Go',
            proficiencyLevel: 'INTERMEDIATE',
          },
        ],
        errors: [],
      };

      mockResolutionService.resolveSuggestions.mockResolvedValue(mockResponse);

      const result = await resolver.resolveSuggestions(mockInput, mockUser);

      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial failure response', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        type: ProfileType.ADMIN,
      };

      const mockInput = {
        decisions: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
          },
          {
            suggestionId: 'non-existent',
            action: ResolutionAction.REJECT,
          },
        ],
      };

      const mockResponse = {
        success: false,
        processed: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
            employeeName: 'David',
            skillName: 'Rust',
            proficiencyLevel: 'ADVANCED',
          },
        ],
        errors: [
          {
            suggestionId: 'non-existent',
            message: 'Suggestion not found',
            code: 'NOT_FOUND',
          },
        ],
      };

      mockResolutionService.resolveSuggestions.mockResolvedValue(mockResponse);

      const result = await resolver.resolveSuggestions(mockInput, mockUser);

      expect(result.success).toBe(false);
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('NOT_FOUND');
    });

    it('should extract user data from CurrentUser decorator', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        type: ProfileType.TECH_LEAD,
      };

      const mockInput = {
        decisions: [
          {
            suggestionId: 'suggestion-1',
            action: ResolutionAction.APPROVE,
          },
        ],
      };

      mockResolutionService.resolveSuggestions.mockResolvedValue({
        success: true,
        processed: [],
        errors: [],
      });

      await resolver.resolveSuggestions(mockInput, mockUser);

      expect(service.resolveSuggestions).toHaveBeenCalledWith(
        'user-123',
        ProfileType.TECH_LEAD,
        mockInput,
      );
    });
  });
});
