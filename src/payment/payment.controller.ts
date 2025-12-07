import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Headers,
  UseGuards,
  Req
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments/paystack')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('initiate')
 async initiate(@Req() req: any, @Body('amount') amount: number) {
   
    const user = req.user;

    if (!user) {
      throw new Error('User not authenticated');
    }


    const payment = await this.paymentService.initiatePayment(amount, user.id);

    return payment;
  }



  @UseGuards(AuthGuard('jwt'))
 @Get(':reference/status')
  async status(@Param('reference') reference: string, @Query('refresh') refresh?: string) {
    const refreshFlag = refresh === 'true';
    const p = await this.paymentService.getStatus(reference, refreshFlag);
    return {
      reference: p.reference,
      status: p.status,
      amount: p.amount,
      paid_at: p.paidAt,
    };
  }
}


