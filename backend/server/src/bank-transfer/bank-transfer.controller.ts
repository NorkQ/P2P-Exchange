import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { BankTransferService } from './bank-transfer.service';
import { BankTransferDepositDto } from './dto/bank-transfer-deposit.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('deposit')
export class BankTransferController {
  constructor(private readonly bankTransferService: BankTransferService) {}

  @Post('bank-transfer')
  @Roles('API')
  async deposit(@Body() dto: BankTransferDepositDto, @Req() req: any) {
    const authUserId: string | undefined = req?.user?.id;
    if (!authUserId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.bankTransferService.depositViaBankTransfer(authUserId, dto);
  }
}