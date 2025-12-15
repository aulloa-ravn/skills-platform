import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { Role } from '@prisma/client';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockLoginResult = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    profile: {
      id: 'test-id',
      name: 'Test User',
      email: 'test@ravn.com',
      role: Role.EMPLOYEE,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login mutation', () => {
    it('should return tokens and profile info for valid credentials', async () => {
      const loginInput: LoginInput = {
        email: 'test@ravn.com',
        password: 'validPassword',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResult);

      const result = await resolver.login(loginInput);

      expect(result).toEqual(mockLoginResult);
      expect(authService.login).toHaveBeenCalledWith(
        loginInput.email,
        loginInput.password,
      );
    });

    it('should throw GraphQL error for invalid credentials', async () => {
      const loginInput: LoginInput = {
        email: 'test@ravn.com',
        password: 'wrongPassword',
      };

      const unauthorizedError = new UnauthorizedException({
        message: 'Invalid email or password',
        extensions: {
          code: 'INVALID_CREDENTIALS',
        },
      });

      jest.spyOn(authService, 'login').mockRejectedValue(unauthorizedError);

      await expect(resolver.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );

      try {
        await resolver.login(loginInput);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          message: 'Invalid email or password',
          extensions: {
            code: 'INVALID_CREDENTIALS',
          },
        });
      }
    });

    it('should throw GraphQL error for non-existent email', async () => {
      const loginInput: LoginInput = {
        email: 'nonexistent@ravn.com',
        password: 'anyPassword',
      };

      const unauthorizedError = new UnauthorizedException({
        message: 'Invalid email or password',
        extensions: {
          code: 'INVALID_CREDENTIALS',
        },
      });

      jest.spyOn(authService, 'login').mockRejectedValue(unauthorizedError);

      await expect(resolver.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken mutation', () => {
    it('should return new access token for valid refresh token', async () => {
      const refreshInput: RefreshTokenInput = {
        refreshToken: 'valid-refresh-token',
      };

      jest
        .spyOn(authService, 'refreshAccessToken')
        .mockResolvedValue('new-access-token');

      const result = await resolver.refreshToken(refreshInput);

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        refreshInput.refreshToken,
      );
    });

    it('should throw GraphQL error for invalid refresh token', async () => {
      const refreshInput: RefreshTokenInput = {
        refreshToken: 'invalid-token',
      };

      const unauthorizedError = new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });

      jest
        .spyOn(authService, 'refreshAccessToken')
        .mockRejectedValue(unauthorizedError);

      await expect(resolver.refreshToken(refreshInput)).rejects.toThrow(
        UnauthorizedException,
      );

      try {
        await resolver.refreshToken(refreshInput);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          message: 'Invalid or expired refresh token',
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }
    });

    it('should throw GraphQL error for expired refresh token', async () => {
      const refreshInput: RefreshTokenInput = {
        refreshToken: 'expired-token',
      };

      const unauthorizedError = new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });

      jest
        .spyOn(authService, 'refreshAccessToken')
        .mockRejectedValue(unauthorizedError);

      await expect(resolver.refreshToken(refreshInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
