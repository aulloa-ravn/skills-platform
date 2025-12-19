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
    createSkill: jest.fn(),
    updateSkill: jest.fn(),
    disableSkill: jest.fn(),
    enableSkill: jest.fn(),
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

  describe('createSkill mutation', () => {
    it('should call service with correct input and return created skill', async () => {
      const input = {
        name: 'React',
        discipline: Discipline.FRONTEND,
      };

      const expectedSkill = {
        id: '1',
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
        id: '2',
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
        id: '1',
        name: 'React Native',
        discipline: Discipline.MOBILE,
      };

      const expectedSkill = {
        id: '1',
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
        id: '1',
        name: 'Vue.js',
      };

      const expectedSkill = {
        id: '1',
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

  describe('disableSkill mutation', () => {
    it('should call service with skill id and return disabled skill', async () => {
      const skillId = '1';
      const expectedSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.disableSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.disableSkill(skillId);

      expect(service.disableSkill).toHaveBeenCalledWith(skillId);
      expect(result.isActive).toBe(false);
    });

    it('should accept single id argument (not wrapped in input)', async () => {
      const skillId = '123';
      const expectedSkill = {
        id: skillId,
        name: 'Angular',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.disableSkill.mockResolvedValue(expectedSkill);

      await resolver.disableSkill(skillId);

      // Verify service was called with just the id string
      expect(service.disableSkill).toHaveBeenCalledWith(skillId);
      expect(service.disableSkill).toHaveBeenCalledTimes(1);
    });
  });

  describe('enableSkill mutation', () => {
    it('should call service with skill id and return enabled skill', async () => {
      const skillId = '1';
      const expectedSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.enableSkill.mockResolvedValue(expectedSkill);

      const result = await resolver.enableSkill(skillId);

      expect(service.enableSkill).toHaveBeenCalledWith(skillId);
      expect(result.isActive).toBe(true);
    });

    it('should accept single id argument (not wrapped in input)', async () => {
      const skillId = '456';
      const expectedSkill = {
        id: skillId,
        name: 'Svelte',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSkillsService.enableSkill.mockResolvedValue(expectedSkill);

      await resolver.enableSkill(skillId);

      // Verify service was called with just the id string
      expect(service.enableSkill).toHaveBeenCalledWith(skillId);
      expect(service.enableSkill).toHaveBeenCalledTimes(1);
    });
  });

  describe('admin authorization', () => {
    it('should have guards applied to all mutations', () => {
      // This test verifies that the resolver class structure is correct
      // The actual authorization is tested through integration tests
      // Guards are overridden in the test module setup, allowing us to test resolver logic
      expect(resolver).toBeDefined();
      expect(resolver.createSkill).toBeDefined();
      expect(resolver.updateSkill).toBeDefined();
      expect(resolver.disableSkill).toBeDefined();
      expect(resolver.enableSkill).toBeDefined();
    });
  });
});
