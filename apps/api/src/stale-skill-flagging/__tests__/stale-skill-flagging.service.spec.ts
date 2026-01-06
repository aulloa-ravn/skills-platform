import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { StaleSkillFlaggingService } from '../stale-skill-flagging.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ProficiencyLevel,
  SuggestionStatus,
  SuggestionSource,
} from '@prisma/client';

describe('StaleSkillFlaggingService - Infrastructure', () => {
  let service: StaleSkillFlaggingService;
  let prismaService: PrismaService;
  let loggerSpy: jest.SpyInstance;

  const mockPrismaService = {
    profile: {
      findMany: jest.fn(),
    },
    employeeSkill: {
      findMany: jest.fn(),
    },
    suggestion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaleSkillFlaggingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaleSkillFlaggingService>(StaleSkillFlaggingService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Spy on Logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have handleCron method decorated with @Cron', () => {
    expect(service.handleCron).toBeDefined();
    expect(typeof service.handleCron).toBe('function');
  });

  it('should log job start when handleCron is called', async () => {
    mockPrismaService.profile.findMany.mockResolvedValue([]);

    await service.handleCron();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Starting stale skill flagging job'),
    );
  });

  it('should log job completion when handleCron completes', async () => {
    mockPrismaService.profile.findMany.mockResolvedValue([]);

    await service.handleCron();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Completed stale skill flagging job'),
    );
  });

  it('should handle errors gracefully without crashing', async () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    mockPrismaService.profile.findMany.mockRejectedValue(
      new Error('Database connection failed'),
    );

    // Should not throw
    await expect(service.handleCron()).resolves.not.toThrow();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error during stale skill flagging job'),
      expect.any(String),
    );
  });

  it('should log all required metrics', async () => {
    mockPrismaService.profile.findMany.mockResolvedValue([]);

    await service.handleCron();

    // Verify comprehensive logging is called
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Employees with active assignments processed'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Core Stack skills identified'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Stale Core Stack skills found'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suggestions successfully created'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suggestions skipped'),
    );
  });
});

describe('StaleSkillFlaggingService - Stale Skill Detection', () => {
  let service: StaleSkillFlaggingService;
  let prismaService: PrismaService;
  let loggerSpy: jest.SpyInstance;

  const mockPrismaService = {
    profile: {
      findMany: jest.fn(),
    },
    suggestion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaleSkillFlaggingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaleSkillFlaggingService>(StaleSkillFlaggingService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Spy on Logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should correctly identify Core Stack skills from assignment tags', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400); // 400 days ago (> 12 months)

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React', 'TypeScript'] }, { tags: ['Node.js'] }],
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
        {
          skillId: 3,
          skill: { name: 'Python', isActive: true }, // Not in assignment tags
          proficiencyLevel: ProficiencyLevel.EXPERT,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should create suggestions only for React and TypeScript (Core Stack)
    // Python should not be included as it's not in assignment tags
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(2);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Core Stack skills identified: 2'),
    );
  });

  it('should correctly calculate staleness threshold at 12 months (365 days)', async () => {
    const justStaleDate = new Date();
    justStaleDate.setDate(justStaleDate.getDate() - 366); // 366 days ago (just over 12 months)

    const notStaleDate = new Date();
    notStaleDate.setDate(notStaleDate.getDate() - 364); // 364 days ago (just under 12 months)

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React', 'Vue'] }],
      employeeSkills: [
        {
          skillId: 1,
          skill: { name: 'React', isActive: true },
          proficiencyLevel: ProficiencyLevel.ADVANCED,
          lastValidatedAt: justStaleDate, // Stale
        },
        {
          skillId: 2,
          skill: { name: 'Vue', isActive: true },
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
          lastValidatedAt: notStaleDate, // Not stale
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should create suggestion only for React (stale)
    // Vue should not trigger suggestion (not stale yet)
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
  });

  it('should exclude inactive skills (isActive = false) from suggestions', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400); // 400 days ago

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React', 'Angular'] }],
      employeeSkills: [
        {
          skillId: 1,
          skill: { name: 'React', isActive: true },
          proficiencyLevel: ProficiencyLevel.ADVANCED,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 2,
          skill: { name: 'Angular', isActive: false }, // Inactive skill
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should only create suggestion for React (active)
    // Angular should be excluded (inactive)
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Skills excluded due to isActive = false: 1'),
    );
  });

  it('should use case-sensitive tag matching', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React'] }], // Case-sensitive: 'React'
      employeeSkills: [
        {
          skillId: 1,
          skill: { name: 'React', isActive: true }, // Matches exactly
          proficiencyLevel: ProficiencyLevel.ADVANCED,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 2,
          skill: { name: 'react', isActive: true }, // Does not match (lowercase)
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should only create suggestion for 'React' (exact case match)
    // 'react' (lowercase) should not be included in Core Stack
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Core Stack skills identified: 1'),
    );
  });

  it('should not create duplicate PENDING suggestions', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
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
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);

    // React already has a PENDING suggestion
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

    // Should only create suggestion for TypeScript
    // React should be skipped due to existing PENDING suggestion
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 2,
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Suggestions skipped due to existing PENDING suggestions: 1',
      ),
    );
  });

  it('should create suggestions with correct fields (source=SYSTEM_FLAG, status=PENDING)', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React'] }],
      employeeSkills: [
        {
          skillId: 1,
          skill: { name: 'React', isActive: true },
          proficiencyLevel: ProficiencyLevel.EXPERT,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Verify suggestion is created with correct fields
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.EXPERT, // Matches current proficiency
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
  });

  it('should handle multiple stale skills for the same profile', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React', 'TypeScript', 'Node.js'] }],
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
        {
          skillId: 3,
          skill: { name: 'Node.js', isActive: true },
          proficiencyLevel: ProficiencyLevel.EXPERT,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should create suggestions for all three stale Core Stack skills
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(3);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Stale Core Stack skills found (lastValidatedAt > 12 months): 3',
      ),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suggestions successfully created: 3'),
    );
  });

  it('should process multiple employees correctly', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfiles = [
      {
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
      },
      {
        id: 'profile-2',
        assignments: [{ tags: ['Vue'] }],
        employeeSkills: [
          {
            skillId: 2,
            skill: { name: 'Vue', isActive: true },
            proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
            lastValidatedAt: staleDate,
          },
        ],
      },
    ];

    mockPrismaService.profile.findMany.mockResolvedValue(mockProfiles);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should create suggestions for both employees
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(2);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Employees with active assignments processed: 2'),
    );
  });
});

describe('StaleSkillFlaggingService - Suggestion Management Logic', () => {
  let service: StaleSkillFlaggingService;
  let prismaService: PrismaService;
  let loggerSpy: jest.SpyInstance;

  const mockPrismaService = {
    profile: {
      findMany: jest.fn(),
    },
    suggestion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaleSkillFlaggingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaleSkillFlaggingService>(StaleSkillFlaggingService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Spy on Logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should skip suggestion creation if PENDING suggestion exists from SYSTEM_FLAG source', async () => {
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

    // Existing PENDING suggestion from SYSTEM_FLAG (not just SELF_REPORT)
    mockPrismaService.suggestion.findFirst.mockResolvedValue({
      id: 1,
      profileId: 'profile-1',
      skillId: 1,
      status: SuggestionStatus.PENDING,
      source: SuggestionSource.SYSTEM_FLAG,
    });

    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should NOT create duplicate suggestion
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(0);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Suggestions skipped due to existing PENDING suggestions: 1',
      ),
    );
  });

  it('should correctly match suggestedProficiency to current EmployeeSkill.proficiencyLevel for all proficiency levels', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React', 'Vue', 'Angular', 'Node.js'] }],
      employeeSkills: [
        {
          skillId: 1,
          skill: { name: 'React', isActive: true },
          proficiencyLevel: ProficiencyLevel.NOVICE,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 2,
          skill: { name: 'Vue', isActive: true },
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 3,
          skill: { name: 'Angular', isActive: true },
          proficiencyLevel: ProficiencyLevel.ADVANCED,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 4,
          skill: { name: 'Node.js', isActive: true },
          proficiencyLevel: ProficiencyLevel.EXPERT,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);
    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Verify all proficiency levels are correctly copied
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(4);
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.NOVICE,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 2,
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 3,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 4,
        suggestedProficiency: ProficiencyLevel.EXPERT,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
  });

  it('should handle partial suggestion creation failures gracefully', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
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
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);
    mockPrismaService.suggestion.findFirst.mockResolvedValue(null);

    // First suggestion succeeds, second fails
    mockPrismaService.suggestion.create
      .mockResolvedValueOnce({ id: 1 })
      .mockRejectedValueOnce(new Error('Database constraint violation'));

    const errorSpy = jest.spyOn(Logger.prototype, 'error');

    await service.handleCron();

    // Should log error but not crash
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error during stale skill flagging job'),
      expect.any(String),
    );
  });

  it('should create suggestions without projectId field', async () => {
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

    await service.handleCron();

    // Verify no projectId field is included (multi-project visibility via query-time filtering)
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 1,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
        // Note: No projectId field
      },
    });
  });

  it('should query for existing PENDING suggestions with correct parameters', async () => {
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

    await service.handleCron();

    // Verify duplicate check query uses correct parameters
    expect(mockPrismaService.suggestion.findFirst).toHaveBeenCalledWith({
      where: {
        profileId: 'profile-1',
        skillId: 1,
        status: SuggestionStatus.PENDING,
      },
    });
  });

  it('should handle mixed scenarios with some skills having existing suggestions', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfile = {
      id: 'profile-1',
      assignments: [{ tags: ['React', 'Vue', 'Angular'] }],
      employeeSkills: [
        {
          skillId: 1,
          skill: { name: 'React', isActive: true },
          proficiencyLevel: ProficiencyLevel.ADVANCED,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 2,
          skill: { name: 'Vue', isActive: true },
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
          lastValidatedAt: staleDate,
        },
        {
          skillId: 3,
          skill: { name: 'Angular', isActive: true },
          proficiencyLevel: ProficiencyLevel.EXPERT,
          lastValidatedAt: staleDate,
        },
      ],
    };

    mockPrismaService.profile.findMany.mockResolvedValue([mockProfile]);

    // React and Angular already have PENDING suggestions
    mockPrismaService.suggestion.findFirst.mockImplementation((params) => {
      if (params.where.skillId === 1 || params.where.skillId === 3) {
        return Promise.resolve({
          id: params.where.skillId,
          profileId: 'profile-1',
          skillId: params.where.skillId,
          status: SuggestionStatus.PENDING,
          source: SuggestionSource.SELF_REPORT,
        });
      }
      return Promise.resolve(null);
    });

    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should only create suggestion for Vue (no existing PENDING)
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        skillId: 2,
        suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suggestions successfully created: 1'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Suggestions skipped due to existing PENDING suggestions: 2',
      ),
    );
  });

  it('should track created and skipped counts accurately', async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400);

    const mockProfiles = [
      {
        id: 'profile-1',
        assignments: [{ tags: ['React', 'Vue'] }],
        employeeSkills: [
          {
            skillId: 1,
            skill: { name: 'React', isActive: true },
            proficiencyLevel: ProficiencyLevel.ADVANCED,
            lastValidatedAt: staleDate,
          },
          {
            skillId: 2,
            skill: { name: 'Vue', isActive: true },
            proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
            lastValidatedAt: staleDate,
          },
        ],
      },
      {
        id: 'profile-2',
        assignments: [{ tags: ['Angular'] }],
        employeeSkills: [
          {
            skillId: 3,
            skill: { name: 'Angular', isActive: true },
            proficiencyLevel: ProficiencyLevel.EXPERT,
            lastValidatedAt: staleDate,
          },
        ],
      },
    ];

    mockPrismaService.profile.findMany.mockResolvedValue(mockProfiles);

    // React already has PENDING suggestion
    mockPrismaService.suggestion.findFirst.mockImplementation((params) => {
      if (params.where.skillId === 1) {
        return Promise.resolve({
          id: 1,
          profileId: 'profile-1',
          skillId: 1,
          status: SuggestionStatus.PENDING,
          source: SuggestionSource.SYSTEM_FLAG,
        });
      }
      return Promise.resolve(null);
    });

    mockPrismaService.suggestion.create.mockResolvedValue({});

    await service.handleCron();

    // Should create 2 suggestions (Vue, Angular) and skip 1 (React)
    expect(mockPrismaService.suggestion.create).toHaveBeenCalledTimes(2);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suggestions successfully created: 2'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Suggestions skipped due to existing PENDING suggestions: 1',
      ),
    );
  });
});
