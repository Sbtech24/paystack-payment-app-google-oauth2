import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'src/entities/wallet.entity';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';


@Injectable()
export class PaymentService {
  private secretKey: string;
  private webhookSecret: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Transactions)
    private txRepo: Repository<Transactions>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {
    this.secretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    this.webhookSecret =
      this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET') || '';
  }

  async initiatePayment(amount: number, userId: string) {
    if (!amount) throw new BadRequestException('Invalid amount');

    const user = await this.txRepo.manager
      .getRepository('Users')
      .findOne({ where: { id: userId } });
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
        amount: paystackAmount,
        email: user.email,
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      },
    );

    const { reference, authorization_url } = res.data.data;

    const type  = "deposit"

    const tx = this.txRepo.create({
      reference,
      amount,
      user,
      type:type,
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
        { headers: { Authorization: `Bearer ${this.secretKey}` } },
      );
    } catch (err) {
      throw new InternalServerErrorException(
        err.response?.data?.message || 'Could not verify transaction',
      );
    }

    const data = response.data.data;

    tx.status = data.status;
    tx.paidAt = data.paid_at;

    await this.txRepo.save(tx);

    return tx;
  }

  async getbalance(userId: string) {
    const user = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!user) throw new UnauthorizedException('User not found');

    return user.balance;
  }
  async getTransactions(userId: string) {
    const user = await this.txRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!user) throw new UnauthorizedException('User not found');

    const transactions = user.map((item) => {
      return {
        type: item.type,
        amount: item.amount,
        status: item.status,
      };
    });

    return transactions;
  }

  async handleWebhook(req: any) {
    const signature = req.headers['x-paystack-signature'];

    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(req.rawBody) // raw body is required
      .digest('hex');

    if (hash !== signature) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    const event = req.body.event;
    const data = req.body.data;

    const reference = data.reference;

    // Find transaction
    const tx = await this.txRepo.findOne({
      where: { reference },
      relations: ['user'],
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    // Idempotency: If already processed, ignore
    if (tx.status === 'success') {
      return { status: true, message: 'Already processed' };
    }


    tx.status = data.status;
    tx.paidAt = data.paid_at;
    console.log(data.amount);

    await this.txRepo.save(tx);

    
    if (data.status === 'success') {
      const wallet = await this.walletRepo.findOne({
        where: { user: { id: tx.user.id } },
        relations: ['user'],
      });

      if (!wallet) throw new NotFoundException('Wallet not found');
     const amountInNaira = new Decimal(data.amount).dividedBy(100);
    wallet.balance = new Decimal(wallet.balance).plus(amountInNaira).toFixed(2);
      await this.walletRepo.save(wallet);
    }

    return { status: true };
  }

async transfer(senderId: string, receiverWalletNo: string, amount: number) {
  if (amount <= 0) throw new BadRequestException('Invalid amount');

  // Fetch sender and receiver wallets
  const [sender, receiver] = await Promise.all([
    this.walletRepo.findOne({ where: { user: { id: senderId } }, relations: ['user'] }),
    this.walletRepo.findOne({ where: { WalletNumber: receiverWalletNo }, relations: ['user'] }),
  ]);

  if (!sender) throw new NotFoundException('Sender wallet not found');
  if (!receiver) throw new NotFoundException('Receiver wallet not found');
  if (receiver.user.id === senderId) throw new BadRequestException('Cannot transfer to yourself');

  const senderBalance = new Decimal(sender.balance);
  const transferAmount = new Decimal(amount);

  if (senderBalance.lessThan(transferAmount)) throw new BadRequestException('Insufficient balance');

  // Begin atomic transaction
  await this.walletRepo.manager.transaction(async (manager) => {
    // Update balances safely using Decimal.js
    sender.balance = senderBalance.minus(transferAmount).toFixed(2);
    receiver.balance = new Decimal(receiver.balance).plus(transferAmount).toFixed(2);

    await manager.save(sender);
    await manager.save(receiver);

    // Create transaction logs
    const senderTx = this.txRepo.create({
      user: sender.user,
      amount,
      type: 'transfer',
      status: 'success',
    });

    const receiverTx = this.txRepo.create({
      user: receiver.user,
      amount,
      type: 'transfer',
      status: 'success',
    });

    await manager.save([senderTx, receiverTx]);
  });

  return {
    status: 'success',
    message: 'Transfer completed successfully',
  };
}
}
