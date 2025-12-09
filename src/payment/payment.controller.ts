import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Headers,
  UseGuards,
  Req,
  HttpCode
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('wallet/')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('deposit')
  async initiate(@Req() req: any, @Body('amount') amount: number) {
    const user = req.user;

    if (!user) {
      throw new Error('User not authenticated');
    }
    const payment = await this.paymentService.initiatePayment(amount, user.id);
    return payment;
  }


@Post('paystack/webhook')
@HttpCode(200)
handleWebhook(@Req() req) {
  return this.paymentService.handleWebhook(req);
}


  @UseGuards(AuthGuard('jwt'))
@Post('transfer')
transfer(@Req() req, @Body() body: { wallet_number: string; amount: number }) {
  return this.paymentService.transfer(
    req.user.id,
    body.wallet_number,
    body.amount,
  );
}
  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  async balance(@Req() req: any,) {
    const user = req.user
   
    const balance = await this.paymentService.getbalance(user.id);
    return {
     balance:balance
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('transactions')
  async transactions(@Req() req:any) {

    const user = req.user
    const transactions = await this.paymentService.getTransactions(user.id);
    return transactions

  }

  @UseGuards(AuthGuard('jwt'))
  @Get('deposit/:reference/status')
  async status(
    @Param('reference') reference: string,
    @Query('refresh') refresh?: string,
  ) {
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

