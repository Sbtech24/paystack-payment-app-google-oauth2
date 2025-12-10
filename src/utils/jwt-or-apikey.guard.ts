import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiKeyService } from '../api-key/api-key.service';
import { Request } from 'express';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private apiKeyService: ApiKeyService,
  ) {}


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const requiredPermission = (context.getHandler() as any).requiredApiKeyPermission || 'read';

    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.verify(token);
        request['user'] = decoded;
        return true;
      } catch (err) {
   
      }
    }

 
    const apiKey = request.headers['x-api-key'] as string;
    if (apiKey) {
      try {
        const user = await this.apiKeyService.validateKey(apiKey, requiredPermission);
        request['user'] = user;
        return true;
      } catch (err) {
        throw new UnauthorizedException('Invalid API key or insufficient permissions');
      }
    }

    throw new UnauthorizedException('No valid authentication provided');
  }
}
