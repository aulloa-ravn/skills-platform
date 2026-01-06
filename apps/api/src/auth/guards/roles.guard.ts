import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ProfileType } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ProfileType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      throw new ForbiddenException({
        message: 'User not authenticated',
        extensions: {
          code: 'FORBIDDEN',
        },
      });
    }

    const hasRole = requiredRoles.includes(user.type);

    if (!hasRole) {
      throw new ForbiddenException({
        message: `User does not have required role(s): ${requiredRoles.join(', ')}`,
        extensions: {
          code: 'FORBIDDEN',
        },
      });
    }

    return true;
  }
}
