import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import Helper from 'src/app/shared/helper';
import { AmrrModalComponent } from '../shared/amrr-modal/amrr-modal.component';
import { AuthData } from './auth-data.model';
import { AutoLogoutService } from './auto-logout.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggingIn = false;

  constructor(
    private readonly router: Router,
    //private readonly apiBusinessService: ApiBusinessService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly autoLogoutService: AutoLogoutService
  ) {
    this.isLoggedIn();
  }

  login(username: string, password: string) {
    this.isLoggingIn = true;
    // this.apiBusinessService
    //   .post('auth', { loginName: username, password: password })
    //   .pipe(take(1))
    //   .subscribe(
    //     (res: any) => {
    //       if (res.success) {
    //         this.setIsAuthenticated(true);
    //         const authData = new AuthData();
    //         authData.userId = +res.data.userId;
    //         authData.isAdmin =
    //           Helper.isTruthy(res.data.isAdmin) && res.data.isAdmin === '1';
    //         authData.userName = res.data.userName;
    //         authData.token = res.data.token;
    //         localStorage.setItem('authData', JSON.stringify(authData));
    //         this.router.navigate(['stockInward']);
    //       } else {
    //         this.router.navigate(['login']);
    //       }
    //       this.autoLogoutService.init();
    //       this.isLoggingIn = false;
    //     },
    //     (error) => {
    //       this.displaySnackBar(error?.error?.message);
    //     }
    //   );
  }

  isLoggedIn() {
    // const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    // return (
    //   Helper.isTruthy(storedIsAuthenticated) && storedIsAuthenticated === '1'
    // );
    return true;
  }

  logOut(force = false) {
    if (force) {
      this.performLogout();
      this.autoLogoutService.clearTimers();
    } else {
      this.dialog
        .open(AmrrModalComponent, {
          data: {
            title: 'Confirm Logout',
            body: `Are you sure you want to logout?`,
          },
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          if (result) {
            this.performLogout();
          }
        });
    }
  }

  changePwd(loginName: string, password: string, newPassword: string) {
    // this.apiBusinessService
    //   .post('auth/changePassword', {
    //     loginName: loginName,
    //     password: password,
    //     newPassword: newPassword,
    //   })
    //   .pipe(take(1))
    //   .subscribe((res: any) => {
    //     if (Helper.isTruthy(res.Message) && res.Message !== '') {
    //       this.displaySnackBar(res.Message);
    //     } else {
    //       this.displaySnackBar('Successfully changed password');
    //       this.logOut(true);
    //     }
    //   });
  }

  getUserId(): number {
    return this.getUser()?.userId ?? 0;
  }

  getUserName(): string {
    return this.getUser()?.userName ?? '';
  }

  getAuthToken(): string {
    return this.getUser()?.token ?? '';
  }

  isLoggedInUserAdmin(): boolean {
    return this.getUser()?.isAdmin ?? false;
  }

  private getUser() {
    const authData = localStorage.getItem('authData');
    if (Helper.isTruthy(authData) && authData != '') {
      return JSON.parse(authData!) as AuthData;
    }
    this.logOut(true);
    return null;
  }

  private setIsAuthenticated(isAuthenticated: boolean) {
    localStorage.setItem('isAuthenticated', isAuthenticated ? '1' : '0');
  }

  private performLogout() {
    const userId = this.getUserId();
    // this.apiBusinessService
    //   .get(`auth/logout/${userId}`)
    //   .pipe(take(1))
    //   .subscribe((res: any) => {
    //     this.displaySnackBar('Logged out');
    //     this.setIsAuthenticated(false);
    //     localStorage.setItem('authData', '');
    //     this.router.navigate(['login']);
    //   });
  }

  private displaySnackBar(msg: string) {
    this.snackBar.open(msg);
  }
}
