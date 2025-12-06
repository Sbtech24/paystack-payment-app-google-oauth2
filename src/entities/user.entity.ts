import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Transactions } from './transaction.entity';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Use UUID for better scalability

  @Column({ unique: true })
  email: string;

  @Column()
  displayname: string;

  @Column({ nullable: true })
  picture: string; // Google profile picture

  @Column({ default: 'google' })
  provider: string; // e.g., 'google', useful for future auth providers

  @OneToMany(() => Transactions, (transaction) => transaction.user)
  transactions: Transactions[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
