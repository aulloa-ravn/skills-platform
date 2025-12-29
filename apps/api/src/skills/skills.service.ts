import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Skill } from '@prisma/client';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';

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
   * Create a new skill
   * @param input CreateSkillInput
   * @returns Created Skill
   */
  async createSkill(input: CreateSkillInput): Promise<Skill> {
    // Validate name uniqueness
    await this.validateNameUniqueness(input.name);

    // Trim name before storage
    const trimmedName = input.name.trim();

    // Create skill
    return this.prisma.skill.create({
      data: {
        name: trimmedName,
        discipline: input.discipline,
        isActive: true,
      },
    });
  }

  /**
   * Update an existing skill
   * @param input UpdateSkillInput
   * @returns Updated Skill
   */
  async updateSkill(input: UpdateSkillInput): Promise<Skill> {
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
    return this.prisma.skill.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  /**
   * Disable a skill (soft delete)
   * @param id Skill ID
   * @returns Updated Skill
   */
  async disableSkill(id: number): Promise<Skill> {
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

    // Verify skill is currently active
    if (!skill.isActive) {
      throw new BadRequestException({
        message: 'Skill is already disabled',
        extensions: {
          code: 'ALREADY_DISABLED',
        },
      });
    }

    // Update skill to disabled
    return this.prisma.skill.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Enable a disabled skill
   * @param id Skill ID
   * @returns Updated Skill
   */
  async enableSkill(id: number): Promise<Skill> {
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

    // Verify skill is currently disabled
    if (skill.isActive) {
      throw new BadRequestException({
        message: 'Skill is already active',
        extensions: {
          code: 'ALREADY_ACTIVE',
        },
      });
    }

    // Update skill to active
    return this.prisma.skill.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
