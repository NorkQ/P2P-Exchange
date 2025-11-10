import { Module } from '@nestjs/common';
import { BankTransferController } from './bank-transfer.controller';
import { BankTransferService } from './bank-transfer.service';
import { InvestmentsModule } from '../investments/investments.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [InvestmentsModule, PrismaModule],
  controllers: [BankTransferController],
  providers: [BankTransferService],
})
export class BankTransferModule {}