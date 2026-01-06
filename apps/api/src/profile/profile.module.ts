import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { InboxService } from './inbox.service';
import { InboxResolver } from './inbox.resolver';
import { ResolutionService } from './resolution.service';
import { ResolutionResolver } from './resolution.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    ProfileService,
    ProfileResolver,
    InboxService,
    InboxResolver,
    ResolutionService,
    ResolutionResolver,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
