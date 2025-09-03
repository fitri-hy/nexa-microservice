import * as dotenv from 'dotenv';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';

dotenv.config();

async function bootstrap() {
  const enableLog = process.env.LOGGER === 'true';

  const app = await NestFactory.create(AppModule, {
    logger: enableLog ? ['error', 'warn', 'log'] : false,
  });

  const logger = new Logger('Bootstrap');

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new SanitizeInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  if (enableLog) logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
