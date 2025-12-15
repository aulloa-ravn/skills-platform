import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('Role Derivation', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
            },
            project: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getRoleForUser', () => {
    it('should return TECH_LEAD for user who is techLead on at least one project', async () => {
      jest.spyOn(prisma.project, 'count').mockResolvedValue(2);

      const result = await service.getRoleForUser('test-id', Role.EMPLOYEE);

      expect(result).toBe(Role.TECH_LEAD);
      expect(prisma.project.count).toHaveBeenCalledWith({
        where: {
          techLeadId: 'test-id',
        },
      });
    });

    it('should return EMPLOYEE for user with no techLead assignments', async () => {
      jest.spyOn(prisma.project, 'count').mockResolvedValue(0);

      const result = await service.getRoleForUser('test-id', Role.EMPLOYEE);

      expect(result).toBe(Role.EMPLOYEE);
    });

    it('should return ADMIN role regardless of project assignments', async () => {
      // Admin should not trigger project count check
      const result = await service.getRoleForUser('admin-id', Role.ADMIN);

      expect(result).toBe(Role.ADMIN);
      expect(prisma.project.count).not.toHaveBeenCalled();
    });

    it('should prioritize ADMIN over computed TECH_LEAD role', async () => {
      // Even if user is tech lead on projects, ADMIN should take precedence
      const result = await service.getRoleForUser('admin-id', Role.ADMIN);

      expect(result).toBe(Role.ADMIN);
      expect(prisma.project.count).not.toHaveBeenCalled();
    });

    it('should compute role dynamically based on current project assignments', async () => {
      // First call: user has projects
      jest.spyOn(prisma.project, 'count').mockResolvedValueOnce(1);
      const result1 = await service.getRoleForUser('test-id', Role.EMPLOYEE);
      expect(result1).toBe(Role.TECH_LEAD);

      // Second call: user has no projects (simulating assignment change)
      jest.spyOn(prisma.project, 'count').mockResolvedValueOnce(0);
      const result2 = await service.getRoleForUser('test-id', Role.EMPLOYEE);
      expect(result2).toBe(Role.EMPLOYEE);
    });
  });
});
