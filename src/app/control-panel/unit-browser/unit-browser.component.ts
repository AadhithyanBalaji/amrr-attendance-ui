import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { AmrrCompany } from '../company-browser/amrr-company.model';
import { CrudBrowserService } from '../../shared/crud-browser/crud-browser.service';
import { AmrrUnit } from './amrr-unit.model';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-unit-browser',
  templateUrl: './unit-browser.component.html',
})
export class UnitBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[] = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: 'name',
      name: 'Unit Name',
      type: GridColumnType.String,
    },
    {
      key: 'companyName',
      name: 'Company Name',
      type: GridColumnType.String,
    },
  ];

  companies: AmrrCompany[] = [];

  form = new FormGroup({
    id: new FormControl(),
    name: new FormControl(null, [Validators.required]),
    company: new FormControl(null, [Validators.required]),
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
      const item = new AmrrUnit();
      item.id = this.form.controls.id.value;
      item.name = this.form.controls.name.value!;
      item.companyId = (this.form.controls.company.value! as any).id;
      this.crudBrowserService.performSave('unit', 'Unit', item, event);
    }
  }

  onEdit(event: any) {
    const company = this.companies.find((c) => c.id === event.companyId);
    event = { ...event, company: company };
    console.log(event);
    this.form.patchValue(event);
    console.log(this.form.value);
  }
}
