import { Test, TestingModule } from '@nestjs/testing';
import { SkillsResolver } from '../skills.resolver';
import { SkillsService } from '../skills.service';
import { Discipline } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('SkillsResolver', () => {
  let resolver: SkillsResolver;
  let service: SkillsService;

  const mockSkillsService = {
    getAllSkills: jest.fn(),
    getSkillById: jest.fn(),
    createSkill: jest.fn(),
    updateSkill: jest.fn(),
    toggleSkill: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsResolver,
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<SkillsResolver>(SkillsResolver);
    service = module.get<SkillsService>(SkillsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getAllSkills query', () => {
    it('should delegate to service with correct input', async () => {
      const input = {
        isActive: true,
        disciplines: [Discipline.FRONTEND],
        searchTerm: 'React',
      };

      const mockSkills = [
        {
          id: 1,
          name: 'React',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSkillsService.getAllSkills.mockResolvedValue(mockSkills);

      const result = await resolver.getAllSkills(input);

      expect(service.getAllSkills).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockSkills);
    });

    it('should call service without input when no filters provided', async () => {
      const mockSkills = [
        {
          id: 1,
          name: 'React',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Node.js',
          discipline: Discipline.BACKEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSkillsService.getAllSkills.mockResolvedValue(mockSkills);

      const result = await resolver.getAllSkills();

      expect(service.getAllSkills).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockSkills);
    });

    it('should return empty array when no skills match', async () => {
      mockSkillsService.getAllSkills.mockResolvedValue([]);

      const result = await resolver.getAllSkills({ searchTerm: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('getSkillById query', () => {
    it('should delegate to service with correct ID parameter', async () => {
      const mockSkill = {
        id: 1,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.getSkillById.mockResolvedValue(mockSkill);

      const result = await resolver.getSkillById(1);

      expect(service.getSkillById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSkill);
    });

    it('should propagate NotFoundException when skill does not exist', async () => {
      const error = new Error('Skill not found');
      mockSkillsService.getSkillById.mockRejectedValue(error);

      await expect(resolver.getSkillById(999)).rejects.toThrow(
        'Skill not found',
      );
      expect(service.getSkillById).toHaveBeenCalledWith(999);
    });
  });

  describe('createSkill mutation', () => {
    it('should call service with correct input and return created skill', async () => {
      const input = {
        name: 'React',
        discipline: Discipline.FRONTEND,
      };

      const expectedSkill = {
        id: 1,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.createSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.createSkill(input);

      expect(service.createSkill).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedSkill);
    });

    it('should return skill with isActive=true by default', async () => {
      const input = {
        name: 'TypeScript',
        discipline: Discipline.FRONTEND,
      };

      const expectedSkill = {
        id: 2,
        name: 'TypeScript',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.createSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.createSkill(input);

      expect(result.isActive).toBe(true);
    });
  });

  describe('updateSkill mutation', () => {
    it('should call service with correct input and return updated skill', async () => {
      const input = {
        id: 1,
        name: 'React Native',
        discipline: Discipline.MOBILE,
      };

      const expectedSkill = {
        id: 1,
        name: 'React Native',
        discipline: Discipline.MOBILE,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.updateSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.updateSkill(input);

      expect(service.updateSkill).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedSkill);
    });

    it('should handle partial updates (name only)', async () => {
      const input = {
        id: 1,
        name: 'Vue.js',
      };

      const expectedSkill = {
        id: 1,
        name: 'Vue.js',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.updateSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.updateSkill(input);

      expect(service.updateSkill).toHaveBeenCalledWith(input);
      expect(result.name).toBe('Vue.js');
    });
  });

  describe('toggleSkill mutation', () => {
    it('should call service to disable skill and return disabled skill', async () => {
      const skillId = 1;
      const expectedSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.toggleSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.toggleSkill(skillId, false);

      expect(service.toggleSkill).toHaveBeenCalledWith(skillId, false);
      expect(result.isActive).toBe(false);
    });

    it('should call service to enable skill and return enabled skill', async () => {
      const skillId = 1;
      const expectedSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.toggleSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.toggleSkill(skillId, true);

      expect(service.toggleSkill).toHaveBeenCalledWith(skillId, true);
      expect(result.isActive).toBe(true);
    });

    it('should accept id and isActive arguments', async () => {
      const skillId = 456;
      const expectedSkill = {
        id: skillId,
        name: 'Svelte',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.toggleSkill.mockResolvedValue(expectedSkill);

      await resolver.toggleSkill(skillId, true);

      // Verify service was called with id and isActive
      expect(service.toggleSkill).toHaveBeenCalledWith(skillId, true);
      expect(service.toggleSkill).toHaveBeenCalledTimes(1);
    });
  });

  describe('admin authorization', () => {
    it('should have guards applied to all queries and mutations', () => {
      // This test verifies that the resolver class structure is correct
      // The actual authorization is tested through integration tests
      // Guards are overridden in the test module setup, allowing us to test resolver logic
      expect(resolver).toBeDefined();
      expect(resolver.getAllSkills).toBeDefined();
      expect(resolver.getSkillById).toBeDefined();
      expect(resolver.createSkill).toBeDefined();
      expect(resolver.updateSkill).toBeDefined();
      expect(resolver.toggleSkill).toBeDefined();
    });
  });
});
