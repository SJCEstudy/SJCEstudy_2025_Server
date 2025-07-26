import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RedisService } from 'src/redis/redis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private redisService: RedisService,
  ) {}

  async register(id: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({ id: id, password: hashed });
    return this.userRepo.save(user);
  }



  async validateUser(id: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;



    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  
  async findByIdOrFail(seq: number): Promise<User> {
    return this.userRepo.findOneOrFail({ where: { seq: seq } });
  }
}