import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';

import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { rabbitmqConfig } from './config/rabbitmq.config';
import { kafkaConfig } from './config/kafka.config';
import { jwtConfig } from './config/jwt.config';
import { EnvValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, rabbitmqConfig, kafkaConfig, jwtConfig],
      validationSchema: EnvValidationSchema,
    }),

	ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        let serveRoot = configService.get<string>('STATIC_ROOT') || '/';
        if (!serveRoot.startsWith('/')) serveRoot = '/' + serveRoot;

        const rootPath = join(process.cwd(), 'public');

        return [
          {
            rootPath,
            serveRoot,
            serveStaticOptions: {
              index: 'index.html',
              redirect: false,
            },
          },
        ];
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<any>('database');
        return {
          type: db.type,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password || undefined,
          database: db.database,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
