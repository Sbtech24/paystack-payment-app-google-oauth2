import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKeys } from '../entities/api-key.entity';
import { Users } from '../entities/user.entity';
import { randomBytes } from 'crypto';
import dayjs from 'dayjs';

@Injectable()
export class ApiKeyService {
  constructor(@InjectRepository(ApiKeys) private apiKeyRepo: Repository<ApiKeys>) {}

  private parseExpiry(expiry: string) {
    switch (expiry) {
      case '1H': return dayjs().add(1, 'hour').toDate();
      case '1D': return dayjs().add(1, 'day').toDate();
      case '1M': return dayjs().add(1, 'month').toDate();
      case '1Y': return dayjs().add(1, 'year').toDate();
      default: throw new BadRequestException('Invalid expiry');
    }
  }

  async createApiKey(user: Users, name: string, permissions: string[], expiry: string) {
    const activeKeys = await this.apiKeyRepo.count({ where: { user, revoked: false, expiresAt: MoreThan(new Date()) } });
    if (activeKeys >= 5) throw new BadRequestException('Maximum 5 active API keys allowed');

    const apiKey = this.apiKeyRepo.create({
      name,
      key: 'sk_' + randomBytes(16).toString('hex'),
      permissions,
      expiresAt: this.parseExpiry(expiry),
      user,
    });

    return this.apiKeyRepo.save(apiKey);
  }

  async rolloverApiKey(expiredKeyId: string, expiry: string) {
    const oldKey = await this.apiKeyRepo.findOne({ where: { id: expiredKeyId } });
    if (!oldKey) throw new NotFoundException('API key not found');
    if (oldKey.expiresAt > new Date()) throw new BadRequestException('API key has not expired yet');

    const newKey = this.apiKeyRepo.create({
      name: oldKey.name,
      key: 'sk_' + randomBytes(16).toString('hex'),
      permissions: oldKey.permissions,
      expiresAt: this.parseExpiry(expiry),
      user: oldKey.user,
    });

    return this.apiKeyRepo.save(newKey);
  }

  async validateKey(key: string, permission: string) {
    const apiKey = await this.apiKeyRepo.findOne({ where: { key, revoked: false } });
    if (!apiKey) throw new BadRequestException('Invalid API key');
    if (apiKey.expiresAt < new Date()) throw new BadRequestException('API key expired');
    if (!apiKey.permissions.includes(permission)) throw new BadRequestException('Permission denied');
    return apiKey.user;
  }
}
