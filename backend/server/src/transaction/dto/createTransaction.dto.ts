import { IsString, Length } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @Length(36, 36)
    id: string;
    @IsString()
    fromCurrency: string;
    @IsString()
    toCurrency: string;
}