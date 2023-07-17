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
  styleUrls: ['./employee-browser.component.css'],
})
export class EmployeeBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[];
  units: AmrrUnit[] = [];

  form = new FormGroup({
    id: new FormControl(),
    firstName: new FormControl(null, [Validators.required]),
    lastName: new FormControl(null, [Validators.required]),
    payCycleTypeId: new FormControl(),
    designation: new FormControl(null, [Validators.required]),
    salary: new FormControl(null, [Validators.required]),
    basic: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    hra: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    unit: new FormControl(null, [Validators.required]),
    dateOfJoining: new FormControl(null, [Validators.required]),
    uanNo: new FormControl(null, [Validators.minLength(12)]),
    esiNo: new FormControl(null, [Validators.minLength(10)]),
    aadharNo: new FormControl(null, [Validators.minLength(12)]),
    isActive: new FormControl(null, [Validators.required]),
    inActiveSince: new FormControl(null),
    addressLine1: new FormControl(null, [Validators.required]),
    addressLine2: new FormControl(null),
    addressLine3: new FormControl(null),
    postalCode: new FormControl(null, [Validators.required]),
    emailAddress: new FormControl(null, [Validators.email]),
    phoneNumber: new FormControl(null, [
      Validators.required,
      Validators.minLength(10),
    ]),
    bankDetailId: new FormControl(),
    accountNumber: new FormControl(),
    ifsc: new FormControl(),
    branchLocation: new FormControl(),
  });

  constructor(
    private readonly crudBrowserService: CrudBrowserService,
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe
  ) {
    this.form.controls.payCycleTypeId.setValidators([Validators.required]);
    this.form.controls.accountNumber.setValidators([Validators.min(1)]);
    this.form.controls.accountNumber.valueChanges.subscribe((accountNumber) => {
      if (Helper.isTruthy(accountNumber) && accountNumber!.length > 0) {
        this.form.controls.ifsc.setValidators([
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.required,
        ]);
        this.form.controls.ifsc.enable();

        this.form.controls.branchLocation.setValidators(Validators.required);
        this.form.controls.branchLocation.enable();
      } else {
        this.form.controls.ifsc.clearValidators();
        this.form.controls.ifsc.disable();
        this.form.controls.branchLocation.clearValidators();
        this.form.controls.branchLocation.disable();
      }
      this.form.controls.ifsc.updateValueAndValidity();
      this.form.controls.branchLocation.updateValueAndValidity();
    });
    this.form.controls.salary.valueChanges.subscribe((salary) => {
      this.form.controls.basic.setValue(salary! * 0.7);
      this.form.controls.basic.updateValueAndValidity();
      this.form.controls.hra.setValue(salary! * 0.3);
      this.form.controls.hra.updateValueAndValidity();
    });
  }

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
        key: Helper.nameof<AmrrEmployee>('payCycleTypeName'),
        name: 'Pay Cycle',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrEmployee>('salary'),
        name: 'Salary',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<AmrrEmployee>('hra'),
        name: 'HRA',
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
      {
        key: Helper.nameof<AmrrEmployee>('bankDetailId'),
        name: 'BankDetailId',
        hidden: true,
      },
      {
        key: Helper.nameof<AmrrEmployee>('accountNumber'),
        name: 'Account #',
      },
      {
        key: Helper.nameof<AmrrEmployee>('ifsc'),
        name: 'IFSC',
      },
      {
        key: Helper.nameof<AmrrEmployee>('branchLocation'),
        name: 'Bank Location',
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
      item.payCycleTypeId = +this.form.controls.payCycleTypeId.value!;
      item.basic = this.form.controls.basic.value!;
      item.hra = this.form.controls.hra.value!;
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
      item.bankDetailId = this.form.controls.bankDetailId.value;
      const accountNumber =
        Helper.isTruthy(this.form.controls.accountNumber.value) &&
        this.form.controls.accountNumber.value !== ''
          ? this.form.controls.accountNumber.value
          : null;
      item.accountNumber = accountNumber;
      item.ifsc =
        Helper.isTruthy(accountNumber) && accountNumber!.length > 0
          ? this.form.controls.ifsc.value
          : null;
      item.branchLocation =
        Helper.isTruthy(accountNumber) && accountNumber!.length > 0
          ? this.form.controls.branchLocation.value
          : null;

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
