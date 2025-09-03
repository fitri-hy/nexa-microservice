import { Injectable, Optional } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(@Optional() private readonly redisService?: RedisService) {}

  async get(key: string) {
    if (!this.redisService) return null;
    return this.redisService.get(key);
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    if (!this.redisService) return;
    return this.redisService.set(key, value, ttlSeconds);
  }

  async del(key: string) {
    if (!this.redisService) return;
    return this.redisService.del(key);
  }
}
