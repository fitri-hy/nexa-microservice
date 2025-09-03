import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
  ],
  exports: [ServeStaticModule],
})
export class StaticModule {}
