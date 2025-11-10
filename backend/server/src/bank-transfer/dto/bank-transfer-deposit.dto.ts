export class BankTransferDepositDto {
  amount: number | string;
  user: {
    id: string;
    name?: string;
    surname?: string;
    username?: string;
    tc_number?: string;
    email?: string;
    phone?: string;
  };
  transaction_id: string;
  success_url?: string;
  fail_url?: string;
}