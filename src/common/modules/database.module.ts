import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(enabled: boolean): DynamicModule {
    if (!enabled) {
      return {
        module: DatabaseModule,
        imports: [],
        exports: [],
      };
    }

    return {
      module: DatabaseModule,
      imports: [
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
      ],
      exports: [TypeOrmModule],
    };
  }
}
