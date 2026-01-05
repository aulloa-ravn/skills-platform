import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SeniorityHistoryService } from './seniority-history.service';
import { CreateSeniorityHistoryInput } from './dto/create-seniority-history.input';
import { UpdateSeniorityHistoryInput } from './dto/update-seniority-history.input';
import { SeniorityHistoryRecord } from './dto/seniority-history-record.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProfileType } from '@prisma/client';

@Resolver()
export class SeniorityHistoryResolver {
  constructor(private seniorityHistoryService: SeniorityHistoryService) {}

  @Query(() => [SeniorityHistoryRecord], { name: 'getSeniorityHistory' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async getSeniorityHistory(
    @Args('profileId') profileId: string,
  ): Promise<SeniorityHistoryRecord[]> {
    return this.seniorityHistoryService.getSeniorityHistory(profileId);
  }

  @Mutation(() => SeniorityHistoryRecord)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async createSeniorityHistory(
    @Args('input') input: CreateSeniorityHistoryInput,
  ): Promise<SeniorityHistoryRecord> {
    return this.seniorityHistoryService.createSeniorityHistory(input);
  }

  @Mutation(() => SeniorityHistoryRecord)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.ADMIN)
  async updateSeniorityHistory(
    @Args('input') input: UpdateSeniorityHistoryInput,
  ): Promise<SeniorityHistoryRecord> {
    return this.seniorityHistoryService.updateSeniorityHistory(input);
  }
}
