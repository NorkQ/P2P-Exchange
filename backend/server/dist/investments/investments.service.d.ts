import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransferDepositDto } from '../bank-transfer/dto/bank-transfer-deposit.dto';
export declare class InvestmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createBankTransferInvestment(userId: string, dto: BankTransferDepositDto, assignment?: {
        teamId?: string;
        bankAccountId?: string;
        summary?: Record<string, any>;
    }): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.transaction_status | null;
        provider_transaction_id: string | null;
        merchant_id: string | null;
        team_id: string | null;
        customer_id: string | null;
        bank_account_id: string | null;
        amount: Prisma.Decimal | null;
        system_commission: Prisma.Decimal | null;
        broker_commission: Prisma.Decimal | null;
        team_commission: Prisma.Decimal | null;
        success_url: string | null;
        fail_url: string | null;
        hash: string | null;
        payment_url: string | null;
        payment_info: Prisma.JsonValue | null;
        type: string | null;
        swap_account_name: string | null;
        swap_account_number: string | null;
        bank_account_detail_id: string | null;
        transactor_by: string | null;
        created_by: string | null;
        update_count: number | null;
        created_at: Date;
        updated_at: Date | null;
        approved_at: Date | null;
        rejected_at: Date | null;
        refunded_at: Date | null;
    }>;
}
