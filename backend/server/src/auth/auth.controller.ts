import { Controller, Get, Req } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Req() req: any) {
    return { user: req.user };
  }
}