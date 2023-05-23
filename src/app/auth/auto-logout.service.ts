import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  resetIdleTimer$ = new Subject<any>();
  checkTimer: NodeJS.Timer;
  maxIdleMins = 3;

  constructor(
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) {
    this.resetIdleTimer$.pipe(debounceTime(1000)).subscribe((_) => {
      this.lastAction(Date.now());
    });
  }

  init() {
    localStorage.setItem('autoLogOff', 'false');
    this.lastAction(Date.now());
    this.check();
    this.initListener();
    this.initInterval();
  }

  clearTimers() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('lastAction');
    window.clearInterval(this.checkTimer);
    window.removeEventListener('click', () => {});
    window.removeEventListener('scroll', () => {});
    window.removeEventListener('keyup', () => {});
    localStorage.setItem('isAuthenticated', '0');
    localStorage.setItem('authData', '');
  }

  getLastAction() {
    return localStorage.getItem('lastAction') ?? '0';
  }

  lastAction(date: number) {
    localStorage.setItem('lastAction', JSON.stringify(date));
  }

  initListener() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('click', () => this.resetIdleTimer$.next(null));
      window.addEventListener('scroll', () => this.resetIdleTimer$.next(null));
      window.addEventListener('keyup', () => this.resetIdleTimer$.next(null));
    });
  }

  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      this.checkTimer = setInterval(() => {
        this.check();
      }, 1000);
    });
  }

  check() {
    const now = Date.now();
    const timeLeft =
      parseInt(this.getLastAction()) + this.maxIdleMins * 60 * 1000;
    const diff = timeLeft - now;
    const isTimeout = diff < 0;
    this.ngZone.run(() => {
      if (isTimeout) {
        this.clearTimers();
        localStorage.setItem('autoLogOff', 'true');
        this.router.navigate(['login']);
      }
    });
  }
}
