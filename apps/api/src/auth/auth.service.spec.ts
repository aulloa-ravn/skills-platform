import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from './utils/password.util';
import { ProfileType, SeniorityLevel } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockProfile = {
    id: 'test-profile-id',
    email: 'test@ravn.com',
    name: 'Test User',
    password: '',
    type: ProfileType.EMPLOYEE,
    missionBoardId: 'mb-123',
    avatarUrl: null,
    currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return profile for valid credentials', async () => {
      const password = 'validPassword';
      const hashedPassword = await hashPassword(password);
      const profileWithPassword = { ...mockProfile, password: hashedPassword };

      jest
        .spyOn(prisma.profile, 'findUnique')
        .mockResolvedValue(profileWithPassword);

      const result = await service.validateUser(mockProfile.email, password);

      expect(result).toEqual(profileWithPassword);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { email: mockProfile.email },
      });
    });

    it('should return null for invalid password', async () => {
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await hashPassword(correctPassword);
      const profileWithPassword = { ...mockProfile, password: hashedPassword };

      jest
        .spyOn(prisma.profile, 'findUnique')
        .mockResolvedValue(profileWithPassword);

      const result = await service.validateUser(
        mockProfile.email,
        wrongPassword,
      );

      expect(result).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@ravn.com',
        'anyPassword',
      );

      expect(result).toBeNull();
    });

    it('should return null for profile without password', async () => {
      const profileWithoutPassword = { ...mockProfile, password: null };

      jest
        .spyOn(prisma.profile, 'findUnique')
        .mockResolvedValue(profileWithoutPassword);

      const result = await service.validateUser(
        mockProfile.email,
        'anyPassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and profile info for valid credentials', async () => {
      const password = 'validPassword';
      const hashedPassword = await hashPassword(password);
      const profileWithPassword = { ...mockProfile, password: hashedPassword };

      jest
        .spyOn(prisma.profile, 'findUnique')
        .mockResolvedValue(profileWithPassword);
      jest.spyOn(prisma.project, 'count').mockResolvedValue(0); // No tech lead projects
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      const result = await service.login(mockProfile.email, password);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        profile: {
          id: mockProfile.id,
          name: mockProfile.name,
          email: mockProfile.email,
          type: ProfileType.EMPLOYEE, // Should be EMPLOYEE (no tech lead projects)
        },
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockProfile.id,
          email: mockProfile.email,
          type: ProfileType.EMPLOYEE,
        },
        { expiresIn: '15m' },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockProfile.id,
          email: mockProfile.email,
          type: ProfileType.EMPLOYEE,
        },
        { expiresIn: '7d' },
      );
    });

    it('should throw UnauthorizedException with INVALID_CREDENTIALS for invalid password', async () => {
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await hashPassword(correctPassword);
      const profileWithPassword = { ...mockProfile, password: hashedPassword };

      jest
        .spyOn(prisma.profile, 'findUnique')
        .mockResolvedValue(profileWithPassword);

      await expect(
        service.login(mockProfile.email, wrongPassword),
      ).rejects.toThrow(UnauthorizedException);

      try {
        await service.login(mockProfile.email, wrongPassword);
      } catch (error) {
        expect(error.response).toEqual({
          message: 'Invalid email or password',
          extensions: {
            code: 'INVALID_CREDENTIALS',
          },
        });
      }
    });

    it('should throw UnauthorizedException with INVALID_CREDENTIALS for non-existent email', async () => {
      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login('nonexistent@ravn.com', 'anyPassword'),
      ).rejects.toThrow(UnauthorizedException);

      try {
        await service.login('nonexistent@ravn.com', 'anyPassword');
      } catch (error) {
        expect(error.response).toEqual({
          message: 'Invalid email or password',
          extensions: {
            code: 'INVALID_CREDENTIALS',
          },
        });
      }
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const mockPayload = {
        sub: mockProfile.id,
        email: mockProfile.email,
        role: mockProfile.type,
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-access-token');

      const result = await service.refreshAccessToken('valid-refresh-token');

      expect(result).toBe('new-access-token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
        expiresIn: '15m',
      });
    });

    it('should throw UnauthorizedException with UNAUTHORIZED for invalid refresh token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );

      try {
        await service.refreshAccessToken('invalid-token');
      } catch (error) {
        expect(error.response).toEqual({
          message: 'Invalid or expired refresh token',
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }
    });

    it('should throw UnauthorizedException with UNAUTHORIZED for expired refresh token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshAccessToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
