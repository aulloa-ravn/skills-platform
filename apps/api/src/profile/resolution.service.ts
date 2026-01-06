import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProfileType,
  SuggestionStatus,
  ProficiencyLevel,
} from '@prisma/client';
import {
  ResolveSuggestionsInput,
  DecisionInput,
  ResolutionAction,
} from './dto/resolution.input';
import {
  ResolveSuggestionsResponse,
  ResolvedSuggestion,
  ResolutionError,
} from './dto/resolution.response';

@Injectable()
export class ResolutionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user is authorized to resolve a specific suggestion
   * @param userId Authenticated user's ID
   * @param userType Authenticated user's type
   * @param suggestionId Suggestion ID to check
   * @throws ForbiddenException if user lacks permission
   */
  private async checkSuggestionAuthorization(
    userId: string,
    userType: ProfileType,
    suggestionId: number,
  ): Promise<void> {
    // ADMIN can resolve any suggestion
    if (userType === ProfileType.ADMIN) {
      return;
    }

    // TECH_LEAD can only resolve suggestions for their team members
    if (userType === ProfileType.TECH_LEAD) {
      // Query suggestion with nested includes to verify tech lead has access
      const suggestion = await this.prisma.suggestion.findUnique({
        where: { id: suggestionId },
        include: {
          profile: {
            include: {
              assignments: {
                include: {
                  project: true,
                },
              },
            },
          },
        },
      });

      if (!suggestion) {
        throw new ForbiddenException({
          message: `Suggestion ${suggestionId} not found or access denied`,
          extensions: {
            code: 'UNAUTHORIZED',
            suggestionId,
          },
        });
      }

      // Check if tech lead has access via any of the employee's projects
      const hasAccess = suggestion.profile.assignments.some(
        (assignment) => assignment.project.techLeadId === userId,
      );

      if (!hasAccess) {
        throw new ForbiddenException({
          message: `You do not have permission to resolve this suggestion`,
          extensions: {
            code: 'UNAUTHORIZED',
            suggestionId,
          },
        });
      }

      return;
    }

    // EMPLOYEE role cannot resolve suggestions
    throw new ForbiddenException({
      message: `You do not have permission to resolve suggestions`,
      extensions: {
        code: 'UNAUTHORIZED',
        suggestionId,
      },
    });
  }

  /**
   * Validate that suggestion exists and is in PENDING status
   * @param suggestionId Suggestion ID to validate
   * @returns Validation error or null if valid
   */
  private async validateSuggestionExists(
    suggestionId: number,
  ): Promise<ResolutionError | null> {
    const suggestion = await this.prisma.suggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      return {
        suggestionId,
        message: `Suggestion not found`,
        code: 'NOT_FOUND',
      };
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      return {
        suggestionId,
        message: `Suggestion has already been processed`,
        code: 'ALREADY_PROCESSED',
      };
    }

    return null;
  }

  /**
   * Validate that proficiency level is valid
   * @param proficiency Proficiency level to validate
   * @returns true if valid, false otherwise
   */
  private validateProficiencyLevel(proficiency: string): boolean {
    return Object.values(ProficiencyLevel).includes(
      proficiency as ProficiencyLevel,
    );
  }

  /**
   * Validate decision input
   * @param decision Decision to validate
   * @returns Validation error or null if valid
   */
  private validateDecisionInput(
    decision: DecisionInput,
  ): ResolutionError | null {
    // Check if ADJUST_LEVEL has adjustedProficiency
    if (
      decision.action === ResolutionAction.ADJUST_LEVEL &&
      !decision.adjustedProficiency
    ) {
      return {
        suggestionId: decision.suggestionId,
        message: `adjustedProficiency is required for ADJUST_LEVEL action`,
        code: 'MISSING_PROFICIENCY',
      };
    }

    // Validate proficiency level if provided
    if (
      decision.action === ResolutionAction.ADJUST_LEVEL &&
      decision.adjustedProficiency
    ) {
      if (!this.validateProficiencyLevel(decision.adjustedProficiency)) {
        return {
          suggestionId: decision.suggestionId,
          message: `Invalid proficiency level: ${decision.adjustedProficiency}`,
          code: 'INVALID_PROFICIENCY',
        };
      }
    }

    return null;
  }

  /**
   * Handle APPROVE action
   * @param suggestionId Suggestion ID to approve
   * @param userId User ID performing the action
   * @returns ResolvedSuggestion object
   */
  private async handleApprove(
    suggestionId: number,
    userId: string,
  ): Promise<ResolvedSuggestion> {
    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Get suggestion with related data
      const suggestion = await tx.suggestion.findUnique({
        where: { id: suggestionId },
        include: {
          skill: true,
          profile: true,
        },
      });

      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      // Update suggestion status
      await tx.suggestion.update({
        where: { id: suggestionId },
        data: {
          status: SuggestionStatus.APPROVED,
          resolvedAt: new Date(),
        },
      });

      // Create or update EmployeeSkill
      await tx.employeeSkill.upsert({
        where: {
          profileId_skillId: {
            profileId: suggestion.profileId,
            skillId: suggestion.skillId,
          },
        },
        create: {
          profileId: suggestion.profileId,
          skillId: suggestion.skillId,
          proficiencyLevel: suggestion.suggestedProficiency,
          lastValidatedById: userId,
          lastValidatedAt: new Date(),
        },
        update: {
          proficiencyLevel: suggestion.suggestedProficiency,
          lastValidatedById: userId,
          lastValidatedAt: new Date(),
        },
      });

      return {
        suggestion,
        proficiencyLevel: suggestion.suggestedProficiency,
      };
    });

    return {
      suggestionId,
      action: ResolutionAction.APPROVE,
      employeeName: result.suggestion.profile.name,
      skillName: result.suggestion.skill.name,
      proficiencyLevel: result.proficiencyLevel,
    };
  }

  /**
   * Handle ADJUST_LEVEL action
   * @param suggestionId Suggestion ID to adjust
   * @param userId User ID performing the action
   * @param adjustedProficiency Adjusted proficiency level
   * @returns ResolvedSuggestion object
   */
  private async handleAdjustLevel(
    suggestionId: number,
    userId: string,
    adjustedProficiency: string,
  ): Promise<ResolvedSuggestion> {
    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Get suggestion with related data
      const suggestion = await tx.suggestion.findUnique({
        where: { id: suggestionId },
        include: {
          skill: true,
          profile: true,
        },
      });

      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      // Update suggestion status (treat as APPROVED)
      await tx.suggestion.update({
        where: { id: suggestionId },
        data: {
          status: SuggestionStatus.APPROVED,
          resolvedAt: new Date(),
        },
      });

      // Create or update EmployeeSkill with adjusted proficiency
      await tx.employeeSkill.upsert({
        where: {
          profileId_skillId: {
            profileId: suggestion.profileId,
            skillId: suggestion.skillId,
          },
        },
        create: {
          profileId: suggestion.profileId,
          skillId: suggestion.skillId,
          proficiencyLevel: adjustedProficiency as ProficiencyLevel,
          lastValidatedById: userId,
          lastValidatedAt: new Date(),
        },
        update: {
          proficiencyLevel: adjustedProficiency as ProficiencyLevel,
          lastValidatedById: userId,
          lastValidatedAt: new Date(),
        },
      });

      return {
        suggestion,
        proficiencyLevel: adjustedProficiency,
      };
    });

    return {
      suggestionId,
      action: ResolutionAction.ADJUST_LEVEL,
      employeeName: result.suggestion.profile.name,
      skillName: result.suggestion.skill.name,
      proficiencyLevel: result.proficiencyLevel,
    };
  }

  /**
   * Handle REJECT action
   * @param suggestionId Suggestion ID to reject
   * @returns ResolvedSuggestion object
   */
  private async handleReject(
    suggestionId: number,
  ): Promise<ResolvedSuggestion> {
    // Get suggestion with related data
    const suggestion = await this.prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: {
        skill: true,
        profile: true,
      },
    });

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    // Update suggestion status (no transaction needed)
    await this.prisma.suggestion.update({
      where: { id: suggestionId },
      data: {
        status: SuggestionStatus.REJECTED,
        resolvedAt: new Date(),
      },
    });

    return {
      suggestionId,
      action: ResolutionAction.REJECT,
      employeeName: suggestion.profile.name,
      skillName: suggestion.skill.name,
      proficiencyLevel: suggestion.suggestedProficiency,
    };
  }

  /**
   * Resolve suggestions in batch with partial failure handling
   * @param userId Authenticated user's ID
   * @param userType Authenticated user's type
   * @param input Input containing decisions
   * @returns Response with processed suggestions and errors
   */
  async resolveSuggestions(
    userId: string,
    userType: ProfileType,
    input: ResolveSuggestionsInput,
  ): Promise<ResolveSuggestionsResponse> {
    const processed: ResolvedSuggestion[] = [];
    const errors: ResolutionError[] = [];
    const processedIds = new Set<number>();

    for (const decision of input.decisions) {
      try {
        // Skip duplicates silently
        if (processedIds.has(decision.suggestionId)) {
          continue;
        }

        processedIds.add(decision.suggestionId);

        // Validate decision input
        const inputValidationError = this.validateDecisionInput(decision);
        if (inputValidationError) {
          errors.push(inputValidationError);
          continue;
        }

        // Validate suggestion exists and is pending
        const existsError = await this.validateSuggestionExists(
          decision.suggestionId,
        );
        if (existsError) {
          errors.push(existsError);
          continue;
        }

        // Check authorization
        await this.checkSuggestionAuthorization(
          userId,
          userType,
          decision.suggestionId,
        );

        // Process based on action
        let result: ResolvedSuggestion;
        switch (decision.action) {
          case ResolutionAction.APPROVE:
            result = await this.handleApprove(decision.suggestionId, userId);
            break;
          case ResolutionAction.ADJUST_LEVEL:
            result = await this.handleAdjustLevel(
              decision.suggestionId,
              userId,
              decision.adjustedProficiency!,
            );
            break;
          case ResolutionAction.REJECT:
            result = await this.handleReject(decision.suggestionId);
            break;
          default:
            throw new Error(`Unknown action: ${decision.action}`);
        }

        processed.push(result);
      } catch (error: any) {
        // Handle authorization errors
        if (error instanceof ForbiddenException) {
          errors.push({
            suggestionId: decision.suggestionId,
            message: error.message,
            code: 'UNAUTHORIZED',
          });
        } else {
          // Handle other errors
          errors.push({
            suggestionId: decision.suggestionId,
            message:
              error.message || 'An error occurred processing this suggestion',
            code: 'VALIDATION_FAILED',
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      processed,
      errors,
    };
  }
}
