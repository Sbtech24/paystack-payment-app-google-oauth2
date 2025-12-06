import { Injectable, UnauthorizedException } from '@nestjs/common';
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
     const user = await this.txRepo.manager.getRepository('Users').findOne({ where: { id: userId } });
     if (!user) throw new UnauthorizedException('User not found');
    const res = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount,
        email: "bajomosemilore@gmail.com" // use user's email
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
    });

    await this.txRepo.save(tx);

    return { reference, authorization_url };
  }

  async handleWebhook(headers, payload) {
    const signature = headers['x-paystack-signature'];

    const hash = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new UnauthorizedException('Invalid signature');
    }

    const event = payload.event;
    const data = payload.data;

    const tx = await this.txRepo.findOne({
      where: { reference: data.reference },
    });

    if (tx) {
      tx.status = data.status;
      tx.paidAt = data.paid_at;
      await this.txRepo.save(tx);
    }

    return { status: true };
  }

  async getStatus(reference: string) {
    return this.txRepo.findOne({ where: { reference } });
  }
}
