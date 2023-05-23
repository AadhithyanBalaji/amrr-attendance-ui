import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-amrr-login',
  templateUrl: './amrr-login.component.html',
  styleUrls: ['./amrr-login.component.css'],
})
export class AmrrLoginComponent {
  loginForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
  });
  isAutoLogout: boolean;

  constructor(readonly authService: AuthService) {
    this.isAutoLogout = localStorage.getItem('autoLogOff') === 'true' ?? false;
    localStorage.setItem('autoLogOff', 'false');
  }

  login() {
    if (this.loginForm.dirty && this.loginForm.valid) {
      this.authService.login(
        this.loginForm.controls.userName.value!,
        this.loginForm.controls.password.value!
      );
    }
    return false;
  }
}
