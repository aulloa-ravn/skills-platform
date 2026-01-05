import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from '../skills.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Discipline } from '@prisma/client';

describe('SkillsService - employeeCount', () => {
  let service: SkillsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    skill: {
      findMany: jest.fn(),
    },
    employeeSkill: {
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getEmployeeCounts', () => {
    it('should return correct employee count for each skill', async () => {
      const mockCounts = [
        { skillId: 1, _count: { id: 5 } },
        { skillId: 2, _count: { id: 3 } },
        { skillId: 3, _count: { id: 0 } },
      ];

      mockPrismaService.employeeSkill.groupBy.mockResolvedValue(mockCounts);

      const result = await service.getEmployeeCounts();

      expect(result).toEqual({
        1: 5,
        2: 3,
        3: 0,
      });
      expect(prisma.employeeSkill.groupBy).toHaveBeenCalledWith({
        by: ['skillId'],
        _count: { id: true },
      });
    });

    it('should return zero count for skills with no employees', async () => {
      mockPrismaService.employeeSkill.groupBy.mockResolvedValue([]);

      const result = await service.getEmployeeCounts();

      expect(result).toEqual({});
    });

    it('should handle skills with multiple employees correctly', async () => {
      const mockCounts = [{ skillId: 1, _count: { id: 150 } }];

      mockPrismaService.employeeSkill.groupBy.mockResolvedValue(mockCounts);

      const result = await service.getEmployeeCounts();

      expect(result).toEqual({ 1: 150 });
    });
  });

  describe('getAllSkills with employeeCount', () => {
    it('should include employeeCount in getAllSkills response', async () => {
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

      const mockCounts = [
        { skillId: 1, _count: { id: 10 } },
        { skillId: 2, _count: { id: 5 } },
      ];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);
      mockPrismaService.employeeSkill.groupBy.mockResolvedValue(mockCounts);

      const result = await service.getAllSkills();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('employeeCount', 10);
      expect(result[1]).toHaveProperty('employeeCount', 5);
    });

    it('should set employeeCount to 0 for skills with no employees', async () => {
      const mockSkills = [
        {
          id: 1,
          name: 'New Skill',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);
      mockPrismaService.employeeSkill.groupBy.mockResolvedValue([]);

      const result = await service.getAllSkills();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('employeeCount', 0);
    });

    it('should include employeeCount when filtering by isActive', async () => {
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

      const mockCounts = [{ skillId: 1, _count: { id: 8 } }];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);
      mockPrismaService.employeeSkill.groupBy.mockResolvedValue(mockCounts);

      const result = await service.getAllSkills({ isActive: true });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('employeeCount', 8);
    });

    it('should include employeeCount when filtering by disciplines', async () => {
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

      const mockCounts = [{ skillId: 1, _count: { id: 12 } }];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);
      mockPrismaService.employeeSkill.groupBy.mockResolvedValue(mockCounts);

      const result = await service.getAllSkills({
        disciplines: [Discipline.FRONTEND],
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('employeeCount', 12);
    });

    it('should handle mixed skills with and without employees', async () => {
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
          name: 'Vue',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Angular',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCounts = [
        { skillId: 1, _count: { id: 15 } },
        { skillId: 3, _count: { id: 7 } },
      ];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);
      mockPrismaService.employeeSkill.groupBy.mockResolvedValue(mockCounts);

      const result = await service.getAllSkills();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('employeeCount', 15);
      expect(result[1]).toHaveProperty('employeeCount', 0);
      expect(result[2]).toHaveProperty('employeeCount', 7);
    });
  });
});
