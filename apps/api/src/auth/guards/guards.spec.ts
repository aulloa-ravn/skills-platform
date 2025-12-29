import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { ProfileType, SeniorityLevel } from '@prisma/client';

describe('Guards', () => {
  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [JwtAuthGuard, Reflector],
      }).compile();

      guard = module.get<JwtAuthGuard>(JwtAuthGuard);
      reflector = module.get<Reflector>(Reflector);
    });

    it('should allow access to public routes', () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [RolesGuard, Reflector],
      }).compile();

      guard = module.get<RolesGuard>(RolesGuard);
      reflector = module.get<Reflector>(Reflector);
    });

    const createMockContext = (user: any = null): ExecutionContext => ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn().mockReturnValue('graphql'),
      getArgs: jest.fn().mockReturnValue([
        {}, // root
        {}, // args
        {   // context
          req: user ? { user } : {},
        },
        {}, // info
      ]),
      switchToRpc: jest.fn(),
      switchToHttp: jest.fn(),
      switchToWs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext);

    it('should allow access when user has required role', () => {
      const mockContext = createMockContext({
        id: 'test',
        email: 'test@ravn.com',
        type: ProfileType.ADMIN,
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProfileType.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw FORBIDDEN error when user lacks required role', () => {
      const mockContext = createMockContext({
        id: 'test',
        email: 'test@ravn.com',
        type: ProfileType.EMPLOYEE,
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProfileType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);

      try {
        guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.response).toEqual({
          message: 'User does not have required role(s): ADMIN',
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }
    });

    it('should allow access when no roles are required', () => {
      const mockContext = createMockContext({
        id: 'test',
        email: 'test@ravn.com',
        type: ProfileType.EMPLOYEE,
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw FORBIDDEN error when user is not authenticated', () => {
      const mockContext = createMockContext(null);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ProfileType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);

      try {
        guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.response).toEqual({
          message: 'User not authenticated',
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }
    });
  });
});
