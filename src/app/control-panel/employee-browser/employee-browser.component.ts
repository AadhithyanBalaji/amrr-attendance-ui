import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { CrudBrowserService } from '../../shared/crud-browser/crud-browser.service';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';
import Helper from 'src/app/shared/helper';
import { AmrrEmployee } from './amrr-employee.model';
import { AmrrUnit } from '../unit-browser/amrr-unit.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee-browser',
  templateUrl: './employee-browser.component.html',
})
export class EmployeeBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[];
  units: AmrrUnit[] = [];
  form = new FormGroup({
    id: new FormControl(),
    firstName: new FormControl(null, [Validators.required]),
    lastName: new FormControl(null, [Validators.required]),
    designation: new FormControl(null, [Validators.required]),
    salary: new FormControl(null, [Validators.required]),
    unit: new FormControl(null, [Validators.required]),
    dateOfJoining: new FormControl(null, [Validators.required]),
    uanNo: new FormControl(null, [
      Validators.required,
      Validators.minLength(12),
    ]),
    esiNo: new FormControl(null, [
      Validators.required,
      Validators.minLength(17),
    ]),
    aadharNo: new FormControl(null, [
      Validators.required,
      Validators.minLength(12),
    ]),
    isActive: new FormControl('asdf', [Validators.required]),
    inActiveSince: new FormControl(null),
    addressLine1: new FormControl(null, [Validators.required]),
    addressLine2: new FormControl(null),
    addressLine3: new FormControl(null),
    postalCode: new FormControl(null, [Validators.required]),
    emailAddress: new FormControl(null, [
      Validators.required,
      Validators.email,
    ]),
    phoneNumber: new FormControl(null, [
      Validators.required,
      Validators.minLength(10),
    ]),
  });

  constructor(
    private readonly crudBrowserService: CrudBrowserService,
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.apiBusinessService
      .get('unit')
      .pipe(take(1))
      .subscribe(
        (data: any) => (this.units = data.recordset satisfies AmrrUnit[])
      );

    this.columns = [
      {
        key: 'sno',
        name: 'S.No.',
        type: GridColumnType.Sno,
      },
      {
        key: Helper.nameof<AmrrEmployee>('name'),
        name: 'Employee Name',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('designation'),
        name: 'Designation',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('unitName'),
        name: 'Unit',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('salary'),
        name: 'Salary',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<AmrrEmployee>('dateOfJoining'),
        name: 'Date Of Joining',
        type: GridColumnType.Date,
      },
      {
        key: Helper.nameof<AmrrEmployee>('uanNo'),
        name: 'UAN #',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('esiNo'),
        name: 'ESI #',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('aadharNo'),
        name: 'Aadhar #',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('addressLine1'),
        name: 'Address Line 1',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('addressLine2'),
        name: 'Address Line 2',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('addressLine3'),
        name: 'Address Line 3',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('emailAddress'),
        name: 'e-Mail',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('phoneNumber'),
        name: 'Phone #',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('isActive'),
        name: 'Is Active',
        type: GridColumnType.Boolean,
      },
    ];
  }

  onSave(event: any) {
    if (this.form.dirty && this.form.valid) {
      const item = new AmrrEmployee();
      item.id = this.form.controls.id.value;
      item.firstName = this.form.controls.firstName.value!;
      item.lastName = this.form.controls.lastName.value!;
      item.designation = this.form.controls.designation.value!;
      item.salary = this.form.controls.salary.value!;
      item.unitId = (this.form.controls.unit.value as any).id;
      item.dateOfJoining = this.getFormattedDate(
        this.form.controls.dateOfJoining.value!
      );
      item.uanNo = this.form.controls.uanNo.value!;
      item.esiNo = this.form.controls.esiNo.value!;
      item.aadharNo = this.form.controls.aadharNo.value!;
      item.isActive = this.form.controls.isActive.value! ? 1 : 0;
      item.inActiveSince =
        Helper.isTruthy(item.isActive) && !item.isActive ? new Date() : null;
      item.addressLine1 = this.form.controls.addressLine1.value!;
      item.addressLine2 = this.form.controls.addressLine2.value ?? '';
      item.addressLine3 = this.form.controls.addressLine3.value ?? '';
      item.postalCode = this.form.controls.postalCode.value!;
      item.emailAddress = this.form.controls.emailAddress.value!;
      item.phoneNumber = this.form.controls.phoneNumber.value!;
      this.crudBrowserService.performSave(
        'employee',
        'Employee',
        item,
        event,
        this.form
      );
    }
  }

  onEdit(event: any) {
    const unit = this.units.find((u) => u.id === event.unitId);
    event = { ...event, unit: unit };
    this.form.patchValue(event);
  }

  getFormattedDate(date: any) {
    return (
      this.datePipe.transform(
        new Date(new Date(date).setHours(0, 0, 0, 0)),
        'YYYY-MM-dd'
      ) ?? ''
    );
  }
}
