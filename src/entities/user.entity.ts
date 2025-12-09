import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Transactions } from './transaction.entity';
import { Wallet } from './wallet.entity';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({ unique: true })
  email: string;

  @Column()
  displayname: string;

  @Column({ nullable: true })
  picture: string; 

  @Column({ default: 'google' })
  provider: string; // e.g., 'google', useful for future auth providers

  @OneToOne(()=>Wallet,(wallet)=>wallet.user)
  wallet:Wallet;

  @OneToMany(() => Transactions, (transaction) => transaction.user)
  transactions: Transactions[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
