import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SkillsService } from '../skills.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Discipline } from '@prisma/client';

describe('SkillsService', () => {
  let service: SkillsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    skill: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set default mock for employeeSkill.groupBy (returns empty array = no employees)
    mockPrismaService.employeeSkill.groupBy.mockResolvedValue([]);
  });

  describe('getAllSkills', () => {
    it('should return skills sorted alphabetically by name', async () => {
      const mockSkills = [
        {
          id: 1,
          name: 'Angular',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'React',
          discipline: Discipline.FRONTEND,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

      const result = await service.getAllSkills();

      expect(result).toEqual(mockSkills.map(skill => ({ ...skill, employeeCount: 0 })));
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by isActive status when true', async () => {
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

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

      const result = await service.getAllSkills({ isActive: true });

      expect(result).toEqual(mockSkills.map(skill => ({ ...skill, employeeCount: 0 })));
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by isActive status when false', async () => {
      const mockSkills = [
        {
          id: 1,
          name: 'Angular',
          discipline: Discipline.FRONTEND,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

      const result = await service.getAllSkills({ isActive: false });

      expect(result).toEqual(mockSkills.map(skill => ({ ...skill, employeeCount: 0 })));
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { isActive: false },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by multiple disciplines using IN operator', async () => {
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

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

      const result = await service.getAllSkills({
        disciplines: [Discipline.FRONTEND, Discipline.BACKEND],
      });

      expect(result).toEqual(mockSkills.map(skill => ({ ...skill, employeeCount: 0 })));
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: {
          discipline: { in: [Discipline.FRONTEND, Discipline.BACKEND] },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by searchTerm with case-insensitive partial match', async () => {
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

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

      const result = await service.getAllSkills({ searchTerm: 'react' });

      expect(result).toEqual(mockSkills.map(skill => ({ ...skill, employeeCount: 0 })));
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'react', mode: 'insensitive' },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should combine multiple filters using AND logic', async () => {
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

      mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

      const result = await service.getAllSkills({
        isActive: true,
        disciplines: [Discipline.FRONTEND],
        searchTerm: 'react',
      });

      expect(result).toEqual(mockSkills.map(skill => ({ ...skill, employeeCount: 0 })));
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          discipline: { in: [Discipline.FRONTEND] },
          name: { contains: 'react', mode: 'insensitive' },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no skills match filters', async () => {
      mockPrismaService.skill.findMany.mockResolvedValue([]);

      const result = await service.getAllSkills({ searchTerm: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('getSkillById', () => {
    it('should return skill when found', async () => {
      const mockSkill = {
        id: 1,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findUnique.mockResolvedValue(mockSkill);

      const result = await service.getSkillById(1);

      expect(result).toEqual({ ...mockSkill, employeeCount: 0 });
      expect(prisma.skill.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException with code NOT_FOUND when skill does not exist', async () => {
      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(service.getSkillById(999)).rejects.toThrow(
        NotFoundException,
      );

      try {
        await service.getSkillById(999);
      } catch (error) {
        expect(error.response.extensions.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('createSkill', () => {
    it('should create a skill successfully', async () => {
      const input = { name: 'React', discipline: Discipline.FRONTEND };
      const expectedSkill = {
        id: 1,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findFirst.mockResolvedValue(null);
      mockPrismaService.skill.create.mockResolvedValue(expectedSkill);

      const result = await service.createSkill(input);

      expect(result).toEqual({ ...expectedSkill, employeeCount: 0 });
      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: {
          name: 'React',
          discipline: Discipline.FRONTEND,
          isActive: true,
        },
      });
    });

    it('should throw BadRequestException for duplicate name (case-insensitive)', async () => {
      const input = { name: 'React', discipline: Discipline.FRONTEND };
      const existingSkill = {
        id: 1,
        name: 'react',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findFirst.mockResolvedValue(existingSkill);

      await expect(service.createSkill(input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should trim whitespace from skill name', async () => {
      const input = { name: '  React  ', discipline: Discipline.FRONTEND };
      const expectedSkill = {
        id: 1,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findFirst.mockResolvedValue(null);
      mockPrismaService.skill.create.mockResolvedValue(expectedSkill);

      await service.createSkill(input);

      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: {
          name: 'React',
          discipline: Discipline.FRONTEND,
          isActive: true,
        },
      });
    });
  });

  describe('updateSkill', () => {
    it('should update a skill successfully', async () => {
      const input = {
        id: 1,
        name: 'React Native',
        discipline: Discipline.MOBILE,
      };
      const existingSkill = {
        id: 1,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedSkill = { ...existingSkill, ...input };

      mockPrismaService.skill.findUnique.mockResolvedValue(existingSkill);
      mockPrismaService.skill.findFirst.mockResolvedValue(null);
      mockPrismaService.skill.update.mockResolvedValue(updatedSkill);

      const result = await service.updateSkill(input);

      expect(result).toEqual({ ...updatedSkill, employeeCount: 0 });
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'React Native',
          discipline: Discipline.MOBILE,
        },
      });
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      const input = { id: 999, name: 'React' };

      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(service.updateSkill(input)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleSkill', () => {
    it('should disable an active skill successfully', async () => {
      const skillId = 1;
      const activeSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const disabledSkill = { ...activeSkill, isActive: false };

      mockPrismaService.skill.findUnique.mockResolvedValue(activeSkill);
      mockPrismaService.skill.update.mockResolvedValue(disabledSkill);

      const result = await service.toggleSkill(skillId, false);

      expect(result).toEqual({ ...disabledSkill, employeeCount: 0 });
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: skillId },
        data: { isActive: false },
      });
    });

    it('should enable a disabled skill successfully', async () => {
      const skillId = 1;
      const disabledSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const enabledSkill = { ...disabledSkill, isActive: true };

      mockPrismaService.skill.findUnique.mockResolvedValue(disabledSkill);
      mockPrismaService.skill.update.mockResolvedValue(enabledSkill);

      const result = await service.toggleSkill(skillId, true);

      expect(result).toEqual({ ...enabledSkill, employeeCount: 0 });
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: skillId },
        data: { isActive: true },
      });
    });

    it('should throw BadRequestException if trying to disable already disabled skill', async () => {
      const skillId = 1;
      const disabledSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findUnique.mockResolvedValue(disabledSkill);

      await expect(service.toggleSkill(skillId, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if trying to enable already active skill', async () => {
      const skillId = 1;
      const activeSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findUnique.mockResolvedValue(activeSkill);

      await expect(service.toggleSkill(skillId, true)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
