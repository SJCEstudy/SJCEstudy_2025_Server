import { Injectable } from '@nestjs/common/decorators';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PoketmonService } from 'src/pokemon/pokemon.service';
import { RedisService } from 'src/redis/redis.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ethers } from 'ethers';
import { encrypt } from 'src/utils/util.crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly pokemonService: PoketmonService,
    private redisService: RedisService,
  ) {}

  async register(id: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({ id: id, password: hashed });
    const save = await this.userRepo.save(user);
    await this.pokemonService.giveStarterPokemon(save.seq);

    return save;
  }

  async walletLink(seq: number, privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    const encryptedPrivateKey = encrypt(privateKey);
    const updateResult = await this.userRepo.update(seq, {
      address: wallet.address,
      private_key: encryptedPrivateKey,
    });

    return updateResult;
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