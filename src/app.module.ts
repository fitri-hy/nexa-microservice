import { Request, Response, NextFunction } from 'express';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { rabbitmqConfig } from './config/rabbitmq.config';
import { kafkaConfig } from './config/kafka.config';
import { jwtConfig } from './config/jwt.config';
import { EnvValidationSchema } from './config/env.validation';

import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { HelmetMiddleware } from './common/middlewares/helmet.middleware';
import { CorsMiddleware } from './common/middlewares/cors.middleware';

import { DatabaseModule } from './common/modules/database.module';
import { StaticModule } from './common/modules/static.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { RedisModule } from './modules/redis/redis.module';
import { CacheService } from './modules/cache/cache.service';

import { EventsModule } from './events/events.module';

import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, rabbitmqConfig, kafkaConfig, jwtConfig],
      validationSchema: EnvValidationSchema,
    }),

    TelemetryModule.forRoot(process.env.TRACING === 'true'),

    DatabaseModule.forRoot(process.env.DB_ENABLED === 'true'),
    StaticModule,

    RedisModule.forRoot(process.env.REDIS_ENABLED === 'true'),
    AuthModule,
    UsersModule,
    HealthModule,
    EventsModule.forRoot(
      process.env.KAFKA_ENABLED === 'true',
      process.env.RABBITMQ_ENABLED === 'true',
    ),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        LoggerMiddleware,
        RequestIdMiddleware,
        HelmetMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
          new CorsMiddleware(this.configService).use(req, res, next),
      )
      .forRoutes('*');
  }
}
