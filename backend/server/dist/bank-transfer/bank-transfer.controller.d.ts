import { BankTransferService } from './bank-transfer.service';
import { BankTransferDepositDto } from './dto/bank-transfer-deposit.dto';
export declare class BankTransferController {
    private readonly bankTransferService;
    constructor(bankTransferService: BankTransferService);
    deposit(dto: BankTransferDepositDto, req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.transaction_status | null;
        provider_transaction_id: string | null;
        merchant_id: string | null;
        team_id: string | null;
        customer_id: string | null;
        bank_account_id: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        system_commission: import("@prisma/client/runtime/library").Decimal | null;
        broker_commission: import("@prisma/client/runtime/library").Decimal | null;
        team_commission: import("@prisma/client/runtime/library").Decimal | null;
        success_url: string | null;
        fail_url: string | null;
        hash: string | null;
        payment_url: string | null;
        payment_info: import("@prisma/client/runtime/library").JsonValue | null;
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
