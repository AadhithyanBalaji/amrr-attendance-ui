import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AmrrEmployee } from '../control-panel/employee-browser/amrr-employee.model';
import { AmrrUnit } from '../control-panel/unit-browser/amrr-unit.model';
import {
  IAmmrGridColumn,
  GridColumnType,
} from '../shared/ammr-grid/ammr-grid-column.interface';
import { ApiBusinessService } from '../shared/api-business.service';
import { CrudBrowserService } from '../shared/crud-browser/crud-browser.service';
import Helper from '../shared/helper';
import { AmrrSalaryAdvance } from './salary-advance.model';

@Component({
  selector: 'app-salary-advance-browser',
  templateUrl: './salary-advance-browser.component.html',
})
export class SalaryAdvanceBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[];
  employees: AmrrEmployee[] = [];

  form = new FormGroup({
    id: new FormControl(),
    employee: new FormControl(null, [Validators.required]),
    salary: new FormControl({ value: null, disabled: true }),
    advanceAmount: new FormControl(null, [Validators.required]),
    dateCredited: new FormControl(new Date()),
  });

  constructor(
    private readonly crudBrowserService: CrudBrowserService,
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe
  ) {
    this.form.controls.employee.valueChanges.subscribe((employee: any) => {
      this.form.controls.salary.setValue(employee?.salary);
      this.form.controls.advanceAmount.setValidators(
        Validators.max(employee?.salary)
      );
    });
  }

  ngOnInit(): void {
    this.apiBusinessService
      .get('employee/0/1')
      .pipe(take(1))
      .subscribe(
        (data: any) =>
          (this.employees = data.recordset satisfies AmrrEmployee[])
      );

    this.columns = [
      {
        key: 'sno',
        name: 'S.No.',
        type: GridColumnType.Sno,
      },
      {
        key: Helper.nameof<AmrrSalaryAdvance>('name'),
        name: 'Employee Name',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AmrrSalaryAdvance>('salary'),
        name: 'Salary',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<AmrrSalaryAdvance>('advanceAmount'),
        name: 'Advance Amount',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<AmrrSalaryAdvance>('dateCredited'),
        name: 'Date Credited',
        type: GridColumnType.Date,
      },
    ];
  }

  onSave(event: any) {
    if (this.form.dirty && this.form.valid) {
      const item = new AmrrSalaryAdvance();
      item.id = this.form.controls.id.value;
      item.employeeId = (this.form.controls.employee.value! as any).id;
      item.advanceAmount = this.form.controls.advanceAmount.value!;
      item.dateCredited = this.getFormattedDate(
        this.form.controls.dateCredited.value!
      );
      this.crudBrowserService.performSave(
        'salaryAdvance',
        'Salary Advance',
        item,
        event,
        this.form
      );
    }
  }

  onEdit(event: any) {
    const employee = this.employees.find((u) => u.id === event.employeeId);
    event = { ...event, employee: employee };
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
