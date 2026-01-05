import { Module } from '@nestjs/common';
import { SeniorityHistoryResolver } from './seniority-history.resolver';
import { SeniorityHistoryService } from './seniority-history.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SeniorityHistoryResolver, SeniorityHistoryService],
  exports: [SeniorityHistoryService],
})
export class SeniorityHistoryModule {}
