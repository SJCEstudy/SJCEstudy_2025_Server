// src/redis/redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async setSession(sessionId: string, data: any, ttlSeconds = 3600) {
    await this.client.set(
      `session:${sessionId}`,
      JSON.stringify(data),
      'EX',
      ttlSeconds,
    );
  }

  async expireExtend(sessionId: string) {
    await this.client.expire(sessionId, 3600);
  }

  async getSession(sessionId: string) {
    const raw = await this.client.get(`session:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async deleteSession(sessionId: string) {
    await this.client.del(`session:${sessionId}`);
  }

  async getSessionIdByUserId(userId: number): Promise<string | null> {
    return await this.client.get(`user:${userId}`);
  }

  async setUserSessionMap(userId: number, sessionId: string, ttl = 3600) {
    await this.client.set(`user:${userId}`, sessionId, 'EX', ttl);
  }

  async createRoom(roomId: string, leaderId: number, bossPokemonId: number) {
    await this.client.set(`room:${roomId}:leader`, leaderId);
    await this.client.set(`room:${roomId}:boss`, bossPokemonId);
    await this.client.set(`room:${roomId}:memberOrder`, '0');
  }

  async getMemberCount(roomId: string) {
    return await this.client.llen(`room:${roomId}:members`);  
  }

  async isMember(roomId: string, userSeq: string): Promise<boolean> {
    const rawMembers = await this.client.lrange(`room:${roomId}:members`, 0, -1);
    return rawMembers.some((raw) => {
      try {
        const parsed = JSON.parse(raw);
        return parsed.userSeq === parseInt(userSeq);
      } catch {
        return false;
      }
    });
  }

  async joinRoom(roomId: string, userSeq: number, userId: string, pokemonId: number) {
    const key = `room:${roomId}:members`;
    const order = await this.client.incr(`room:${roomId}:memberOrder`);
    const memberData = JSON.stringify({ userSeq: userSeq, userId, pokemonId, order });
    await this.client.rpush(key, memberData);
    await this.client.set(`user:${userSeq}:room`, roomId);
  }

  async leaveRoom(roomId: string, userSeq: number) {
    const key = `room:${roomId}:members`;
    const members = await this.client.lrange(key, 0, -1);

    for (const member of members) {
      try {
        const parsed = JSON.parse(member);

        console.log(userSeq);
        console.log(parsed);

        if (parsed.userSeq === userSeq) {
          await this.client.lrem(key, 0, member);
          break;
        }
      } catch {
        continue;
      }
    }

    await this.client.del(`user:${userSeq}:room`);
  }

  async removeRoom(roomId: string) {
    await this.client.del(`room:${roomId}:members`);
    await this.client.del(`room:${roomId}:leader`);
    await this.client.del(`room:${roomId}:boss`);
    await this.client.del(`room:${roomId}:memberOrder`);
  }

  async getUserRoom(userId: number) {
    return await this.client.get(`user:${userId}:room`);
  }

  async getRooms() {
    return await this.client.keys('room:*:members');
  }

  async getRoomMembers(roomId: string): Promise<string[]> {
    return await this.client.lrange(`room:${roomId}:members`, 0, -1);
  }

  async getRoomLeader(roomId: string): Promise<number> {
    const leader = await this.client.get(`room:${roomId}:leader`);
    if (!leader) {
      throw new Error();
    }
    return parseInt(leader);
  }

  async getRoomBoss(roomId: string): Promise<number> {
    const boss = await this.client.get(`room:${roomId}:boss`);
    if (!boss) {
      throw new Error();
    }
    return parseInt(boss);
  }

  async setBattleState(roomId: string, battleState: Object) {
    await this.client.set(`room:${roomId}:battleState`, JSON.stringify(battleState));
  }

  async getBattleState(roomId: string) {
    const battleState = await this.client.get(`room:${roomId}:battleState`);
    if (!battleState) {
      throw new Error();
    }
    return JSON.parse(battleState);
  }

  async removeBattleState(roomId: string) {
    await this.client.del(`raid:${roomId}:state`);
  }

  async removeUserRoomMapping(userId: number) {
    await this.client.del(`user:${userId}:room`);
  }

}
