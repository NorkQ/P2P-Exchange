import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransferDepositDto } from '../bank-transfer/dto/bank-transfer-deposit.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBankTransferInvestment(
    userId: string,
    dto: BankTransferDepositDto,
    assignment?: { teamId?: string; bankAccountId?: string; summary?: Record<string, any> }
  ) {
    const rawAmount = dto.amount;
    const amountStr = typeof rawAmount === 'number' ? rawAmount.toString() : String(rawAmount);
    if (!amountStr || isNaN(Number(amountStr))) throw new BadRequestException('Invalid amount');

    const amount = new Prisma.Decimal(amountStr);
    const paymentInfo: Prisma.InputJsonValue = {
      user: dto.user ?? {},
      transaction_id: dto.transaction_id,
      assignment: assignment?.summary ?? null,
    };

    const record = await this.prisma.investments.create({
      data: {
        amount: amount,
        type: 'bank_transfer',
        provider_transaction_id: dto.transaction_id,
        success_url: dto.success_url,
        fail_url: dto.fail_url,
        created_by: userId,
        team_id: assignment?.teamId,
        bank_account_id: assignment?.bankAccountId,
        payment_info: paymentInfo,
      },
    });

    return record;
  }
}