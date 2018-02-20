import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/timeout';
import {Inject, Injectable, InjectionToken} from '@angular/core';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');
export const defaultTimeout = 60000;

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeout = Number(req.headers.get('timeout')) || this.defaultTimeout;
    return next.handle(req).timeout(timeout);
  }
}
