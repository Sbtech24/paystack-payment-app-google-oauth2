import { Injectable, UnauthorizedException, 
  BadRequestException, 
  NotFoundException, 
  InternalServerErrorException  } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private secretKey: string;
  private webhookSecret: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Transactions)
    private txRepo: Repository<Transactions>,
  ) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    this.webhookSecret = this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET') || '';
  }

  async initiatePayment(amount: number, userId: string) {
    if (!amount)
      throw new BadRequestException('Invalid amount');

     const user = await this.txRepo.manager.getRepository('Users').findOne({ where: { id: userId } });
     if (!user) throw new UnauthorizedException('User not found');

     const existing = await this.txRepo.findOne({
      where: { user, amount, status: 'pending' },
    });

    if (existing) {
      return {
        reference: existing.reference,
        authorization_url: existing.authorizationUrl,
        idempotent: true,
      };
    }
    const paystackAmount = amount * 100;

    const res = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount:paystackAmount,
        email: user.email 
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }
    );

    const { reference, authorization_url } = res.data.data;

    
    const tx = this.txRepo.create({
      reference,
      amount,
      user,
      status: 'pending',
      authorizationUrl: authorization_url,
    });

    await this.txRepo.save(tx);

    return { reference, authorization_url };
  }


async getStatus(reference: string, refresh = false) {
    const tx = await this.txRepo.findOne({ where: { reference } });
    if (!tx) throw new NotFoundException('Transaction not found');

    if (!refresh) return tx;

   
    let response;
    try {
      response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${this.secretKey}` } }
      );
    } catch (err) {
      throw new InternalServerErrorException(
        err.response?.data?.message || 'Could not verify transaction'
      );
    }

    const data = response.data.data;

    tx.status = data.status;
    tx.paidAt = data.paid_at;

    await this.txRepo.save(tx);

    return tx;
  }
}
