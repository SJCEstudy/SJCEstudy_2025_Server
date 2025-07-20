import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { v4 as uuidv4, v4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';
import { LoginReqDto, LoginResDto, RegistrationReqDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegistrationReqDto) {
    return this.userService.register(dto.id, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginReqDto): Promise<LoginResDto> {
    const user = await this.userService.validateUser(
      dto.id,
      dto.password,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const existingSessionId = await this.redisService.getSessionIdByUserId(
      user.seq,
    );
    if (existingSessionId) {
      await this.redisService.deleteSession(existingSessionId);
    }

    const sessionId = uuidv4();
    await this.redisService.setSession(sessionId, {
      seq: user.seq,
      id: user.id,
    });

    await this.redisService.setUserSessionMap(user.seq, sessionId);

    return {
      sessionId: sessionId,
      seq: user.seq,
      id: user.id
    };
  }
}