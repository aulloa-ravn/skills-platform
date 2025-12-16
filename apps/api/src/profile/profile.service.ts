import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  ProfileResponse,
  SkillsTiersResponse,
  ValidatedSkillResponse,
  PendingSkillResponse,
  SeniorityHistoryResponse,
  CurrentAssignmentResponse,
  ValidatorInfo,
  TechLeadInfo,
} from './dto/profile.response';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user is authorized to view the requested profile
   * @param userId Authenticated user's ID
   * @param userRole Authenticated user's role
   * @param requestedProfileId Profile ID being requested
   * @throws ForbiddenException if user is not authorized
   */
  private async checkAuthorization(
    userId: string,
    userRole: Role,
    requestedProfileId: string,
  ): Promise<void> {
    // ADMIN: Can access any profile
    if (userRole === Role.ADMIN) {
      return;
    }

    // EMPLOYEE: Can only access own profile
    if (userRole === Role.EMPLOYEE) {
      if (userId !== requestedProfileId) {
        throw new ForbiddenException({
          message: 'You do not have permission to view this profile',
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }
      return;
    }

    // TECH_LEAD: Can access profiles of employees in projects they lead
    if (userRole === Role.TECH_LEAD) {
      // Allow tech leads to view their own profile
      if (userId === requestedProfileId) {
        return;
      }

      // Check if requested profile has assignments in projects led by this user
      const assignment = await this.prisma.assignment.findFirst({
        where: {
          profileId: requestedProfileId,
          project: {
            techLeadId: userId,
          },
        },
      });

      if (!assignment) {
        throw new ForbiddenException({
          message: 'You do not have permission to view this profile',
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }
    }
  }

  /**
   * Get skills organized into three tiers: Core Stack, Validated Inventory, and Pending
   * @param profileId Profile ID
   * @returns Skills tiers response
   */
  private async getSkillsTiers(
    profileId: string,
  ): Promise<SkillsTiersResponse> {
    // Fetch current assignments and extract tags
    const assignments = await this.prisma.assignment.findMany({
      where: { profileId },
      select: { tags: true },
    });

    // Create Set of all tags from current assignments for O(1) lookup
    const assignmentTags = new Set<string>();
    assignments.forEach((assignment) => {
      assignment.tags.forEach((tag) => assignmentTags.add(tag));
    });

    // Fetch validated skills with relations
    const employeeSkills = await this.prisma.employeeSkill.findMany({
      where: { profileId },
      include: {
        skill: true,
        validatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Partition validated skills into Core Stack and Validated Inventory
    const coreStack: ValidatedSkillResponse[] = [];
    const validatedInventory: ValidatedSkillResponse[] = [];

    employeeSkills.forEach((empSkill) => {
      const validatedSkillResponse: ValidatedSkillResponse = {
        skillName: empSkill.skill.name,
        discipline: empSkill.skill.discipline,
        proficiencyLevel: empSkill.proficiencyLevel,
        validatedAt: empSkill.validatedAt,
        validator: empSkill.validatedBy
          ? {
              id: empSkill.validatedBy.id,
              name: empSkill.validatedBy.name,
            }
          : undefined,
      };

      // Check if skill name matches any assignment tag (Core Stack)
      if (assignmentTags.has(empSkill.skill.name)) {
        coreStack.push(validatedSkillResponse);
      } else {
        validatedInventory.push(validatedSkillResponse);
      }
    });

    // Fetch pending suggestions
    const suggestions = await this.prisma.suggestion.findMany({
      where: {
        profileId,
        status: 'PENDING',
      },
      include: {
        skill: true,
      },
    });

    const pending: PendingSkillResponse[] = suggestions.map((suggestion) => ({
      skillName: suggestion.skill.name,
      discipline: suggestion.skill.discipline,
      suggestedProficiency: suggestion.suggestedProficiency,
      createdAt: suggestion.createdAt,
    }));

    return {
      coreStack,
      validatedInventory,
      pending,
    };
  }

  /**
   * Get seniority history sorted by start date descending
   * @param profileId Profile ID
   * @returns Array of seniority history records
   */
  private async getSeniorityHistory(
    profileId: string,
  ): Promise<SeniorityHistoryResponse[]> {
    const history = await this.prisma.seniorityHistory.findMany({
      where: { profileId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        start_date: 'desc',
      },
    });

    return history.map((record) => ({
      seniorityLevel: record.seniorityLevel,
      start_date: record.start_date,
      end_date: record.end_date || undefined,
      createdBy: record.createdBy
        ? {
            id: record.createdBy.id,
            name: record.createdBy.name,
          }
        : undefined,
    }));
  }

  /**
   * Get current assignments with tech lead information
   * @param profileId Profile ID
   * @returns Array of current assignments
   */
  private async getCurrentAssignments(
    profileId: string,
  ): Promise<CurrentAssignmentResponse[]> {
    const assignments = await this.prisma.assignment.findMany({
      where: { profileId },
      include: {
        project: {
          include: {
            techLead: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return assignments.map((assignment) => ({
      projectName: assignment.project.name,
      role: assignment.role,
      tags: assignment.tags,
      techLead: assignment.project.techLead
        ? {
            id: assignment.project.techLead.id,
            name: assignment.project.techLead.name,
            email: assignment.project.techLead.email,
          }
        : undefined,
    }));
  }

  /**
   * Get comprehensive profile data including skills, seniority history, and assignments
   * @param userId Authenticated user's ID
   * @param userRole Authenticated user's role
   * @param profileId Profile ID to retrieve
   * @returns Complete profile response
   * @throws NotFoundException if profile not found
   * @throws ForbiddenException if user not authorized
   */
  async getProfile(
    userId: string,
    userRole: Role,
    profileId: string,
  ): Promise<ProfileResponse> {
    // Check if profile exists
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        name: true,
        email: true,
        currentSeniorityLevel: true,
        avatarUrl: true,
      },
    });

    if (!profile) {
      throw new NotFoundException({
        message: 'Profile not found',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    }

    // Check authorization
    await this.checkAuthorization(userId, userRole, profileId);

    // Fetch all related data
    const [skills, seniorityHistory, currentAssignments] = await Promise.all([
      this.getSkillsTiers(profileId),
      this.getSeniorityHistory(profileId),
      this.getCurrentAssignments(profileId),
    ]);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      currentSeniorityLevel: profile.currentSeniorityLevel,
      avatarUrl: profile.avatarUrl || undefined,
      skills,
      seniorityHistory,
      currentAssignments,
    };
  }
}
