
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { Transactions } from './entities/transaction.entity';
import { PaymentModule } from './payment/payment.module';
import { Wallet } from './entities/wallet.entity';
import { ApiKeyModule } from './api-key/api-key.module';
import { ApiKeys } from './entities/api-key.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URI'),
        ssl: {
          rejectUnauthorized: false,
        },
        entities:[Users,Transactions,Wallet,ApiKeys],
        logging:true,
        synchronize: true,
      }),
    }),
    PassportModule.register({session:true}),

    AuthModule,
    PaymentModule,
    ApiKeyModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
