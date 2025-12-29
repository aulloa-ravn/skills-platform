import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileType, SuggestionStatus } from '@prisma/client';
import {
  InboxResponse,
  ProjectInbox,
  EmployeeInbox,
  PendingSuggestion,
} from './dto/inbox.response';

@Injectable()
export class InboxService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user is authorized to access the validation inbox
   * @param userType Authenticated user's type
   * @throws ForbiddenException if EMPLOYEE type attempts access
   */
  private checkAuthorization(userType: ProfileType): void {
    if (userType === ProfileType.EMPLOYEE) {
      throw new ForbiddenException(
        'You do not have permission to access the validation inbox',
      );
    }
  }

  /**
   * Build the Prisma where clause for projects based on user type
   * @param userId Authenticated user's ID
   * @param userType Authenticated user's type
   * @returns Where clause for project filtering
   */
  private buildProjectsQuery(userId: string, userType: ProfileType) {
    const basePendingFilter = {
      assignments: {
        some: {
          profile: {
            suggestions: {
              some: {
                status: SuggestionStatus.PENDING,
              },
            },
          },
        },
      },
    };

    if (userType === ProfileType.TECH_LEAD) {
      return {
        techLeadId: userId,
        ...basePendingFilter,
      };
    }

    // ADMIN sees all projects
    return basePendingFilter;
  }

  /**
   * Transform Prisma result into hierarchical InboxResponse DTO
   * @param projects Projects with nested data from Prisma
   * @returns InboxResponse with three-level hierarchy
   */
  private transformToInboxResponse(projects: any[]): InboxResponse {
    const projectInboxes: ProjectInbox[] = projects
      .map((project) => {
        // Group suggestions by employee
        const employeeMap = new Map<string, any>();

        project.assignments.forEach((assignment: any) => {
          const employee = assignment.profile;
          const pendingSuggestions = employee.suggestions.filter(
            (s: any) => s.status === SuggestionStatus.PENDING,
          );

          if (pendingSuggestions.length === 0) {
            return; // Skip employees with no pending suggestions
          }

          if (!employeeMap.has(employee.id)) {
            employeeMap.set(employee.id, {
              employee,
              suggestions: [],
            });
          }

          const employeeData = employeeMap.get(employee.id);
          pendingSuggestions.forEach((suggestion: any) => {
            // Find current proficiency from employeeSkills
            const currentSkill = employee.employeeSkills.find(
              (es: any) => es.skillId === suggestion.skillId,
            );

            employeeData.suggestions.push({
              suggestion,
              currentProficiency: currentSkill?.proficiencyLevel,
            });
          });
        });

        // Convert map to array of EmployeeInbox objects
        const employees: EmployeeInbox[] = Array.from(
          employeeMap.values(),
        ).map((employeeData) => {
          const suggestions: PendingSuggestion[] = employeeData.suggestions.map(
            (s: any) => ({
              id: s.suggestion.id,
              skillName: s.suggestion.skill.name,
              discipline: s.suggestion.skill.discipline,
              suggestedProficiency: s.suggestion.suggestedProficiency,
              source: s.suggestion.source,
              createdAt: s.suggestion.createdAt,
              currentProficiency: s.currentProficiency,
            }),
          );

          return {
            employeeId: employeeData.employee.id,
            employeeName: employeeData.employee.name,
            employeeEmail: employeeData.employee.email,
            pendingSuggestionsCount: suggestions.length,
            suggestions,
          };
        });

        // Sort employees alphabetically by name
        employees.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

        // Calculate total pending suggestions for this project
        const totalPendingSuggestions = employees.reduce(
          (sum, emp) => sum + emp.pendingSuggestionsCount,
          0,
        );

        return {
          projectId: project.id,
          projectName: project.name,
          pendingSuggestionsCount: totalPendingSuggestions,
          employees,
        };
      })
      .filter((project) => project.employees.length > 0); // Only include projects with employees who have pending suggestions

    // Sort projects alphabetically by name
    projectInboxes.sort((a, b) => a.projectName.localeCompare(b.projectName));

    return {
      projects: projectInboxes,
    };
  }

  /**
   * Get validation inbox with hierarchical structure (Projects → Employees → Suggestions)
   * @param userId Authenticated user's ID
   * @param userType Authenticated user's type
   * @returns InboxResponse with filtered data based on user type
   * @throws ForbiddenException if EMPLOYEE type attempts access
   */
  async getValidationInbox(
    userId: string,
    userType: ProfileType,
  ): Promise<InboxResponse> {
    // Check authorization
    this.checkAuthorization(userType);

    // Build query based on type
    const whereClause = this.buildProjectsQuery(userId, userType);

    // Execute single Prisma query with nested includes
    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        assignments: {
          include: {
            profile: {
              include: {
                suggestions: {
                  where: {
                    status: SuggestionStatus.PENDING,
                  },
                  include: {
                    skill: true,
                  },
                },
                employeeSkills: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform to hierarchical DTO
    return this.transformToInboxResponse(projects);
  }
}
