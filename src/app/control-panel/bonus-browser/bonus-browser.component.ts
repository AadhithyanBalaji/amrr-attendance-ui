import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { CrudBrowserService } from '../../shared/crud-browser/crud-browser.service';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';
import { Bonus } from './bonus.model';
import Helper from 'src/app/shared/helper';
import { AmrrEmployee } from '../employee-browser/amrr-employee.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bonus-browser',
  templateUrl: './bonus-browser.component.html',
})
export class BonusBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[] = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: Helper.nameof<Bonus>('name'),
      name: 'Employee',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<Bonus>('unitName'),
      name: 'Unit',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<Bonus>('companyName'),
      name: 'Company',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<Bonus>('amount'),
      name: 'Amount',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<Bonus>('effectiveDate'),
      name: 'Effective Date',
      type: GridColumnType.Date,
    },
  ];

  employees: AmrrEmployee[] = [];

  form = new FormGroup({
    id: new FormControl(),
    employee: new FormControl({}, [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    effectiveDate: new FormControl(new Date(), [Validators.required]),
  });

  constructor(
    private readonly crudBrowserService: CrudBrowserService,
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.apiBusinessService
      .get('employee/0/0')
      .pipe(take(1))
      .subscribe(
        (data: any) =>
          (this.employees = data.recordset satisfies AmrrEmployee[])
      );
  }

  onSave(event: any) {
    if (this.form.dirty && this.form.valid) {
      const bonus = new Bonus();
      bonus.id = this.form.controls.id.value;
      bonus.employeeId = (this.form.controls.employee.value! as any).id;
      bonus.amount = this.form.controls.amount.value!;
      bonus.effectiveDate = Helper.getAttendanceDate(
        this.form.controls.effectiveDate.value,
        this.datePipe
      );
      this.crudBrowserService.performSave(
        'bonus',
        'Bonus',
        bonus,
        event,
        this.form
      );
    }
  }

  onEdit(event: any) {
    const employee = this.employees.find((e) => e.id === event.employeeId);
    event = { ...event, employee: employee };
    this.form.patchValue(event);
  }
}
