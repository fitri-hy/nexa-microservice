import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { redisConfig } from '../../config/redis.config';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static forRoot(enabled: boolean): DynamicModule {
    if (!enabled) {
      return { module: RedisModule };
    }

    return {
      module: RedisModule,
      imports: [ConfigModule.forFeature(redisConfig)],
      providers: [
        {
          provide: RedisService,
          inject: [redisConfig.KEY],
          useFactory: (config: ConfigType<typeof redisConfig>) => {
            return new RedisService(config);
          },
        },
      ],
      exports: [RedisService],
      global: true,
    };
  }
}
