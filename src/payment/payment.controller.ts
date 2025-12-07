import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments/paystack')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initiate')
  initiate(@Body() body: { amount: number; userId: string }) {
    return this.paymentService.initiatePayment(body.amount, body.userId);
  }

  @Post('webhook')
  async webhook(@Headers() headers, @Body() payload) {
    return this.paymentService.handleWebhook(headers, payload);
  }
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


