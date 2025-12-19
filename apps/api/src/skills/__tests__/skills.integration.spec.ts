import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SkillsService } from '../skills.service';
import { SkillsResolver } from '../skills.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import { Discipline } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('Skills Integration Tests', () => {
  let resolver: SkillsResolver;
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
        SkillsResolver,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('Full create workflow', () => {
    it('should create skill through resolver and service with trimmed name', async () => {
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

      const result = await resolver.createSkill(input);

      expect(result.name).toBe('React');
      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: {
          name: 'React',
          discipline: Discipline.FRONTEND,
          isActive: true,
        },
      });
    });

    it('should prevent creating skill with duplicate name of disabled skill', async () => {
      const input = { name: 'React', discipline: Discipline.FRONTEND };
      const disabledSkill = {
        id: '1',
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findFirst.mockResolvedValue(disabledSkill);

      await expect(resolver.createSkill(input)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.skill.create).not.toHaveBeenCalled();
    });
  });

  describe('Full update workflow', () => {
    it('should update skill through resolver and service with name uniqueness check', async () => {
      const input = {
        id: '1',
        name: 'Vue.js',
        discipline: Discipline.FRONTEND,
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

      const result = await resolver.updateSkill(input);

      expect(result.name).toBe('Vue.js');
      expect(prisma.skill.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: 'vue.js',
            mode: 'insensitive',
          },
          id: {
            not: '1',
          },
        },
      });
    });

    it('should prevent updating skill name to match another existing skill', async () => {
      const input = { id: '1', name: 'Angular' };
      const existingSkill = {
        id: '1',
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const duplicateSkill = {
        id: '2',
        name: 'Angular',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.skill.findUnique.mockResolvedValue(existingSkill);
      mockPrismaService.skill.findFirst.mockResolvedValue(duplicateSkill);

      await expect(resolver.updateSkill(input)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.skill.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent skill', async () => {
      const input = { id: 'non-existent', name: 'React' };

      mockPrismaService.skill.findUnique.mockResolvedValue(null);

      await expect(resolver.updateSkill(input)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.skill.update).not.toHaveBeenCalled();
    });

    it('should handle partial update with discipline only', async () => {
      const input = { id: '1', discipline: Discipline.MOBILE };
      const existingSkill = {
        id: '1',
        name: 'React',
        discipline: Discipline.FRONTEND,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedSkill = { ...existingSkill, discipline: Discipline.MOBILE };

      mockPrismaService.skill.findUnique.mockResolvedValue(existingSkill);
      mockPrismaService.skill.update.mockResolvedValue(updatedSkill);

      const result = await resolver.updateSkill(input);

      expect(result.discipline).toBe(Discipline.MOBILE);
      expect(result.name).toBe('React');
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { discipline: Discipline.MOBILE },
      });
    });
  });

  describe('Full disable workflow', () => {
    it('should disable active skill through resolver and service', async () => {
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

      const result = await resolver.disableSkill(skillId);

      expect(result.isActive).toBe(false);
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: skillId },
        data: { isActive: false },
      });
    });

    it('should prevent disabling already disabled skill', async () => {
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

      await expect(resolver.disableSkill(skillId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.skill.update).not.toHaveBeenCalled();
    });
  });

  describe('Full enable workflow', () => {
    it('should enable disabled skill through resolver and service', async () => {
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

      const result = await resolver.enableSkill(skillId);

      expect(result.isActive).toBe(true);
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: skillId },
        data: { isActive: true },
      });
    });

    it('should prevent enabling already active skill', async () => {
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

      await expect(resolver.enableSkill(skillId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.skill.update).not.toHaveBeenCalled();
    });
  });
});
