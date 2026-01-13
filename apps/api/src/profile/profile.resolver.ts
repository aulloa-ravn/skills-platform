import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { SuggestionsService } from './suggestions.service';
import { ProfileResponse } from './dto/profile.response';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProfileType } from '@prisma/client';
import { GetAllProfilesForAdminInput } from './dto/get-all-profiles-for-admin.input';
import { PaginatedProfilesResponse } from './dto/get-all-profiles-for-admin.response';
import { SubmitSkillSuggestionInput } from './dto/submit-skill-suggestion.input';
import { SubmittedSuggestionResponse } from './dto/submitted-suggestion.response';

@Resolver()
export class ProfileResolver {
  constructor(
    private profileService: ProfileService,
    private suggestionsService: SuggestionsService,
  ) {}

  @Query(() => ProfileResponse)
  async getProfile(
    @CurrentUser() user: CurrentUserType,
    @Args('id') profileId: string,
  ): Promise<ProfileResponse> {
    return this.profileService.getProfile(user.id, user.type, profileId);
  }

  @Query(() => PaginatedProfilesResponse)
  @UseGuards(JwtAuthGuard)
  async getAllProfilesForAdmin(
    @CurrentUser() user: CurrentUserType,
    @Args('input', { nullable: true }) input?: GetAllProfilesForAdminInput,
  ): Promise<PaginatedProfilesResponse> {
    return this.profileService.getAllProfilesForAdmin(input || {}, user.id);
  }

  @Mutation(() => SubmittedSuggestionResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ProfileType.EMPLOYEE)
  async submitSkillSuggestion(
    @CurrentUser() user: CurrentUserType,
    @Args('input') input: SubmitSkillSuggestionInput,
  ): Promise<SubmittedSuggestionResponse> {
    const suggestion = await this.suggestionsService.createSelfReportSuggestion(
      user.id,
      input.skillId,
      input.proficiencyLevel,
    );

    return {
      suggestionId: suggestion.id,
      status: suggestion.status,
      suggestedProficiency: suggestion.suggestedProficiency,
      createdAt: suggestion.createdAt,
      skill: {
        id: suggestion.skill.id,
        name: suggestion.skill.name,
        discipline: suggestion.skill.discipline,
      },
    };
  }
}
