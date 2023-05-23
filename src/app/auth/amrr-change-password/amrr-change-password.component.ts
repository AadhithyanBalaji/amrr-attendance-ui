import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subscription, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-amrr-change-password',
  templateUrl: './amrr-change-password.component.html',
  styleUrls: ['./amrr-change-password.component.css'],
})
export class AmrrChangePasswordComponent implements OnDestroy {
  changePwdForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
    confirmNewPassword: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
  });
  confirmNewPasswordControlListener: Subscription;

  constructor(private readonly authService: AuthService) {
    this.confirmNewPasswordControlListener =
      this.changePwdForm.controls.confirmNewPassword.valueChanges.subscribe(
        (value) => {
          if (value !== this.changePwdForm.controls.newPassword.value) {
            this.changePwdForm.controls.confirmNewPassword.setErrors({
              passwordsNotMatching: true,
            });
          } else {
            this.changePwdForm.controls.confirmNewPassword.setErrors(null);
          }
        }
      );
  }

  changePwd() {
    if (this.changePwdForm.dirty && this.changePwdForm.valid) {
      this.authService.changePwd(
        this.changePwdForm.controls.userName.value!,
        this.changePwdForm.controls.password.value!,
        this.changePwdForm.controls.newPassword.value!
      );
    }
  }

  ngOnDestroy(): void {
    this.confirmNewPasswordControlListener.unsubscribe();
  }
}
