import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      map(data => {
        const end = Date.now();
        const responseTime = end - start;
        return { ...data, time: `${responseTime}ms` };
      }),
    );
  }
}
