import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log('Before NestInterceptor...');

    return next.handle().pipe(
      map((data) => {
        //console.log('After NestInterceptor...', data);
        return data;
      }),
    );
  }
}
