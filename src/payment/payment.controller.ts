import {
  Controller,
  Post,
  Body,
  Get,
  Param,
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
  async status(@Param('reference') reference: string) {
    return this.paymentService.getStatus(reference);
  }
}


