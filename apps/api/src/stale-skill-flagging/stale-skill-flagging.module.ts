import { Module } from '@nestjs/common';
import { StaleSkillFlaggingService } from './stale-skill-flagging.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StaleSkillFlaggingService],
})
export class StaleSkillFlaggingModule {}
