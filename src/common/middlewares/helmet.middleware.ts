import { Injectable, NestMiddleware } from '@nestjs/common';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["*"],
          styleSrc: ["*","'unsafe-inline'","https://fonts.googleapis.com"],
          fontSrc: ["*","https://fonts.gstatic.com"],
          imgSrc: ["*","data:"],
          connectSrc: ["*"],
          frameSrc: ["*"],
        },
      },
    })(req, res, next);
  }
}
