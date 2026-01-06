import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProfileType,
  ProficiencyLevel,
  Discipline,
  SuggestionSource,
  SuggestionStatus,
  SeniorityLevel,
} from '@prisma/client';

describe('InboxService', () => {
  let service: InboxService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InboxService>(InboxService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getValidationInbox - Authorization', () => {
    it('should throw ForbiddenException when EMPLOYEE role attempts access', async () => {
      await expect(
        service.getValidationInbox('user-123', ProfileType.EMPLOYEE),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.getValidationInbox('user-123', ProfileType.EMPLOYEE),
      ).rejects.toThrow(
        'You do not have permission to access the validation inbox',
      );
    });

    it('should allow TECH_LEAD role to access inbox', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      const result = await service.getValidationInbox(
        'user-123',
        ProfileType.TECH_LEAD,
      );

      expect(result).toBeDefined();
      expect(result.projects).toEqual([]);
    });

    it('should allow ADMIN role to access inbox', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      const result = await service.getValidationInbox(
        'user-123',
        ProfileType.ADMIN,
      );

      expect(result).toBeDefined();
      expect(result.projects).toEqual([]);
    });
  });

  describe('getValidationInbox - Filtering', () => {
    it('should filter projects by techLeadId for TECH_LEAD role', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      await service.getValidationInbox('tech-lead-id', ProfileType.TECH_LEAD);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            techLeadId: 'tech-lead-id',
          }),
        }),
      );
    });

    it('should NOT filter by techLeadId for ADMIN role', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      await service.getValidationInbox('admin-id', ProfileType.ADMIN);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            techLeadId: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('getValidationInbox - Current Proficiency Lookup', () => {
    it('should return current proficiency when EmployeeSkill exists', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'Project Alpha',
          assignments: [
            {
              profile: {
                id: 'emp-1',
                name: 'John Doe',
                email: 'john@ravn.com',
                suggestions: [
                  {
                    id: 'suggestion-1',
                    skillId: 'skill-1',
                    status: SuggestionStatus.PENDING,
                    suggestedProficiency: ProficiencyLevel.ADVANCED,
                    source: SuggestionSource.SELF_REPORT,
                    createdAt: new Date('2025-01-15'),
                    skill: {
                      name: 'React',
                      discipline: Discipline.FRONTEND,
                    },
                  },
                ],
                employeeSkills: [
                  {
                    skillId: 'skill-1',
                    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
                  },
                ],
              },
            },
          ],
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.getValidationInbox(
        'user-123',
        ProfileType.ADMIN,
      );

      expect(
        result.projects[0].employees[0].suggestions[0].currentProficiency,
      ).toBe(ProficiencyLevel.INTERMEDIATE);
    });

    it('should return undefined for currentProficiency when EmployeeSkill does not exist', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'Project Alpha',
          assignments: [
            {
              profile: {
                id: 'emp-1',
                name: 'John Doe',
                email: 'john@ravn.com',
                suggestions: [
                  {
                    id: 'suggestion-1',
                    skillId: 'skill-1',
                    status: SuggestionStatus.PENDING,
                    suggestedProficiency: ProficiencyLevel.ADVANCED,
                    source: SuggestionSource.SELF_REPORT,
                    createdAt: new Date('2025-01-15'),
                    skill: {
                      name: 'TypeScript',
                      discipline: Discipline.BACKEND,
                    },
                  },
                ],
                employeeSkills: [], // No existing skills
              },
            },
          ],
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.getValidationInbox(
        'user-123',
        ProfileType.ADMIN,
      );

      expect(
        result.projects[0].employees[0].suggestions[0].currentProficiency,
      ).toBeUndefined();
    });
  });

  describe('getValidationInbox - Empty State Handling', () => {
    it('should return empty projects array when no pending suggestions exist', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      const result = await service.getValidationInbox(
        'user-123',
        ProfileType.ADMIN,
      );

      expect(result.projects).toEqual([]);
    });

    it('should exclude employees with no pending suggestions', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'Project Alpha',
          assignments: [
            {
              profile: {
                id: 'emp-1',
                name: 'John Doe',
                email: 'john@ravn.com',
                suggestions: [], // No pending suggestions
                employeeSkills: [],
              },
            },
          ],
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.getValidationInbox(
        'user-123',
        ProfileType.ADMIN,
      );

      expect(result.projects).toEqual([]);
    });
  });
});
