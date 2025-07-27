import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { HttpSessionGuard } from 'src/guard/http.session.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('/items')
  async getShopItems() {
    return this.shopService.getAvailablePokemonItems();
  }

  @Post('/purchase')
  @UseGuards(HttpSessionGuard)
  async purchaseItem(@Req() req, @Body('itemId') itemId: number) {
    return this.shopService.purchaseItem(req.user, itemId);
  }
}
