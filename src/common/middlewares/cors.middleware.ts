import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const origin = (this.configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000').split(',');
    const methods = this.configService.get<string>('CORS_METHODS') || 'GET,POST,PUT,DELETE';
    const credentials = this.configService.get<boolean>('CORS_CREDENTIALS') ?? true;

    res.setHeader('Access-Control-Allow-Origin', origin.join(','));
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Credentials', String(credentials));
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }
}
