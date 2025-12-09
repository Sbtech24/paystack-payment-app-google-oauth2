import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity({ name: 'wallet' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  WalletNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: string;

  @Column({ default: 'NGN' })
  currency: string;

  @OneToOne(() => Users, (user) => user.wallet)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
