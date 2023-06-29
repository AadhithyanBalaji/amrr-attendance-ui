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
  multi: any;
  constructor(
    private readonly router: Router,
    private readonly apiBusinessService: ApiBusinessService,
    readonly excelJsService: ExcelJSService
  ) {}

  columns: any[] = [
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
            type: GridColumnType.Sno
          },
          {
            key: 'EmployeeName',
            name: 'Employee Name',
            type: GridColumnType.String,
            sticky: true
          },
          {
            key: 'Designation',
            name: 'Designation',
            type: GridColumnType.String,
            sticky: true
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
          this.multi = [];
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
        this.buildChartData(noOfDays);
        this.loading = false;
      });
  }

  exportAttendance() {
    this.excelJsService.exportAttendance(this.dataSource.data, this.filterData);
  }

  private buildChartData(noOfDays: number) {
    const multi: any = [];
    for (let i = 0; i < this.dataSource.data.length - 1; i++) {
      const series: any = [];
      for (let j = 1; j <= noOfDays; j++) {
        series.push({
          name: j,
          value: this.getAttendanceValue(this.dataSource.data[i][j]),
        });
      }
      multi.push({
        name: this.dataSource.data[i].EmployeeName,
        series: series,
      });
    }
    this.multi = multi;
  }

  private getAttendanceValue(dayValue: string): number {
    let attendanceUnit = 0;
    if (Helper.isNullOrUndefined(dayValue)) return 0;
    else if (dayValue === 'X') return 1;
    else if (dayValue === 'H') return 0.5;
    else if (dayValue === 'L') return 0;
    return attendanceUnit;
  }
}
