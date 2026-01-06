import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { StaleSkillFlaggingService } from '../stale-skill-flagging.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InboxService } from '../../profile/inbox.service';
import {
  ProficiencyLevel,
  SuggestionStatus,
  SuggestionSource,
  ProfileType,
} from '@prisma/client';

describe('StaleSkillFlaggingService - Logging and Integration', () => {
  let service: StaleSkillFlaggingService;
  let prismaService: PrismaService;
  let inboxService: InboxService;
  let loggerSpy: jest.SpyInstance;

  const mockPrismaService = {
    profile: {
      findMany: jest.fn(),
    },
    suggestion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaleSkillFlaggingService,
        InboxService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaleSkillFlaggingService>(StaleSkillFlaggingService);
    prismaService = module.get<PrismaService>(PrismaService);
    inboxService = module.get<InboxService>(InboxService);

    // Spy on Logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  describe('Comprehensive Logging', () => {
    it('should log all required metrics: employees processed, skills identified, suggestions created, and skipped', async () => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 400);

      const mockProfiles = [
        {
          id: 'profile-1',
          assignments: [{ tags: ['React', 'TypeScript'] }],
          employeeSkills: [
            {
              skillId: 1,
              skill: { name: 'React', isActive: true },
              proficiencyLevel: ProficiencyLevel.ADVANCED,
              lastValidatedAt: staleDate,
            },
            {
              skillId: 2,
              skill: { name: 'TypeScript', isActive: true },
              proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
              lastValidatedAt: staleDate,
            },
          ],
        },
        {
          id: 'profile-2',
          assignments: [{ tags: ['Node.js'] }],
          employeeSkills: [
            {
              skillId: 3,
              skill: { name: 'Node.js', isActive: true },
              proficiencyLevel: ProficiencyLevel.EXPERT,
              lastValidatedAt: staleDate,
            },
          ],
        },
      ];

      mockPrismaService.profile.findMany.mockResolvedValue(mockProfiles);

      // First skill has existing PENDING suggestion
      mockPrismaService.suggestion.findFirst.mockImplementation((params) => {
        if (params.where.skillId === 1) {
          return Promise.resolve({
            id: 1,
            profileId: 'profile-1',
            skillId: 1,
            status: SuggestionStatus.PENDING,
            source: SuggestionSource.SELF_REPORT,
          });
        }
        return Promise.resolve(null);
      });

      mockPrismaService.suggestion.create.mockResolvedValue({});

      await service.handleCron();

      // Verify all required metrics are logged
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Employees with active assignments processed: 2'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Core Stack skills identified: 3'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Stale Core Stack skills found (lastValidatedAt > 12 months): 3'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Suggestions successfully created: 2'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Suggestions skipped due to existing PENDING suggestions: 1'),
      );
    });

    it('should log start and completion timestamps with job duration', async () => {
      mockPrismaService.profile.findMany.mockResolvedValue([]);

      await service.handleCron();

      // Verify start timestamp is logged
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Starting stale skill flagging job at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      );

      // Verify completion timestamp is logged
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Completed stale skill flagging job at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      );

      // Verify job duration is logged
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Job duration: \d+ms/),
      );
    });

    it('should log inactive skills excluded count', async () => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 400);

      const mockProfile = {
        id: 'profile-1',
        assignments: [{ tags: ['React', 'Angular', 'Vue'] }],
        employeeSkills: [
          {
            skillId: 1,
            skill: { name: 'React', isActive: true },
            proficiencyLevel: ProficiencyLevel.ADVANCED,
            lastValidatedAt: staleDate,
          },
          {
            skillId: 2,
            skill: { name: 'Angular', isActive: false },
            proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
            lastValidatedAt: staleDate,
          },
          {
            skillId: 3,
            skill: { name: 'Vue', isActive: false },
            proficiencyLevel: ProficiencyLevel.EXPERT,
            lastValidatedAt: staleDate,
          },
        ],
      };

      mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.create.mockResolvedValue({});

      await service.handleCron();

      // Verify inactive skills count is logged
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skills excluded due to isActive = false: 2'),
      );
    });

    it('should use NestJS Logger with correct context and format', async () => {
      mockPrismaService.profile.findMany.mockResolvedValue([]);

      await service.handleCron();

      // Verify logger is called (not console.log or other alternatives)
      expect(loggerSpy).toHaveBeenCalled();

      // Verify consistent logging format
      const logCalls = loggerSpy.mock.calls;
      expect(logCalls.length).toBeGreaterThan(0);

      // All log messages should be strings
      logCalls.forEach((call) => {
        expect(typeof call[0]).toBe('string');
      });
    });
  });

  describe('Integration with Validation Inbox', () => {
    it('should create SYSTEM_FLAG suggestions that appear in Tech Lead Validation Inbox query', async () => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 400);

      // Step 1: Create stale skill suggestion via cron job
      const mockProfile = {
        id: 'profile-1',
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: null,
        currentSeniorityLevel: 'SENIOR',
        assignments: [{ tags: ['React'] }],
        employeeSkills: [
          {
            skillId: 1,
            skill: { name: 'React', isActive: true },
            proficiencyLevel: ProficiencyLevel.ADVANCED,
            lastValidatedAt: staleDate,
          },
        ],
      };

      mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

      // Mock suggestion creation to return a created suggestion
      const createdSuggestion = {
        id: 1,
        profileId: 'profile-1',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
        createdAt: new Date(),
      };
      mockPrismaService.suggestion.create.mockResolvedValue(createdSuggestion);

      await service.handleCron();

      // Verify suggestion was created
      expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
        data: {
          profileId: 'profile-1',
          skillId: 1,
          suggestedProficiency: ProficiencyLevel.ADVANCED,
          status: SuggestionStatus.PENDING,
          source: SuggestionSource.SYSTEM_FLAG,
        },
      });

      // Step 2: Verify created suggestion appears in Validation Inbox query
      const mockProject = {
        id: 'project-1',
        name: 'Project Alpha',
        assignments: [
          {
            role: 'Software Engineer',
            profile: {
              id: 'profile-1',
              name: 'John Doe',
              email: 'john@example.com',
              avatarUrl: null,
              currentSeniorityLevel: 'SENIOR',
              suggestions: [
                {
                  id: 1,
                  skillId: 1,
                  suggestedProficiency: ProficiencyLevel.ADVANCED,
                  status: SuggestionStatus.PENDING,
                  source: SuggestionSource.SYSTEM_FLAG,
                  createdAt: new Date(),
                  skill: {
                    name: 'React',
                    discipline: 'FRONTEND',
                  },
                },
              ],
              employeeSkills: [
                {
                  skillId: 1,
                  proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
                },
              ],
            },
          },
        ],
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject]);

      const inboxResponse = await inboxService.getValidationInbox(
        'tech-lead-1',
        ProfileType.TECH_LEAD,
      );

      // Verify SYSTEM_FLAG suggestion appears in inbox
      expect(inboxResponse.projects.length).toBe(1);
      expect(inboxResponse.projects[0].employees.length).toBe(1);
      expect(inboxResponse.projects[0].employees[0].suggestions.length).toBe(1);

      const suggestion = inboxResponse.projects[0].employees[0].suggestions[0];
      expect(suggestion.source).toBe(SuggestionSource.SYSTEM_FLAG);
      expect(suggestion.skillName).toBe('React');
      expect(suggestion.suggestedProficiency).toBe(ProficiencyLevel.ADVANCED);
    });

    it('should support multi-project visibility - one suggestion appears in multiple Tech Leads inboxes', async () => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 400);

      // Create one suggestion for an employee on multiple projects
      const mockProfile = {
        id: 'profile-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatarUrl: null,
        currentSeniorityLevel: 'MID',
        assignments: [
          { tags: ['TypeScript'] }, // Project 1
          { tags: ['TypeScript'] }, // Project 2
        ],
        employeeSkills: [
          {
            skillId: 2,
            skill: { name: 'TypeScript', isActive: true },
            proficiencyLevel: ProficiencyLevel.EXPERT,
            lastValidatedAt: staleDate,
          },
        ],
      };

      mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.create.mockResolvedValue({
        id: 2,
        profileId: 'profile-1',
        skillId: 2,
        suggestedProficiency: ProficiencyLevel.EXPERT,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
        createdAt: new Date(),
      });

      await service.handleCron();

      // Verify only ONE suggestion was created
      expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);

      // Simulate Tech Lead 1's inbox query
      const mockProject1 = {
        id: 'project-1',
        name: 'Project Alpha',
        assignments: [
          {
            role: 'Software Engineer',
            profile: {
              id: 'profile-1',
              name: 'Jane Smith',
              email: 'jane@example.com',
              avatarUrl: null,
              currentSeniorityLevel: 'MID',
              suggestions: [
                {
                  id: 2,
                  skillId: 2,
                  suggestedProficiency: ProficiencyLevel.EXPERT,
                  status: SuggestionStatus.PENDING,
                  source: SuggestionSource.SYSTEM_FLAG,
                  createdAt: new Date(),
                  skill: {
                    name: 'TypeScript',
                    discipline: 'FRONTEND',
                  },
                },
              ],
              employeeSkills: [
                {
                  skillId: 2,
                  proficiencyLevel: ProficiencyLevel.ADVANCED,
                },
              ],
            },
          },
        ],
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject1]);

      const techLead1Inbox = await inboxService.getValidationInbox(
        'tech-lead-1',
        ProfileType.TECH_LEAD,
      );

      // Verify suggestion appears in Tech Lead 1's inbox
      expect(techLead1Inbox.projects[0].employees[0].suggestions.length).toBe(1);
      expect(techLead1Inbox.projects[0].employees[0].suggestions[0].id).toBe(2);

      // Simulate Tech Lead 2's inbox query
      const mockProject2 = {
        id: 'project-2',
        name: 'Project Beta',
        assignments: [
          {
            role: 'Senior Engineer',
            profile: {
              id: 'profile-1',
              name: 'Jane Smith',
              email: 'jane@example.com',
              avatarUrl: null,
              currentSeniorityLevel: 'MID',
              suggestions: [
                {
                  id: 2, // Same suggestion ID
                  skillId: 2,
                  suggestedProficiency: ProficiencyLevel.EXPERT,
                  status: SuggestionStatus.PENDING,
                  source: SuggestionSource.SYSTEM_FLAG,
                  createdAt: new Date(),
                  skill: {
                    name: 'TypeScript',
                    discipline: 'FRONTEND',
                  },
                },
              ],
              employeeSkills: [
                {
                  skillId: 2,
                  proficiencyLevel: ProficiencyLevel.ADVANCED,
                },
              ],
            },
          },
        ],
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject2]);

      const techLead2Inbox = await inboxService.getValidationInbox(
        'tech-lead-2',
        ProfileType.TECH_LEAD,
      );

      // Verify SAME suggestion appears in Tech Lead 2's inbox
      expect(techLead2Inbox.projects[0].employees[0].suggestions.length).toBe(1);
      expect(techLead2Inbox.projects[0].employees[0].suggestions[0].id).toBe(2);

      // Verify it's the SAME suggestion (not duplicates)
      expect(techLead1Inbox.projects[0].employees[0].suggestions[0].id).toBe(
        techLead2Inbox.projects[0].employees[0].suggestions[0].id,
      );
    });

    it('should complete job successfully end-to-end without errors', async () => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 400);

      const mockProfile = {
        id: 'profile-1',
        assignments: [{ tags: ['React'] }],
        employeeSkills: [
          {
            skillId: 1,
            skill: { name: 'React', isActive: true },
            proficiencyLevel: ProficiencyLevel.ADVANCED,
            lastValidatedAt: staleDate,
          },
        ],
      };

      mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
      mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
      mockPrismaService.suggestion.create.mockResolvedValue({});

      // Should not throw any errors
      await expect(service.handleCron()).resolves.not.toThrow();

      // Verify completion log
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completed stale skill flagging job'),
      );
    });

    it('should show SYSTEM_FLAG suggestions alongside SELF_REPORT suggestions in inbox', async () => {
      // Mock inbox query result with both SYSTEM_FLAG and SELF_REPORT suggestions
      const mockProject = {
        id: 'project-1',
        name: 'Project Alpha',
        assignments: [
          {
            role: 'Software Engineer',
            profile: {
              id: 'profile-1',
              name: 'John Doe',
              email: 'john@example.com',
              avatarUrl: null,
              currentSeniorityLevel: 'SENIOR',
              suggestions: [
                {
                  id: 1,
                  skillId: 1,
                  suggestedProficiency: ProficiencyLevel.ADVANCED,
                  status: SuggestionStatus.PENDING,
                  source: SuggestionSource.SYSTEM_FLAG,
                  createdAt: new Date('2025-01-01'),
                  skill: {
                    name: 'React',
                    discipline: 'FRONTEND',
                  },
                },
                {
                  id: 2,
                  skillId: 2,
                  suggestedProficiency: ProficiencyLevel.EXPERT,
                  status: SuggestionStatus.PENDING,
                  source: SuggestionSource.SELF_REPORT,
                  createdAt: new Date('2025-01-02'),
                  skill: {
                    name: 'Node.js',
                    discipline: 'BACKEND',
                  },
                },
              ],
              employeeSkills: [
                {
                  skillId: 1,
                  proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
                },
                {
                  skillId: 2,
                  proficiencyLevel: ProficiencyLevel.ADVANCED,
                },
              ],
            },
          },
        ],
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject]);

      const inboxResponse = await inboxService.getValidationInbox(
        'tech-lead-1',
        ProfileType.TECH_LEAD,
      );

      // Verify both suggestions appear in inbox
      expect(inboxResponse.projects[0].employees[0].suggestions.length).toBe(2);

      const suggestions = inboxResponse.projects[0].employees[0].suggestions;
      const systemFlagSuggestion = suggestions.find((s) => s.source === SuggestionSource.SYSTEM_FLAG);
      const selfReportSuggestion = suggestions.find((s) => s.source === SuggestionSource.SELF_REPORT);

      expect(systemFlagSuggestion).toBeDefined();
      expect(selfReportSuggestion).toBeDefined();

      // Verify SYSTEM_FLAG suggestion details
      expect(systemFlagSuggestion?.skillName).toBe('React');
      expect(systemFlagSuggestion?.suggestedProficiency).toBe(ProficiencyLevel.ADVANCED);

      // Verify SELF_REPORT suggestion details
      expect(selfReportSuggestion?.skillName).toBe('Node.js');
      expect(selfReportSuggestion?.suggestedProficiency).toBe(ProficiencyLevel.EXPERT);
    });
  });
});
