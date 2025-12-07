import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './user.entity';

export type TransactionStatus = 'pending' | 'success' | 'failed';

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.transactions, { onDelete: 'SET NULL' })
  user: Users;

  @Column()
  reference: string;

  @Column({ nullable: true })
  authorizationUrl: string;

  @Column({ type: 'int' })
  amount: number; 

  @Column({ type: 'varchar', default: 'pending' })
  status: TransactionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
