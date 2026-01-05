import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Skill } from '@prisma/client';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { GetAllSkillsInput } from './dto/get-all-skills.input';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normalize skill name for comparison
   * @param name Skill name to normalize
   * @returns Normalized skill name
   */
  private normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  /**
   * Validate that skill name is unique (case-insensitive)
   * @param name Skill name to validate
   * @param excludeId Optional skill ID to exclude from check (for updates)
   * @throws BadRequestException if name is not unique
   */
  private async validateNameUniqueness(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const normalizedName = this.normalizeName(name);

    // Query for skills with matching name (case-insensitive)
    // Check both active AND disabled skills
    const existingSkill = await this.prisma.skill.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (existingSkill) {
      throw new BadRequestException({
        message: 'Skill name already exists',
        extensions: {
          code: 'DUPLICATE_NAME',
        },
      });
    }
  }

  /**
   * Get employee counts grouped by skillId
   * @returns Map of skillId to employee count
   */
  async getEmployeeCounts(): Promise<Record<number, number>> {
    const counts = await this.prisma.employeeSkill.groupBy({
      by: ['skillId'],
      _count: {
        id: true,
      },
    });

    const countMap: Record<number, number> = {};
    counts.forEach((count) => {
      countMap[count.skillId] = count._count.id;
    });

    return countMap;
  }

  /**
   * Get all skills with optional filtering
   * @param input Optional GetAllSkillsInput filters
   * @returns Array of Skill objects with employeeCount sorted alphabetically by name
   */
  async getAllSkills(
    input?: GetAllSkillsInput,
  ): Promise<Array<Skill & { employeeCount: number }>> {
    // Build dynamic where clause based on provided filters
    const where: any = {};

    // Filter by isActive status when provided
    if (input?.isActive !== undefined && input?.isActive !== null) {
      where.isActive = input.isActive;
    }

    // Filter by multiple disciplines when provided
    if (input?.disciplines && input.disciplines.length > 0) {
      where.discipline = { in: input.disciplines };
    }

    // Filter by searchTerm with case-insensitive partial match
    if (input?.searchTerm) {
      where.name = {
        contains: input.searchTerm,
        mode: 'insensitive',
      };
    }

    // Query skills with filters and sort alphabetically by name
    const skills = await this.prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Get employee counts for all skills
    const employeeCounts = await this.getEmployeeCounts();

    // Map employeeCount to each skill
    return skills.map((skill) => ({
      ...skill,
      employeeCount: employeeCounts[skill.id] || 0,
    }));
  }

  /**
   * Get skill by ID
   * @param id Skill ID
   * @returns Skill object with employeeCount
   * @throws NotFoundException if skill doesn't exist
   */
  async getSkillById(id: number): Promise<Skill & { employeeCount: number }> {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException({
        message: 'Skill not found',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    }

    // Get employee counts
    const employeeCounts = await this.getEmployeeCounts();

    return {
      ...skill,
      employeeCount: employeeCounts[skill.id] || 0,
    };
  }

  /**
   * Create a new skill
   * @param input CreateSkillInput
   * @returns Created Skill with employeeCount
   */
  async createSkill(
    input: CreateSkillInput,
  ): Promise<Skill & { employeeCount: number }> {
    // Validate name uniqueness
    await this.validateNameUniqueness(input.name);

    // Trim name before storage
    const trimmedName = input.name.trim();

    // Create skill
    const skill = await this.prisma.skill.create({
      data: {
        name: trimmedName,
        discipline: input.discipline,
        isActive: true,
      },
    });

    // New skill has no employees
    return {
      ...skill,
      employeeCount: 0,
    };
  }

  /**
   * Update an existing skill
   * @param input UpdateSkillInput
   * @returns Updated Skill with employeeCount
   */
  async updateSkill(
    input: UpdateSkillInput,
  ): Promise<Skill & { employeeCount: number }> {
    // Verify skill exists
    const existingSkill = await this.prisma.skill.findUnique({
      where: { id: input.id },
    });

    if (!existingSkill) {
      throw new NotFoundException({
        message: 'Skill not found',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    }

    // Validate at least one field is provided
    if (!input.name && !input.discipline) {
      throw new BadRequestException({
        message: 'At least one field (name or discipline) must be provided',
        extensions: {
          code: 'NO_UPDATE_FIELDS',
        },
      });
    }

    // Build update data object
    const updateData: { name?: string; discipline?: any } = {};

    // If name provided, validate uniqueness and trim
    if (input.name) {
      await this.validateNameUniqueness(input.name, input.id);
      updateData.name = input.name.trim();
    }

    // If discipline provided, add to update data
    if (input.discipline) {
      updateData.discipline = input.discipline;
    }

    // Update skill
    const skill = await this.prisma.skill.update({
      where: { id: input.id },
      data: updateData,
    });

    // Get employee counts
    const employeeCounts = await this.getEmployeeCounts();

    return {
      ...skill,
      employeeCount: employeeCounts[skill.id] || 0,
    };
  }

  /**
   * Toggle skill active status
   * @param id Skill ID
   * @param isActive Target active status (true to enable, false to disable)
   * @returns Updated Skill with employeeCount
   */
  async toggleSkill(
    id: number,
    isActive: boolean,
  ): Promise<Skill & { employeeCount: number }> {
    // Verify skill exists
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException({
        message: 'Skill not found',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    }

    // Verify skill is not already in the target state
    if (skill.isActive === isActive) {
      throw new BadRequestException({
        message: isActive
          ? 'Skill is already active'
          : 'Skill is already disabled',
        extensions: {
          code: isActive ? 'ALREADY_ACTIVE' : 'ALREADY_DISABLED',
        },
      });
    }

    // Update skill active status
    const updatedSkill = await this.prisma.skill.update({
      where: { id },
      data: { isActive },
    });

    // Get employee counts
    const employeeCounts = await this.getEmployeeCounts();

    return {
      ...updatedSkill,
      employeeCount: employeeCounts[updatedSkill.id] || 0,
    };
  }
}
