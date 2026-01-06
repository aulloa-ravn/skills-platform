import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeniorityHistory } from '@prisma/client';
import { CreateSeniorityHistoryInput } from './dto/create-seniority-history.input';
import { UpdateSeniorityHistoryInput } from './dto/update-seniority-history.input';

@Injectable()
export class SeniorityHistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate date range for seniority records
   * @param startDate Start date of the record
   * @param endDate End date of the record (can be null for current seniority)
   * @throws BadRequestException if endDate is before startDate
   */
  private validateDateRange(
    startDate: Date,
    endDate: Date | null | undefined,
  ): void {
    if (endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException({
        message: 'End date cannot be before start date',
        extensions: {
          code: 'INVALID_DATE_RANGE',
        },
      });
    }
  }

  /**
   * Sync Profile.currentSeniorityLevel when updating current record
   * @param profileId Profile ID
   * @param seniorityLevel Seniority level to sync
   * @param transaction Prisma transaction client
   */
  private async syncProfileCurrentSeniority(
    profileId: string,
    seniorityLevel: any,
    transaction: any,
  ): Promise<void> {
    await transaction.profile.update({
      where: { id: profileId },
      data: { currentSeniorityLevel: seniorityLevel },
    });
  }

  /**
   * Get seniority history for a profile
   * @param profileId Profile ID
   * @returns Array of SeniorityHistory records ordered by startDate descending
   */
  async getSeniorityHistory(profileId: string): Promise<SeniorityHistory[]> {
    return this.prisma.seniorityHistory.findMany({
      where: { profileId },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Create a new seniority history record
   * @param input CreateSeniorityHistoryInput
   * @returns Created SeniorityHistory record
   */
  async createSeniorityHistory(
    input: CreateSeniorityHistoryInput,
  ): Promise<SeniorityHistory> {
    // Validate date range
    this.validateDateRange(input.startDate, input.endDate);

    // Verify profile exists
    const profile = await this.prisma.profile.findUnique({
      where: { id: input.profileId },
    });

    if (!profile) {
      throw new NotFoundException({
        message: 'Profile not found',
        extensions: {
          code: 'PROFILE_NOT_FOUND',
        },
      });
    }

    // If endDate is null (current seniority), sync with profile in transaction
    if (!input.endDate) {
      return this.prisma.$transaction(async (tx) => {
        const record = await tx.seniorityHistory.create({
          data: {
            profileId: input.profileId,
            seniorityLevel: input.seniorityLevel,
            startDate: input.startDate,
            endDate: input.endDate || null,
          },
        });

        await this.syncProfileCurrentSeniority(
          input.profileId,
          input.seniorityLevel,
          tx,
        );

        return record;
      });
    }

    // Otherwise, just create the record
    return this.prisma.seniorityHistory.create({
      data: {
        profileId: input.profileId,
        seniorityLevel: input.seniorityLevel,
        startDate: input.startDate,
        endDate: input.endDate || null,
      },
    });
  }

  /**
   * Update an existing seniority history record
   * @param input UpdateSeniorityHistoryInput
   * @returns Updated SeniorityHistory record
   */
  async updateSeniorityHistory(
    input: UpdateSeniorityHistoryInput,
  ): Promise<SeniorityHistory> {
    // Validate date range
    this.validateDateRange(input.startDate, input.endDate);

    // Verify record exists
    const existingRecord = await this.prisma.seniorityHistory.findUnique({
      where: { id: input.id },
    });

    if (!existingRecord) {
      throw new NotFoundException({
        message: 'Seniority history record not found',
        extensions: {
          code: 'RECORD_NOT_FOUND',
        },
      });
    }

    // If endDate is null (current seniority), sync with profile in transaction
    if (!input.endDate) {
      return this.prisma.$transaction(async (tx) => {
        const record = await tx.seniorityHistory.update({
          where: { id: input.id },
          data: {
            seniorityLevel: input.seniorityLevel,
            startDate: input.startDate,
            endDate: input.endDate || null,
          },
        });

        await this.syncProfileCurrentSeniority(
          existingRecord.profileId,
          input.seniorityLevel,
          tx,
        );

        return record;
      });
    }

    // Otherwise, just update the record
    return this.prisma.seniorityHistory.update({
      where: { id: input.id },
      data: {
        seniorityLevel: input.seniorityLevel,
        startDate: input.startDate,
        endDate: input.endDate || null,
      },
    });
  }
}
