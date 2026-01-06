import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillsService } from './skills.service';
import { SkillsResolver } from './skills.resolver';

@Module({
  imports: [PrismaModule],
  providers: [SkillsService, SkillsResolver],
  exports: [SkillsService],
})
export class SkillsModule {}
