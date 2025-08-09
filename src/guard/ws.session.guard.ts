import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class WsSessionGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const sessionId = client.handshake.headers['sessionid'];

    if (!sessionId || typeof sessionId !== 'string') {
      throw new UnauthorizedException('Missing session ID');
    }

    const session = await this.redisService.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // await this.redisService.expireExtend(sessionId);

    client['user'] = session;
    return true;
  }
}
