import { DynamicModule, Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { RedisService } from "./redis.service";

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async () => new Redis({ host: 'localhost', port: 6379 }),
        },
        RedisService,
      ],
      exports: ['REDIS_CLIENT', RedisService],
    };
  }
}
