import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Transactions} from "../entities/transaction.entity"
import { Users} from "../entities/user.entity"
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports:[
          TypeOrmModule.forFeature([Users,Transactions])
      ],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
