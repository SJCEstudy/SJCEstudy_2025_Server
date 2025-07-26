import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class HttpSessionGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const sessionId = request.headers['authorization'] || request.query.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('authorization header is emptry');
    }
    const session = await this.redisService.getSession(sessionId);
    if (!session) {
      throw new Error('redis session is emptry');
    }
    // await this.redisService.expireExtend(sessionId);
    const user = await this.userService.findByIdOrFail(session.seq);
    request['user'] = user;
    return true;
  }
}