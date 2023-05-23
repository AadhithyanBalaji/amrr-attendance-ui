import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, finalize } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
//import { AuthService } from '../auth/auth.service';
import { AmrrLoadingDialogService } from './amrr-loading/amrr-loading-dialog.service';

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  constructor(
    private readonly loadingDialogService: AmrrLoadingDialogService,
    //private readonly authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.loadingDialogService.showLoading();
    // if (request.url.indexOf('auth') === -1 && !this.authService.isLoggedIn()) {
    //   this.authService.logOut(true);
    //   localStorage.setItem('autoLogOff', 'true');
    //   return EMPTY;
    // }
    return next.handle(request).pipe(
      finalize(() => {
        this.loadingDialogService.hideLoading();
      })
    ) as Observable<HttpEvent<any>>;
  }
}
