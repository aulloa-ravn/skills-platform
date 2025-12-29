import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { ResolveSuggestionsInput } from './dto/resolution.input';
import { ResolveSuggestionsResponse } from './dto/resolution.response';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver()
export class ResolutionResolver {
  constructor(private resolutionService: ResolutionService) {}

  @Mutation(() => ResolveSuggestionsResponse)
  @UseGuards(JwtAuthGuard)
  async resolveSuggestions(
    @Args('input') input: ResolveSuggestionsInput,
    @CurrentUser() user: CurrentUserType,
  ): Promise<ResolveSuggestionsResponse> {
    return this.resolutionService.resolveSuggestions(
      user.id,
      user.type,
      input,
    );
  }
}
