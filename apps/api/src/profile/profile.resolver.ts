import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponse } from './dto/profile.response';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetAllProfilesForAdminInput } from './dto/get-all-profiles-for-admin.input';
import { PaginatedProfilesResponse } from './dto/get-all-profiles-for-admin.response';

@Resolver()
export class ProfileResolver {
  constructor(private profileService: ProfileService) {}

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
    return this.profileService.getAllProfilesForAdmin(
      input || {},
      user.id,
    );
  }
}
