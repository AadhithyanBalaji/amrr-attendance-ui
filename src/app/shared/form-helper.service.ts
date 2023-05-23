import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import Helper from './helper';

@Injectable({
  providedIn: 'root',
})
export class FormHelper {
  resetForm(form: FormGroup) {
    if (Helper.isNullOrUndefined(form)) return;
    form.reset();
    Object.keys(form.controls).forEach((key) => {
      form.controls[key].setErrors(null);
    });
  }
}
