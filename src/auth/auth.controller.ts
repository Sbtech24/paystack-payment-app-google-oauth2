import { 
  Controller, 
  Get, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleAuthGuard } from './utils/Guards';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 200, description: 'Redirects user to Google login' })
  handleLogin() {
    return { msg: 'google authentication' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback URL' })
  @ApiResponse({
    status: 200,
    description: 'Handles Google OAuth redirect and returns JWT + User info',
    schema: {
      example: {
        user_id: 'uuid',
        email: 'test@gmail.com',
        displayname: 'John Doe',
        token: 'jwt-token',
        wallet: '1234567890'
      },
    },
  })
  async handleRedirect(@Req() req: any) {
    const user = await this.authService.validateUser({
      email: req.user.email,
      displayname: req.user.displayName,
    });

    const jwt = this.authService.generateJwt(user);
    const wallet = await this.authService.generateWallet(user.id);

    return {
      user_id: user.id,
      email: user.email,
      displayname: user.displayname,
      token: jwt,
      wallet: wallet.WalletNumber,
    };
  }
}
