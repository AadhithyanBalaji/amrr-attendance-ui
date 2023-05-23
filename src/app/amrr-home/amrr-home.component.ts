import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-amrr-home',
  templateUrl: './amrr-home.component.html',
  styleUrls: ['./amrr-home.component.css'],
})
export class AmrrHomeComponent {
  panelOpenState = false;

  constructor(
    readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.router.url === '/' ? this.router.navigate(['register']) : null;
  }

  logOut() {
    this.authService.logOut();
  }
}
