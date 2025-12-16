import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { InboxService } from './inbox.service';
import { InboxResolver } from './inbox.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProfileService, ProfileResolver, InboxService, InboxResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
