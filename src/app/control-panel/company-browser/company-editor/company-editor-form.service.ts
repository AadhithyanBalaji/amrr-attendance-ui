import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { AmrrCompany } from '../amrr-company.model';
import { CompanyEditorComponent } from './company-editor.component';
import { FormHelper } from 'src/app/shared/form-helper.service';

@Injectable()
export class CompanyEditorFormService {
  dialogRef: MatDialogRef<CompanyEditorComponent, AmrrCompany>;
  data: AmrrCompany;
  form: FormGroup<{
    id: FormControl<any>;
    name: FormControl<any>;
    addressLine1: FormControl<any>;
    addressLine2: FormControl<any>;
    addressLine3: FormControl<any>;
    postalCode: FormControl<any>;
    gstNo: FormControl<any>;
    email: FormControl<any>;
    phone: FormControl<any>;
  }>;

  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly snackBar: MatSnackBar,
    private readonly formHelper: FormHelper
  ) {}

  init(dialogRef: MatDialogRef<CompanyEditorComponent>, data: AmrrCompany) {
    this.dialogRef = dialogRef;
    this.data = data;
    this.populateEditor(data);
  }

  addCompany() {
    this.saveCompany(true);
  }

  cancel() {
    this.dialogRef.close(new AmrrCompany());
  }

  private populateEditor(data: AmrrCompany) {
    this.form = new FormGroup({
      id: new FormControl(data?.id),
      name: new FormControl(data?.name, [Validators.required]),
      addressLine1: new FormControl(data?.addressLine1, [Validators.required]),
      addressLine2: new FormControl(data?.addressLine2 ?? ''),
      addressLine3: new FormControl(data?.addressLine3 ?? ''),
      postalCode: new FormControl(data?.postalCode, [Validators.required]),
      gstNo: new FormControl(data?.gstNo, [Validators.required]),
      email: new FormControl(data?.emailAddress, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl(data?.phoneNumber, [
        Validators.required,
        Validators.pattern('[- +()0-9]+'),
      ]),
    });
  }

  private saveCompany(closeDialog = false) {
    if (this.form.dirty && this.form.valid) {
      const item = new AmrrCompany();
      item.id = this.form.controls.id.value;
      item.name = this.form.controls.name.value;
      item.addressLine1 = this.form.controls.addressLine1.value;
      item.addressLine2 = this.form.controls.addressLine2.value;
      item.addressLine3 = this.form.controls.addressLine3.value;
      item.postalCode = this.form.controls.postalCode.value;
      item.gstNo = this.form.controls.gstNo.value;
      item.emailAddress = this.form.controls.email.value;
      item.phoneNumber = this.form.controls.phone.value;

      this.apiBusinessService
        .post('company', item)
        .pipe(take(1))
        .subscribe((_) => {
          closeDialog
            ? this.dialogRef.close(new AmrrCompany())
            : this.form.reset();
          this.snackBar.open(
            `Company ${isNaN(item.id) ? 'created!' : 'updated'}`
          );
          this.formHelper.resetForm(this.form);
        });
    }
  }
}
