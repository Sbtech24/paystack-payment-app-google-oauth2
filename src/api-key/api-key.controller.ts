import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';


export class CreateApiKeyDto {
  @ApiProperty({ example: 'My Key', description: 'Name of the API key' })
  name: string;

  @ApiProperty({
    example: ['deposit', 'transfer'],
    description: 'Permissions assigned to the API key',
    isArray: true,
  })
  permissions: string[];

  @ApiProperty({ example: '1D', description: 'Expiry of API key (1H, 1D, 1M, 1Y)' })
  expiry: '1H' | '1D' | '1M' | '1Y';
}

export class RolloverApiKeyDto {
  @ApiProperty({ example: '1D', description: 'New expiry for the API key' })
  expiry: '1H' | '1D' | '1M' | '1Y';
}

export class ValidateApiKeyDto {
  @ApiProperty({ example: 'sk_abcd1234efgh5678', description: 'API key string' })
  key: string;

  @ApiProperty({ example: 'deposit', description: 'Permission to validate' })
  permission: string;
}


export class ApiKeyResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'API key ID' })
  id: string;

  @ApiProperty({ example: 'My Key', description: 'Name of the API key' })
  name: string;

  @ApiProperty({ example: 'sk_abcd1234efgh5678', description: 'API key string' })
  key: string;

  @ApiProperty({
    example: ['deposit', 'transfer'],
    description: 'Permissions assigned to the API key',
    isArray: true,
  })
  permissions: string[];

  @ApiProperty({ example: '2025-12-11T10:00:00Z', description: 'Expiry timestamp' })
  expiresAt: Date;

  @ApiProperty({ example: false, description: 'Whether the API key is revoked' })
  revoked: boolean;
}

export class ValidateApiKeyResponseDto {
  @ApiProperty({ example: true, description: 'API key validity' })
  valid: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;
}


@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiResponse({ status: 201, description: 'API key created successfully', type: ApiKeyResponseDto })
  async createApiKey(@Req() req: any, @Body() body: CreateApiKeyDto) {
    return this.apiKeyService.createApiKey(
      req.user,
      body.name,
      body.permissions,
      body.expiry,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('rollover/:id')
  @ApiOperation({ summary: 'Rollover an expired API key' })
  @ApiParam({ name: 'id', description: 'Expired API key ID' })
  @ApiBody({ type: RolloverApiKeyDto })
  @ApiResponse({ status: 201, description: 'API key rolled over successfully', type: ApiKeyResponseDto })
  async rolloverApiKey(
    @Param('id') expiredKeyId: string,
    @Body() body: RolloverApiKeyDto,
  ) {
    return this.apiKeyService.rolloverApiKey(expiredKeyId, body.expiry);
  }

//   @UseGuards(AuthGuard('jwt'))
//   @ApiBearerAuth()
//   @Post('validate')
//   @ApiOperation({ summary: 'Validate an API key' })
//   @ApiBody({ type: ValidateApiKeyDto })
//   @ApiResponse({ status: 200, description: 'API key is valid', type: ValidateApiKeyResponseDto })
//   async validateKey(@Body() body: ValidateApiKeyDto) {
//     const user = await this.apiKeyService.validateKey(
//       body.key,
//       body.permission,
//     );

//     return {
//       valid: true,
//       userId: user.id,
//       email: user.email,
//     };
//   }
}
