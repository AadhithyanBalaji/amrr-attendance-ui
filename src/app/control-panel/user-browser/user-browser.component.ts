import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { CrudBrowserService } from '../../shared/crud-browser/crud-browser.service';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';
import Helper from 'src/app/shared/helper';
import { AmrrUnit } from '../unit-browser/amrr-unit.model';
import { AmrrUser } from './amrr-user.model';

@Component({
  selector: 'app-user-browser',
  templateUrl: './user-browser.component.html',
})
export class UserBrowserComponent implements OnInit {
  columns: IAmmrGridColumn[] = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: Helper.nameof<AmrrUser>('name'),
      name: 'User Name',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AmrrUser>('loginName'),
      name: 'Login Name',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AmrrUser>('userRole'),
      name: 'User Role',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AmrrUser>('units'),
      name: 'Unit(s)',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AmrrUser>('isActive'),
      name: 'Status',
      type: GridColumnType.Boolean,
    },
  ];

  units: AmrrUnit[] = [];

  form = new FormGroup({
    id: new FormControl(),
    name: new FormControl(null, [Validators.required]),
    loginName: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    isAdmin: new FormControl(null, [Validators.required]),
    units: new FormControl(null, [Validators.required]),
    isActive: new FormControl(null, [Validators.required]),
  });

  constructor(
    private readonly crudBrowserService: CrudBrowserService,
    private readonly apiBusinessService: ApiBusinessService
  ) {}

  ngOnInit(): void {
    this.apiBusinessService
      .get('unit')
      .pipe(take(1))
      .subscribe(
        (data: any) => (this.units = data.recordset satisfies AmrrUnit[])
      );
  }

  onSave(event: any) {
    if (this.form.dirty && this.form.valid) {
      const item = new AmrrUser();
      item.id = this.form.controls.id.value;
      item.name = this.form.controls.name.value!;
      item.loginName = this.form.controls.loginName.value!;
      item.password = this.form.controls.password.value!;
      item.isAdmin = this.form.controls.isAdmin.value!;
      const selectedUnits = this.form.controls.units.value! as [];
      item.unitIds = selectedUnits.map((u: AmrrUnit) => u.id).join(',');
      item.isActive = this.form.controls.isActive.value! ? '1' : '0';
      this.crudBrowserService.performSave(
        'attendanceUser',
        'User',
        item,
        event,
        this.form
      );
    }
  }

  onEdit(event: any) {
    const units = this.units.filter((u) =>
      (event.units as string).includes(u.name)
    );
    event = { ...event, units: units };
    this.form.patchValue(event);
  }
}
