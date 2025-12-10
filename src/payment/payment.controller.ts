import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiProperty,
  ApiParam,
} from '@nestjs/swagger';
import { JwtOrApiKeyGuard } from '../utils/jwt-or-apikey.guard';
import { ApiKeyPermission } from '../decorators/api-key-permission.decorator';


export class DepositDto {
  @ApiProperty({ example: 5000, description: 'Amount to deposit' })
  amount: number;
}

export class TransferDto {
  @ApiProperty({ example: 'wallet_987654321', description: 'Receiver wallet number' })
  wallet_number: string;

  @ApiProperty({ example: 1000, description: 'Amount to transfer' })
  amount: number;
}
export class DepositResponseDto {
  @ApiProperty({ example: 'pay_ref_123456', description: 'Transaction reference' })
  reference: string;

  @ApiProperty({ example: 'https://paystack.com/pay/xyz', description: 'Authorization URL' })
  authorization_url: string;
}

export class TransferResponseDto {
  @ApiProperty({ example: 'Transfer successful', description: 'Message about the transfer' })
  message: string;

  @ApiProperty({ example: 1000, description: 'Transferred amount' })
  amount: number;

  @ApiProperty({ example: 'wallet_987654321', description: 'Receiver wallet number' })
  wallet_number: string;
}

export class BalanceResponseDto {
  @ApiProperty({ example: 5000.5, description: 'Current wallet balance' })
  balance: number;
}

export class StatusResponseDto {
  @ApiProperty({ example: 'pay_ref_123456', description: 'Transaction reference' })
  reference: string;

  @ApiProperty({ example: 'success', description: 'Transaction status' })
  status: string;

  @ApiProperty({ example: 1000, description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ example: '2025-12-10T10:00:00Z', description: 'Payment timestamp' })
  paid_at: string;
}

@ApiTags('Wallet')
@Controller('wallet')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

   @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiKeyPermission('deposit')
  @Post('deposit')
  @ApiOperation({ summary: 'Initiate a deposit' })
  @ApiBody({ type: DepositDto })
  @ApiResponse({ status: 201, description: 'Deposit initiated successfully', type: DepositResponseDto })
  async initiate(@Req() req: any, @Body() body: DepositDto) {
    const user = req.user;
    if (!user) throw new Error('User not authenticated');
    return this.paymentService.initiatePayment(body.amount, user.id);
  }

  @Post('paystack/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Paystack webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  handleWebhook(@Req() req) {
    return this.paymentService.handleWebhook(req);
  }

  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiKeyPermission('transfer')
  @Post('transfer')
  @ApiOperation({ summary: 'Transfer money to another wallet' })
  @ApiBody({ type: TransferDto })
  @ApiResponse({ status: 201, description: 'Transfer completed successfully', type: TransferResponseDto })
  transfer(@Req() req, @Body() body: TransferDto) {
    return this.paymentService.transfer(
      req.user.id,
      body.wallet_number,
      body.amount,
    );
  }

  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiKeyPermission('read')
  @Get('balance')
  @ApiOperation({ summary: 'Get current wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns wallet balance', type: BalanceResponseDto })
  async balance(@Req() req: any) {
    const balance = await this.paymentService.getbalance(req.user.id);
    return { balance };
  }

  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiKeyPermission('read')
  @Get('transactions')
  @ApiOperation({ summary: 'Get all wallet transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async transactions(@Req() req: any) {
    return this.paymentService.getTransactions(req.user.id);
  }

  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiKeyPermission('read')
  @Get('deposit/:reference/status')
  @ApiOperation({ summary: 'Get deposit status by reference' })
  @ApiParam({ name: 'reference', type: String, description: 'Transaction reference' })
  @ApiQuery({ name: 'refresh', required: false, description: 'Refresh status from Paystack', type: String })
  @ApiResponse({ status: 200, description: 'Deposit status returned', type: StatusResponseDto })
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
