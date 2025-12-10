import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { Users } from 'src/entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from 'src/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule,
    ApiKeyModule,
    TypeOrmModule.forFeature([Users,Transactions,Wallet]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
