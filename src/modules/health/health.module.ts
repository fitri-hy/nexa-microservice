import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTimeInterceptor } from '../../common/interceptors/response-time.interceptor';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class HealthModule {}
