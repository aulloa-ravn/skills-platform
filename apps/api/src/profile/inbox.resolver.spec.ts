import { Test, TestingModule } from '@nestjs/testing';
import { InboxResolver } from './inbox.resolver';
import { InboxService } from './inbox.service';
import { Role } from '@prisma/client';
import { InboxResponse } from './dto/inbox.response';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';

describe('InboxResolver', () => {
  let resolver: InboxResolver;
  let inboxService: InboxService;

  const mockInboxService = {
    getValidationInbox: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxResolver,
        {
          provide: InboxService,
          useValue: mockInboxService,
        },
      ],
    }).compile();

    resolver = module.get<InboxResolver>(InboxResolver);
    inboxService = module.get<InboxService>(InboxService);
    jest.clearAllMocks();
  });

  describe('getValidationInbox', () => {
    it('should be defined', () => {
      expect(resolver).toBeDefined();
    });

    it('should call InboxService.getValidationInbox with correct parameters', async () => {
      const mockUser: CurrentUserType = {
        id: 'user-123',
        email: 'user@ravn.com',
        role: Role.TECH_LEAD,
      };

      const mockResponse: InboxResponse = {
        projects: [],
      };

      mockInboxService.getValidationInbox.mockResolvedValue(mockResponse);

      const result = await resolver.getValidationInbox(mockUser);

      expect(mockInboxService.getValidationInbox).toHaveBeenCalledWith(
        'user-123',
        Role.TECH_LEAD,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return InboxResponse type', async () => {
      const mockUser: CurrentUserType = {
        id: 'admin-123',
        email: 'admin@ravn.com',
        role: Role.ADMIN,
      };

      const mockResponse: InboxResponse = {
        projects: [
          {
            projectId: 'proj-1',
            projectName: 'Project Alpha',
            pendingSuggestionsCount: 2,
            employees: [],
          },
        ],
      };

      mockInboxService.getValidationInbox.mockResolvedValue(mockResponse);

      const result = await resolver.getValidationInbox(mockUser);

      expect(result).toBeDefined();
      expect(result.projects).toBeDefined();
      expect(Array.isArray(result.projects)).toBe(true);
    });

    it('should extract user id and role from CurrentUser decorator', async () => {
      const mockUser: CurrentUserType = {
        id: 'tech-lead-456',
        email: 'techlead@ravn.com',
        role: Role.TECH_LEAD,
      };

      mockInboxService.getValidationInbox.mockResolvedValue({ projects: [] });

      await resolver.getValidationInbox(mockUser);

      expect(mockInboxService.getValidationInbox).toHaveBeenCalledWith(
        'tech-lead-456',
        Role.TECH_LEAD,
      );
    });
  });
});
