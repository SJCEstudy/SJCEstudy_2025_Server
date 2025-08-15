import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { UserModule } from 'src/user/user.module';

import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { PoketmonModule } from 'src/pokemon/pokemon.module';
import { RedisModule } from 'src/redis/redis.module';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [RedisModule, UserModule, PoketmonModule, BlockchainModule],
  providers: [RoomGateway, RoomService],
  controllers: [RoomController],
})
export class RoomModule {}