import { Component } from '@angular/core';
import { GridColumnType } from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import Helper from 'src/app/shared/helper';
import { AmrrCompany } from './amrr-company.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CrudBrowserService } from '../../shared/crud-browser/crud-browser.service';

@Component({
  selector: 'app-company-browser',
  templateUrl: './company-browser.component.html',
})
export class CompanyBrowserComponent {
  columns = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: Helper.nameof<AmrrCompany>('name'),
      name: 'Company Name',
    },
    {
      key: Helper.nameof<AmrrCompany>('addressLine1'),
      name: 'Address Line 1',
    },
    {
      key: Helper.nameof<AmrrCompany>('addressLine2'),
      name: 'Address Line 2',
    },
    {
      key: Helper.nameof<AmrrCompany>('addressLine3'),
      name: 'Address Line 3',
    },
    {
      key: Helper.nameof<AmrrCompany>('postalCode'),
      name: 'Postal Code',
    },
    {
      key: Helper.nameof<AmrrCompany>('gstNo'),
      name: 'GST#',
    },
    {
      key: Helper.nameof<AmrrCompany>('emailAddress'),
      name: 'Email',
    },
    {
      key: Helper.nameof<AmrrCompany>('phoneNumber'),
      name: 'Phone',
    },
  ];

  form = new FormGroup({
    id: new FormControl(),
    name: new FormControl(null, [Validators.required]),
    addressLine1: new FormControl('', [Validators.required]),
    addressLine2: new FormControl(''),
    addressLine3: new FormControl(''),
    postalCode: new FormControl('', [Validators.required]),
    gstNo: new FormControl(null, [Validators.required]),
    emailAddress: new FormControl(null, [
      Validators.required,
      Validators.email,
    ]),
    phoneNumber: new FormControl(null, [
      Validators.required,
      Validators.pattern('[- +()0-9]+'),
    ]),
  });

  constructor(private readonly crudBrowserService: CrudBrowserService) {}

  onSave(event: any) {
    if (this.form.dirty && this.form.valid) {
      const item = new AmrrCompany();
      item.id = this.form.controls.id.value;
      item.name = this.form.controls.name.value!;
      item.addressLine1 = this.form.controls.addressLine1.value!;
      item.addressLine2 = this.form.controls.addressLine2.value ?? '';
      item.addressLine3 = this.form.controls.addressLine3.value ?? '';
      item.postalCode = this.form.controls.postalCode.value!;
      item.gstNo = this.form.controls.gstNo.value!;
      item.emailAddress = this.form.controls.emailAddress.value!;
      item.phoneNumber = this.form.controls.phoneNumber.value!;
      this.crudBrowserService.performSave('company', 'Company', item, event, this.form);
    }
  }
}
