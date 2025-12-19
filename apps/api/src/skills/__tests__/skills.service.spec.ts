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
      create: jest.fn(),
      update: jest.fn(),
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
  });

  describe('createSkill', () => {
    it('should create a skill successfully', async () => {
      const input = { name: 'React', discipline: Discipline.FRONTEND };
      const expectedSkill = {
        id: '1',
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findFirst.mockResolvedValue(null);
      mockPrismaService.skill.create.mockResolvedValue(expectedSkill);

      const result = await service.createSkill(input);

      expect(result).toEqual(expectedSkill);
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
        id: '1',
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
        id: '1',
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
        id: '1',
        name: 'React Native',
        discipline: Discipline.MOBILE,
      };
      const existingSkill = {
        id: '1',
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

      expect(result).toEqual(updatedSkill);
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'React Native',
          discipline: Discipline.MOBILE,
        },
      });
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      const input = { id: 'non-existent', name: 'React' };

      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(service.updateSkill(input)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('disableSkill', () => {
    it('should disable an active skill successfully', async () => {
      const skillId = '1';
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

      const result = await service.disableSkill(skillId);

      expect(result).toEqual(disabledSkill);
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: skillId },
        data: { isActive: false },
      });
    });

    it('should throw BadRequestException if skill is already disabled', async () => {
      const skillId = '1';
      const disabledSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findUnique.mockResolvedValue(disabledSkill);

      await expect(service.disableSkill(skillId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('enableSkill', () => {
    it('should enable a disabled skill successfully', async () => {
      const skillId = '1';
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

      const result = await service.enableSkill(skillId);

      expect(result).toEqual(enabledSkill);
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: skillId },
        data: { isActive: true },
      });
    });

    it('should throw BadRequestException if skill is already active', async () => {
      const skillId = '1';
      const activeSkill = {
        id: skillId,
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findUnique.mockResolvedValue(activeSkill);

      await expect(service.enableSkill(skillId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
