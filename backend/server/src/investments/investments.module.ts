import { Module } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InvestmentsService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}