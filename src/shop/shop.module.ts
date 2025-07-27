import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopController } from './shop.controller';
import { Shop } from './shop.entity';
import { ShopService } from './shop.service';
import { UserModule } from 'src/user/user.module';
import { Poketmon } from 'src/pokemon/pokemon.entity';
import { PoketmonModule } from 'src/pokemon/pokemon.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, Poketmon]), PoketmonModule, UserModule],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}