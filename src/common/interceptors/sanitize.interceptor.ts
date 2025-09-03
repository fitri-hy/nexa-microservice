import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import * as xss from 'xss';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    request.body = this.sanitizeObject(request.body);

    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'object') {
          return this.sanitizeObject(data);
        }
        return data;
      }),
    );
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
   if (typeof obj === 'string') return xss.filterXSS(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.sanitizeObject(item));
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  }
}
