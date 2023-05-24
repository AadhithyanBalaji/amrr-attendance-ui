import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { AmrrCompany } from '../company-browser/amrr-company.model';
import { CrudBrowserService } from '../../shared/crud-browser/crud-browser.service';
import { AmrrHoliday } from './amrr-holiday.model';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';
import Helper from 'src/app/shared/helper';
import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

@Component({
  selector: 'app-holiday-browser',
  templateUrl: './holiday-browser.component.html',
})
export class HolidayBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[] = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: Helper.nameof<AmrrHoliday>('name'),
      name: 'Name',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AmrrHoliday>('holidayDate'),
      name: 'Date',
      type: GridColumnType.Date,
    },
    {
      key: Helper.nameof<AmrrHoliday>('attendanceUnit'),
      name: 'Attendance Unit',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<AmrrHoliday>('companies'),
      name: 'Companies',
      type: GridColumnType.String,
    },
  ];

  companies: AmrrCompany[] = [];

  form = new FormGroup({
    id: new FormControl(),
    name: new FormControl(null, [Validators.required]),
    holidayDate: new FormControl(null, [Validators.required]),
    attendanceUnit: new FormControl(null, [Validators.required]),
    companies: new FormControl(null, [Validators.required]),
  });

  constructor(
    private readonly crudBrowserService: CrudBrowserService,
    private readonly apiBusinessService: ApiBusinessService
  ) {}

  ngOnInit(): void {
    this.apiBusinessService
      .get('company')
      .pipe(take(1))
      .subscribe(
        (company: any) =>
          (this.companies = company.recordset satisfies AmrrCompany[])
      );
  }

  onSave(event: any) {
    if (this.form.dirty && this.form.valid) {
      const item = new AmrrHoliday();
      item.id = this.form.controls.id.value;
      item.name = this.form.controls.name.value!;
      item.holidayDate = this.form.controls.holidayDate.value!;
      item.attendanceUnit = this.form.controls.attendanceUnit.value!;
      const selectedCompanies = this.form.controls.companies.value! as [];
      item.companyIds = selectedCompanies
        .map((c: AmrrCompany) => c.id)
        .join(',');
      this.crudBrowserService.performSave(
        'holiday',
        'Holiday',
        item,
        event,
        this.form
      );
    }
  }

  onEdit(event: any) {
    const companies = this.companies.filter((u: IAmrrTypeahead) =>
      (event.companyIds as string).includes(u.id + '')
    );
    event = { ...event, companies: companies };
    this.form.patchValue(event);
  }
}
