import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { comparePassword } from './utils/password.util';
import { Profile, Role } from '@prisma/client';

interface JwtPayload {
  sub: string; // Profile ID
  email: string;
  role: Role;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  profile: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Get computed role for a user based on their profile and project assignments
   * @param profileId Profile ID
   * @param currentRole Current role from database
   * @returns Computed role (ADMIN, TECH_LEAD, or EMPLOYEE)
   */
  async getRoleForUser(profileId: string, currentRole: Role): Promise<Role> {
    // ADMIN role takes precedence over computed roles
    if (currentRole === Role.ADMIN) {
      return Role.ADMIN;
    }

    // Check if user is tech lead on any project
    const techLeadProjects = await this.prisma.project.count({
      where: {
        techLeadId: profileId,
      },
    });

    // If user is tech lead on at least one project, assign TECH_LEAD role
    if (techLeadProjects > 0) {
      return Role.TECH_LEAD;
    }

    // Default to EMPLOYEE role
    return Role.EMPLOYEE;
  }

  /**
   * Validate user credentials
   * @param email User email
   * @param password Plain text password
   * @returns Profile if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (!profile || !profile.password) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, profile.password);

    if (!isPasswordValid) {
      return null;
    }

    return profile;
  }

  /**
   * Generate access and refresh tokens
   * @param profile User profile with computed role
   * @returns Access and refresh tokens
   */
  private generateTokens(profile: Profile) {
    const payload: JwtPayload = {
      sub: profile.id,
      email: profile.email,
      role: profile.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // 15 minutes
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 days
    });

    return { accessToken, refreshToken };
  }

  /**
   * Login user with email and password
   * @param email User email
   * @param password Plain text password
   * @returns Login result with tokens and profile info (with computed role)
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const profile = await this.validateUser(email, password);

    if (!profile) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        extensions: {
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Compute role based on project assignments
    const computedRole = await this.getRoleForUser(profile.id, profile.role);

    // Create profile with computed role for token generation
    const profileWithComputedRole = {
      ...profile,
      role: computedRole,
    };

    const tokens = this.generateTokens(profileWithComputedRole);

    return {
      ...tokens,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: computedRole, // Return computed role
      },
    };
  }

  /**
   * Refresh access token using refresh token
   * Note: Refresh token keeps the role from original token.
   * For real-time role updates, user should re-login.
   * @param refreshToken Refresh token
   * @returns New access token
   * @throws UnauthorizedException if refresh token is invalid
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Generate new access token with same payload
      // Note: Role is NOT recomputed on refresh for performance
      // Users will get updated roles on next login
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });
    }
  }
}
