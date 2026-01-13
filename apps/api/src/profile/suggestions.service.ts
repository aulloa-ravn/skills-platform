import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProficiencyLevel, SuggestionStatus } from '@prisma/client';

@Injectable()
export class SuggestionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate that skill exists and is active
   * @param skillId Skill ID to validate
   * @throws NotFoundException if skill doesn't exist
   * @throws BadRequestException if skill is inactive
   */
  async validateSkillExists(skillId: number): Promise<void> {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException({
        message: 'Skill not found',
        extensions: {
          code: 'SKILL_NOT_FOUND',
        },
      });
    }

    if (!skill.isActive) {
      throw new BadRequestException({
        message: 'Skill is inactive',
        extensions: {
          code: 'SKILL_INACTIVE',
        },
      });
    }
  }

  /**
   * Validate that skill is available for employee (not already in EmployeeSkill or Suggestion)
   * @param profileId Employee profile ID
   * @param skillId Skill ID to check
   * @throws BadRequestException if skill already exists in EmployeeSkill or Suggestion
   */
  async validateSkillAvailability(
    profileId: string,
    skillId: number,
  ): Promise<void> {
    // Check if employee already has this skill
    const existingEmployeeSkill = await this.prisma.employeeSkill.findFirst({
      where: {
        profileId,
        skillId,
      },
    });

    if (existingEmployeeSkill) {
      throw new BadRequestException({
        message: 'Employee already has this skill',
        extensions: {
          code: 'SKILL_ALREADY_EXISTS',
        },
      });
    }

    // Check if employee already has a suggestion for this skill (ANY status)
    const existingSuggestion = await this.prisma.suggestion.findFirst({
      where: {
        profileId,
        skillId,
      },
    });

    if (existingSuggestion) {
      throw new BadRequestException({
        message: 'Employee already has a suggestion for this skill',
        extensions: {
          code: 'SKILL_ALREADY_EXISTS',
        },
      });
    }
  }

  /**
   * Find employee's Tech Lead from current project assignment
   * @param profileId Employee profile ID
   * @returns Tech Lead ID
   */
  async findEmployeeTechLead(profileId: string): Promise<string> {
    const assignment = await this.prisma.assignment.findFirst({
      where: { profileId },
      include: {
        project: {
          select: { techLeadId: true },
        },
      },
    });

    // Per spec: assume all employees have assignments with Tech Leads
    return assignment!.project.techLeadId!;
  }

  /**
   * Create a self-report skill suggestion
   * @param profileId Employee profile ID
   * @param skillId Skill ID
   * @param proficiencyLevel Proficiency level
   * @returns Created Suggestion with skill relation
   */
  async createSelfReportSuggestion(
    profileId: string,
    skillId: number,
    proficiencyLevel: ProficiencyLevel,
  ) {
    // Validate skill exists and is active
    await this.validateSkillExists(skillId);

    // Validate skill is available (not already in EmployeeSkill or Suggestion)
    await this.validateSkillAvailability(profileId, skillId);

    // Create suggestion record
    const suggestion = await this.prisma.suggestion.create({
      data: {
        profileId,
        skillId,
        suggestedProficiency: proficiencyLevel,
        status: SuggestionStatus.PENDING,
        source: 'SELF_REPORT',
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            discipline: true,
          },
        },
      },
    });

    return suggestion;
  }
}
