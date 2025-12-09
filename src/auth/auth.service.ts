import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDetails } from 'src/utils/types';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Wallet } from 'src/entities/wallet.entity';
import { createWallet } from './utils/CreateWallet';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    @InjectRepository(Wallet) private readonly walletRepository:Repository<Wallet>
  ) {}
  async validateUser(details: UserDetails) {
    console.log('AuthService');

    console.log(details);
    const user = await this.userRepository.findOneBy({ email: details.email });
    if (user) {
      return user;
    }

    const newUser = this.userRepository.create(details);
    return this.userRepository.save(newUser);
  }

  async findUser(id: string) {
    const user = this.userRepository.findOneBy({ id });
    console.log(user);
    return user;
  }
async generateWallet(userId: string) {
  
  const userWallet = await this.walletRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  if (userWallet) {
    return userWallet; 
  }

  const WalletNumber = await createWallet(); 


  const newWallet = this.walletRepository.create({
    WalletNumber,
    balance: "0",
    user: { id: userId }, 
  });

  return await this.walletRepository.save(newWallet);
}
  generateJwt(user: Users) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
