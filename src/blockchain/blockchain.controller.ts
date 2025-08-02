import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { HttpSessionGuard } from 'src/guard/http.session.guard';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
  ) {}

  @UseGuards(HttpSessionGuard)
  @Get('balance')
  async getBalance(@Req() req: any) {
    return this.blockchainService.getBalance(req.user);
  }

  @UseGuards(HttpSessionGuard)
  @Post('deduct')
  async deductTokens(@Req() req: any, @Body('amount') amount: string) {
    return this.blockchainService.deductTokens(req.user, amount);
  }

  @UseGuards(HttpSessionGuard)
  @Post('grant')
  async grantTokens(@Req() req: any, @Body('amount') amount: string) {
    return this.blockchainService.grantTokens(req.user, amount);
  }
}