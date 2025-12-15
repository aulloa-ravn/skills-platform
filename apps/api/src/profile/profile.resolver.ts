import { Resolver, Query, Args } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { ProfileResponse } from './dto/profile.response';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';

@Resolver()
export class ProfileResolver {
  constructor(private profileService: ProfileService) {}

  @Query(() => ProfileResponse)
  async getProfile(
    @CurrentUser() user: CurrentUserType,
    @Args('id') profileId: string,
  ): Promise<ProfileResponse> {
    return this.profileService.getProfile(user.id, user.role, profileId);
  }
}
