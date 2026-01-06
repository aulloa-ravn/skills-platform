import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SuggestionStatus, SuggestionSource } from '@prisma/client';

@Injectable()
export class StaleSkillFlaggingService {
  private readonly logger = new Logger(StaleSkillFlaggingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cron job that runs daily at midnight (00:00) to identify stale Core Stack skills
   * and create re-validation suggestions for Tech Leads
   */
  @Cron('0 0 * * *')
  async handleCron() {
    try {
      const startTime = new Date();
      this.logger.log(
        `Starting stale skill flagging job at ${startTime.toISOString()}`,
      );

      // Counters for logging
      let employeesProcessed = 0;
      let coreStackSkillsIdentified = 0;
      let staleSkillsFound = 0;
      let suggestionsCreated = 0;
      let suggestionsSkipped = 0;
      let inactiveSkillsExcluded = 0;

      // Fetch all profiles with active assignments
      const profiles = await this.prisma.profile.findMany({
        where: {
          assignments: {
            some: {},
          },
        },
        include: {
          assignments: {
            select: {
              tags: true,
            },
          },
          employeeSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      employeesProcessed = profiles.length;

      // Calculate staleness cutoff date (12 months = 365 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);

      // Process each profile
      for (const profile of profiles) {
        // Extract assignment tags into a Set for O(1) lookup (case-sensitive)
        const assignmentTags = new Set<string>();
        profile.assignments.forEach((assignment) => {
          assignment.tags.forEach((tag) => assignmentTags.add(tag));
        });

        // Filter to Core Stack skills (skills that appear in assignment tags)
        const coreStackSkills = profile.employeeSkills.filter((empSkill) =>
          assignmentTags.has(empSkill.skill.name),
        );

        coreStackSkillsIdentified += coreStackSkills.length;

        // Filter to stale Core Stack skills (lastValidatedAt > 12 months)
        for (const empSkill of coreStackSkills) {
          // Exclude inactive skills
          if (!empSkill.skill.isActive) {
            inactiveSkillsExcluded++;
            continue;
          }

          // Check if skill is stale
          if (empSkill.lastValidatedAt < cutoffDate) {
            staleSkillsFound++;

            // Check for existing PENDING suggestion
            const existingSuggestion = await this.prisma.suggestion.findFirst({
              where: {
                profileId: profile.id,
                skillId: empSkill.skillId,
                status: SuggestionStatus.PENDING,
              },
            });

            if (existingSuggestion) {
              suggestionsSkipped++;
              continue;
            }

            // Create suggestion
            await this.prisma.suggestion.create({
              data: {
                profileId: profile.id,
                skillId: empSkill.skillId,
                suggestedProficiency: empSkill.proficiencyLevel,
                status: SuggestionStatus.PENDING,
                source: SuggestionSource.SYSTEM_FLAG,
              },
            });

            suggestionsCreated++;
          }
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Log comprehensive metrics
      this.logger.log(
        `Completed stale skill flagging job at ${endTime.toISOString()}`,
      );
      this.logger.log(`Job duration: ${duration}ms`);
      this.logger.log(
        `Employees with active assignments processed: ${employeesProcessed}`,
      );
      this.logger.log(
        `Core Stack skills identified: ${coreStackSkillsIdentified}`,
      );
      this.logger.log(
        `Stale Core Stack skills found (lastValidatedAt > 12 months): ${staleSkillsFound}`,
      );
      this.logger.log(
        `Suggestions successfully created: ${suggestionsCreated}`,
      );
      this.logger.log(
        `Suggestions skipped due to existing PENDING suggestions: ${suggestionsSkipped}`,
      );
      this.logger.log(
        `Skills excluded due to isActive = false: ${inactiveSkillsExcluded}`,
      );
    } catch (error) {
      this.logger.error(
        `Error during stale skill flagging job: ${error.message}`,
        error.stack,
      );
      // Do not re-throw - prevent application crash
    }
  }
}
