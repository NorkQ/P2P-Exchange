import { CreateTransactionDto } from './dto/createTransaction.dto';
export declare class TransactionController {
    allTransactions(): string;
    findOne(id: string): string;
    create(body: CreateTransactionDto): CreateTransactionDto;
}
