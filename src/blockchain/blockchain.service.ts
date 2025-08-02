import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ERC20ABI } from './abi/erc20';
import { decrypt } from 'src/utils/util.crypto';
import { User } from 'src/user/user.entity';
import { CONTRACT_ADDRESS, OWNER_PRIVATE_KEY, RPC_URL } from './blockchain.constants';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private ownerWallet: ethers.Wallet;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    this.ownerWallet = new ethers.Wallet(OWNER_PRIVATE_KEY, this.provider);
  }

  private getContract(signerOrProvider: ethers.Signer | ethers.providers.Provider): ethers.Contract {
    return new ethers.Contract(CONTRACT_ADDRESS, ERC20ABI, signerOrProvider);
  }

  async getBalance(user: User) {
    if (!user.address) {
      throw new Error('no addresss');
    }

    const contract = this.getContract(this.provider);
    const balance = await contract.balanceOf(user.address);
    return {
      balance: ethers.utils.formatUnits(balance, 18)
    }
  }

  async deductTokens(user: User, amount: string) {
    const decrypted = decrypt(user.private_key);
    const userWallet = new ethers.Wallet(decrypted, this.provider);
    const contract = this.getContract(userWallet);
    const value = ethers.utils.parseUnits(amount, 18);
    const tx = await contract.transfer(this.ownerWallet.address, value);
    await tx.wait();
    return {
      txHash: tx.hash
    }
  }

  async grantTokens(user: User, amount: string) {
    const contract = this.getContract(this.ownerWallet);
    const value = ethers.utils.parseUnits(amount, 18);
    const tx = await contract.transfer(user.address, value);
    await tx.wait();
    return {
      txHash: tx.hash
    }
  }
}
