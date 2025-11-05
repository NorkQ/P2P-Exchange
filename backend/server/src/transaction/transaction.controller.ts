import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateTransactionDto } from './dto/createTransaction.dto';

@Controller('transaction')
export class TransactionController {
    @Get('all')
    allTransactions(){
        return 'All Transactions';
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return id;
    }

    @Post('create')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true}))
    create(@Body() body: CreateTransactionDto){
        return body;
    }
}
