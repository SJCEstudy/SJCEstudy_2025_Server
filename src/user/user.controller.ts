
import { UserService } from './user.service';
import { Request } from 'express';
import { v4 as uuidv4, v4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';
import { LoginReqDto, LoginResDto, RegistrationReqDto, WalletLinkReqDto } from './user.dto';
import { AuthenticatedRequest, HttpSessionGuard } from 'src/guard/http.session.guard';
import { PoketmonService } from 'src/pokemon/pokemon.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common/decorators';
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly pokemonService: PoketmonService,
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

  @Get('pokemons')
  @UseGuards(HttpSessionGuard)
  async getUserPokemons(@Req() request: AuthenticatedRequest) {
    return this.pokemonService.getUserPokemons(request['user'].seq);
  }

  @Post('wallet/link')
  @UseGuards(HttpSessionGuard)
  async walletLink(@Req() request: AuthenticatedRequest, @Body() dto: WalletLinkReqDto) {
    return this.userService.walletLink(request['user'].seq, dto.privateKey);
  }

  @Get('test')
  async test() {
    (undefined as any).x();
  }

}