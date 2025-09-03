import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SanitizeInterceptor } from '../src/common/interceptors/sanitize.interceptor';

describe('XSS Prevention (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalInterceptors(new SanitizeInterceptor());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    await app.init();
  });

it('/users (POST) should reject XSS payload', async () => {
  const payload = {
    username: "<script>alert('xss')</script>",
    password: "123456",
  };

  await request(app.getHttpServer())
    .post('/users')
    .send(payload)
    .expect(400);
});


  afterAll(async () => {
    await app.close();
  });
});
