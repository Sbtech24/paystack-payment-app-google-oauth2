import { SetMetadata } from '@nestjs/common';

export const ApiKeyPermission = (permission: 'read' | 'deposit' | 'transfer') =>
  SetMetadata('requiredApiKeyPermission', permission);
