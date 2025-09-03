// src/modules/redis/redis.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { redisConfig } from '../../config/redis.config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private client: any;

  constructor(config: ConfigType<typeof redisConfig>) {
    if (process.env.REDIS_DUMMY === 'true') {
      this.logger.warn('RedisService running in DUMMY mode');
      const dummy = new Map<string, string>();
      this.client = {
        get: async (key: string) => dummy.get(key) || null,
        set: async (key: string, value: string) => dummy.set(key, value),
        del: async (key: string) => dummy.delete(key),
        on: () => {},
      };
    } else {
      this.client = new Redis({
        host: config.host,
        port: config.port,
      });
      this.client.on('error', (err: Error) => {
        this.logger.warn(`Error connecting: ${err.message}`);
      });
      this.logger.log(`Connected to Redis at ${config.host}:${config.port}`);
    }
  }

  async get(key: string) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    const val = JSON.stringify(value);
    if (ttlSeconds && this.client.set.length > 1) {
      await this.client.set(key, val, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, val);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
