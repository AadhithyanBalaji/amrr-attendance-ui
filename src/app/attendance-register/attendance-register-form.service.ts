import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiBusinessService } from '../shared/api-business.service';
import { take } from 'rxjs';
import Helper from '../shared/helper';
import { GridColumnType } from '../shared/ammr-grid/ammr-grid-column.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExcelJSService } from './exceljs.service';

@Injectable()
export class AttendanceRegisterFormService {
  constructor(
    private readonly router: Router,
    private readonly apiBusinessService: ApiBusinessService,
    readonly excelJsService: ExcelJSService
  ) {}

  columns = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
  ];

  dataSource: MatTableDataSource<any, MatPaginator>;
  loading = false;
  filterData: any;

  navigateToAddAttendance() {
    this.router.navigate(['attendanceEditor']);
  }

  onViewClicked(filterData: any) {
    this.filterData = filterData;
    this.loading = true;
    this.apiBusinessService
      .post('attendance/filter', filterData)
      .pipe(take(1))
      .subscribe((results: any) => {
        this.columns = [
          {
            key: 'sno',
            name: 'S.No.',
            type: GridColumnType.Sno,
          },
          {
            key: 'EmployeeName',
            name: 'Employee Name',
            type: GridColumnType.String,
          },
          {
            key: 'Designation',
            name: 'Designation',
            type: GridColumnType.String,
          },
          {
            key: 'WorkingDays',
            name: 'Working Days',
            type: GridColumnType.Number,
          },
          {
            key: 'Holiday',
            name: 'Holidays',
            type: GridColumnType.Number,
          },
          {
            key: 'NoOfDaysSalaryPaid',
            name: 'No of days salary paid',
            type: GridColumnType.Number,
          },
        ];
        if (
          !Helper.isNullOrUndefined(this.dataSource) &&
          (Helper.isNullOrUndefined(results.recordset) ||
            results.recordset?.length === 0)
        ) {
          this.loading = false;
          this.dataSource.data = [];
          return;
        }
        const noOfDays = Helper.getNoOfDays(filterData.generatedOn);
        for (let i = 1; i <= noOfDays; i++) {
          this.columns.push({
            key: i + '',
            name: i + '',
            type: GridColumnType.String,
          });
        }
        this.dataSource = new MatTableDataSource(results.recordset);
        this.loading = false;
      });
  }

  exportAttendance() {
    this.excelJsService.exportAttendance(this.dataSource.data, this.filterData);
  }
}
