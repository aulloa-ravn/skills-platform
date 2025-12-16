import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxResponse } from './dto/inbox.response';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver()
export class InboxResolver {
  constructor(private inboxService: InboxService) {}

  @Query(() => InboxResponse)
  @UseGuards(JwtAuthGuard)
  async getValidationInbox(
    @CurrentUser() user: CurrentUserType,
  ): Promise<InboxResponse> {
    return this.inboxService.getValidationInbox(user.id, user.role);
  }
}
