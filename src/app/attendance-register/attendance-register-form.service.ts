import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiBusinessService } from '../shared/api-business.service';
import { take } from 'rxjs';
import Helper from '../shared/helper';
import { AttendanceBrowser } from './attendance-browser.model';
import { GridColumnType } from '../shared/ammr-grid/ammr-grid-column.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Injectable()
export class AttendanceRegisterFormService {
  constructor(
    private readonly router: Router,
    private readonly apiBusinessService: ApiBusinessService
  ) {}

  columns = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: Helper.nameof<AttendanceBrowser>('employeeName'),
      name: 'Employee Name',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AttendanceBrowser>('companyName'),
      name: 'Company Name',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AttendanceBrowser>('unitName'),
      name: 'Unit Name',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<AttendanceBrowser>('workingDays'),
      name: 'Working Days',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<AttendanceBrowser>('leaves'),
      name: 'Leaves',
      type: GridColumnType.Number,
    },
  ];

  dataSource: MatTableDataSource<AttendanceBrowser, MatPaginator>;
  loading = false;

  navigateToAddAttendance() {
    this.router.navigate(['attendanceEditor']);
  }

  onViewClicked(filterData: any) {
    this.loading = true;
    this.apiBusinessService
      .post('attendance/filter', filterData)
      .pipe(take(1))
      .subscribe((results: any) => {
        this.dataSource = new MatTableDataSource(results.recordset);
        this.loading = false;
      });
  }
}
