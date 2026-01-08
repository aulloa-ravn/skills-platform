import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileType } from '@prisma/client';
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
import {
  GetAllProfilesForAdminInput,
  ProfileSortField,
  SortDirection,
  YearsInCompanyRange,
} from './dto/get-all-profiles-for-admin.input';
import {
  PaginatedProfilesResponse,
  ProfileListItemResponse,
} from './dto/get-all-profiles-for-admin.response';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user is authorized to view the requested profile
   * @param userId Authenticated user's ID
   * @param userType Authenticated user's type
   * @param requestedProfileId Profile ID being requested
   * @throws ForbiddenException if user is not authorized
   */
  private async checkAuthorization(
    userId: string,
    userType: ProfileType,
    requestedProfileId: string,
  ): Promise<void> {
    // ADMIN: Can access any profile
    if (userType === ProfileType.ADMIN) {
      return;
    }

    // EMPLOYEE: Can only access own profile
    if (userType === ProfileType.EMPLOYEE) {
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
    if (userType === ProfileType.TECH_LEAD) {
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
        validatedAt: empSkill.lastValidatedAt,
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
      orderBy: {
        startDate: 'asc',
      },
    });

    return history.map((record) => ({
      seniorityLevel: record.seniorityLevel,
      startDate: record.startDate,
      endDate: record.endDate || undefined,
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
                avatarUrl: true,
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
            avatarUrl: assignment.project.techLead.avatarUrl || undefined,
          }
        : undefined,
    }));
  }

  /**
   * Get comprehensive profile data including skills, seniority history, and assignments
   * @param userId Authenticated user's ID
   * @param userType Authenticated user's type
   * @param profileId Profile ID to retrieve
   * @returns Complete profile response
   * @throws NotFoundException if profile not found
   * @throws ForbiddenException if user not authorized
   */
  async getProfile(
    userId: string,
    userType: ProfileType,
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
    await this.checkAuthorization(userId, userType, profileId);

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

  /**
   * Calculate date ranges for years in company filter
   * @param range YearsInCompanyRange enum value
   * @returns Object with gte and lt date values
   */
  private calculateYearsInCompanyDateRange(
    range: YearsInCompanyRange,
  ): { gte?: Date; lt?: Date } {
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );
    const twoYearsAgo = new Date(
      now.getFullYear() - 2,
      now.getMonth(),
      now.getDate(),
    );
    const threeYearsAgo = new Date(
      now.getFullYear() - 3,
      now.getMonth(),
      now.getDate(),
    );
    const fiveYearsAgo = new Date(
      now.getFullYear() - 5,
      now.getMonth(),
      now.getDate(),
    );

    switch (range) {
      case YearsInCompanyRange.LESS_THAN_1:
        return { gte: oneYearAgo };
      case YearsInCompanyRange.ONE_TO_TWO:
        return { gte: twoYearsAgo, lt: oneYearAgo };
      case YearsInCompanyRange.TWO_TO_THREE:
        return { gte: threeYearsAgo, lt: twoYearsAgo };
      case YearsInCompanyRange.THREE_TO_FIVE:
        return { gte: fiveYearsAgo, lt: threeYearsAgo };
      case YearsInCompanyRange.FIVE_PLUS:
        return { lt: fiveYearsAgo };
      default:
        return {};
    }
  }

  /**
   * Get all profiles for admin with filtering, sorting, and pagination
   * @param input Filter, sort, and pagination parameters
   * @param userId Authenticated user's ID
   * @returns Paginated profiles response
   * @throws ForbiddenException if user is not ADMIN
   */
  async getAllProfilesForAdmin(
    input: GetAllProfilesForAdminInput,
    userId: string,
  ): Promise<PaginatedProfilesResponse> {
    // Verify requesting user is ADMIN
    const requestingUser = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { type: true },
    });

    if (!requestingUser || requestingUser.type !== ProfileType.ADMIN) {
      throw new ForbiddenException({
        message: 'Only administrators can access this resource',
        extensions: {
          code: 'FORBIDDEN',
        },
      });
    }

    // Set default values
    const page = input.page || 1;
    const pageSize = input.pageSize || 25;
    const sortBy = input.sortBy || ProfileSortField.NAME;
    const sortDirection = input.sortDirection || SortDirection.ASC;

    // Build where clause
    const where: any = {
      type: { not: ProfileType.ADMIN }, // Exclude ADMIN users
    };

    // Apply search filter (OR operation on name and email)
    if (input.searchTerm) {
      where.OR = [
        { name: { contains: input.searchTerm, mode: 'insensitive' } },
        { email: { contains: input.searchTerm, mode: 'insensitive' } },
      ];
    }

    // Apply seniority level filter (OR operation)
    if (input.seniorityLevels && input.seniorityLevels.length > 0) {
      where.currentSeniorityLevel = { in: input.seniorityLevels };
    }

    // Apply skills filter (AND operation)
    if (input.skillIds && input.skillIds.length > 0) {
      // Find profiles that have ALL selected skills using groupBy
      const skillIdsInt = input.skillIds.map((id) => parseInt(id, 10));

      // Get groupBy result
      const profileSkillCounts = await this.prisma.employeeSkill.groupBy({
        by: ['profileId'],
        where: {
          skillId: { in: skillIdsInt },
        },
        _count: {
          skillId: true,
        },
      });

      // Filter to only profiles that have ALL selected skills
      const profileIdsWithAllSkills = profileSkillCounts
        .filter((group) => group._count.skillId === skillIdsInt.length)
        .map((group) => group.profileId);

      where.id = where.id
        ? { in: profileIdsWithAllSkills.filter((id) => where.id.in.includes(id)) }
        : { in: profileIdsWithAllSkills };
    }

    // Apply years in company filter (OR operation)
    if (
      input.yearsInCompanyRanges &&
      input.yearsInCompanyRanges.length > 0
    ) {
      // Need to find profiles where first seniority history matches any range
      // This requires a subquery approach - we'll filter by profileId after querying
      const profilesMatchingYears = await this.prisma.profile.findMany({
        where: {
          ...where,
        },
        select: {
          id: true,
          seniorityHistory: {
            orderBy: { startDate: 'asc' },
            take: 1,
            select: { startDate: true },
          },
        },
      });

      const matchingProfileIds = profilesMatchingYears
        .filter((profile) => {
          if (profile.seniorityHistory.length === 0) return false;
          const joinDate = profile.seniorityHistory[0].startDate;

          return input.yearsInCompanyRanges!.some((range) => {
            const dateRange = this.calculateYearsInCompanyDateRange(range);
            if (dateRange.gte && dateRange.lt) {
              return joinDate >= dateRange.gte && joinDate < dateRange.lt;
            } else if (dateRange.gte) {
              return joinDate >= dateRange.gte;
            } else if (dateRange.lt) {
              return joinDate < dateRange.lt;
            }
            return false;
          });
        })
        .map((p) => p.id);

      where.id = where.id
        ? { in: matchingProfileIds.filter((id) => where.id.in.includes(id)) }
        : { in: matchingProfileIds };
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case ProfileSortField.NAME:
        orderBy = { name: sortDirection.toLowerCase() };
        break;
      case ProfileSortField.EMAIL:
        orderBy = { email: sortDirection.toLowerCase() };
        break;
      case ProfileSortField.SENIORITY:
        orderBy = { currentSeniorityLevel: sortDirection.toLowerCase() };
        break;
      case ProfileSortField.JOIN_DATE:
        // For join date sorting, we need to use a subquery approach
        // For now, fallback to createdAt - this would require raw SQL or ordering after fetch
        orderBy = { createdAt: sortDirection.toLowerCase() };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    // Execute queries
    const [profiles, totalCount] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          currentSeniorityLevel: true,
          createdAt: true,
          seniorityHistory: {
            orderBy: { startDate: 'asc' },
            take: 1,
            select: { startDate: true },
          },
          assignments: {
            select: {
              id: true,
              tags: true,
            },
          },
          employeeSkills: {
            include: {
              skill: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.profile.count({ where }),
    ]);

    // Map profiles to response format
    const profileItems: ProfileListItemResponse[] = profiles.map((profile) => {
      // Calculate join date from first seniority history
      const joinDate =
        profile.seniorityHistory.length > 0
          ? profile.seniorityHistory[0].startDate
          : profile.createdAt;

      // Get current assignments count
      const currentAssignmentsCount = profile.assignments.length;

      // Get assignment tags
      const assignmentTags = new Set<string>();
      profile.assignments.forEach((assignment) => {
        assignment.tags.forEach((tag) => assignmentTags.add(tag));
      });

      // Match skills with assignment tags to get core stack
      const coreStackSkills: string[] = [];
      const allSkillNames: string[] = [];

      profile.employeeSkills.forEach((empSkill) => {
        allSkillNames.push(empSkill.skill.name);
        if (assignmentTags.has(empSkill.skill.name)) {
          coreStackSkills.push(empSkill.skill.name);
        }
      });

      // Take first 3-4 core stack skills
      const displayedCoreStack = coreStackSkills.slice(0, 4);
      const remainingSkillsCount = Math.max(
        0,
        allSkillNames.length - displayedCoreStack.length,
      );

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl || undefined,
        currentSeniorityLevel: profile.currentSeniorityLevel,
        joinDate,
        currentAssignmentsCount,
        coreStackSkills: displayedCoreStack,
        remainingSkillsCount,
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      profiles: profileItems,
      totalCount,
      currentPage: page,
      pageSize,
      totalPages,
    };
  }
}
