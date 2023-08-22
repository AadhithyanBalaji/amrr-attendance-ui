import { DatePipe } from '@angular/common';
import { Injectable, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { combineLatest, take } from 'rxjs';
import { Unit } from 'src/app/models/unit.model';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { AttendanceRegisterEntry } from './attendance-register-entry.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import Helper from 'src/app/shared/helper';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AttendanceEditorBrowser } from './attendance-editor-browser.model';
import { AttendanceStatusEnum } from './attendance-status.enum';

@Injectable()
export class AttendanceRegisterEditorFormService {
  form: FormGroup<{
    attendanceDate: FormControl<any>;
    unitId: FormControl<any>;
  }>;
  units: Unit[] = [];

  queriedDate: string;
  columns: IAmmrGridColumn[] = [];
  dataSource: MatTableDataSource<AttendanceEditorBrowser, MatPaginator>;
  loading = false;
  saving = false;

  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe,
    private readonly snackBar: MatSnackBar,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  init(statusTemplate: TemplateRef<any>) {
    const userId = this.authService.getUserId();
    if (Helper.isTruthy(userId)) {
      this.apiBusinessService
        .get(`unit/${userId}`)
        .pipe(take(1))
        .subscribe((units: any) => {
          this.units = units.recordset as Unit[];
          this.form = new FormGroup({
            attendanceDate: new FormControl(new Date(), [Validators.required]),
            unitId: new FormControl(units.length > 0 ? units[0] : null, [
              Validators.required,
            ]),
          });
        });
    }
    this.columns = this.setupColumns(statusTemplate);
  }

  addAttendance() {
    const attendanceDate = Helper.getAttendanceDate(
      this.form.controls.attendanceDate.value,
      this.datePipe
    );
    if (Helper.isNullOrUndefined(attendanceDate)) return;
    if (this.dataSource.data.find((x) => x.hasError)) {
      this.snackBar.open('Error in one or more entries. Please check');
      return;
    }

    const attendanceData = this.dataSource.data.filter(
      (x) => x.status !== AttendanceStatusEnum.NotMarked
    );

    const attendanceRecords = attendanceData
      .filter((x) => x.payCycleTypeId === 1)
      .map((x) => ({
        employeeId: x.id,
        isPresent:
          x.status === AttendanceStatusEnum.Present ||
          x.status === AttendanceStatusEnum.HalfDay,
        attendanceUnit: this.getAttendanceUnit(x.status),
      }));

    const dailyWagesAttendanceRecords = attendanceData
      .filter((x) => x.payCycleTypeId === 3)
      .map((x) => ({
        employeeId: x.id,
        inTime: x.inTime,
        outTime: x.outTime,
        isPresent: x.status !== AttendanceStatusEnum.Absent,
      }));

    this.saving = true;
    combineLatest([
      this.apiBusinessService.post('attendance', {
        attendanceRecords: attendanceRecords,
        attendanceDate: attendanceDate,
        unitId: this.form.controls.unitId.value?.id,
      }),
      this.apiBusinessService.post('attendance/daily', {
        attendanceRecords: dailyWagesAttendanceRecords,
        attendanceDate: attendanceDate,
        unitId: this.form.controls.unitId.value?.id,
      }),
    ])
      .pipe(take(1))
      .subscribe((_) => {
        this.snackBar.open('Updated Attendance Register');
        this.saving = false;
      });
  }

  addAttendanceAndClose() {}

  cancel() {
    this.router.navigate(['register']);
  }

  getAttendanceGridData() {
    if (!this.form.valid && !this.form.dirty) return;

    const date = Helper.getAttendanceDate(
      this.form.controls.attendanceDate.value,
      this.datePipe
    );
    const unitId = this.form.controls.unitId.value?.id;

    if (Helper.isNullOrUndefined(date) || Helper.isNullOrUndefined(unitId))
      return;

    this.loading = true;

    this.apiBusinessService
      .get(`attendance/editor/${date}/${unitId}`)
      .pipe(take(1))
      .subscribe((data: any) => {
        const entries = data.recordset satisfies AttendanceRegisterEntry[];
        const convData = entries.map((x) => ({
          id: x.employeeId,
          name: x.employeeName,
          payCycleTypeId: x.payCycleTypeId,
          inTime: this.getTimeString(x.inTime),
          outTime: this.getTimeString(x.outTime),
          status: x.status ?? AttendanceStatusEnum.NotMarked,
        }));
        this.dataSource = new MatTableDataSource(convData);
        this.queriedDate = date;
        this.loading = false;
      });
  }

  getUnMarkedCount() {
    return this.dataSource.data.filter((x) =>
      Helper.isNullOrUndefined(x.status)
    ).length;
  }

  getEmployeeCount(status: AttendanceStatusEnum) {
    return this.dataSource.data.filter((x) => x.status === status).length;
  }

  inTimeChanged(timeString: string, row: AttendanceEditorBrowser) {
    row.inTime = this.buildDateTime(timeString) ?? '';
    row.status = AttendanceStatusEnum.Present;
  }

  outTimeChanged(timeString: string, row: AttendanceEditorBrowser) {
    row.outTime = this.buildDateTime(timeString) ?? '';
    row.status = AttendanceStatusEnum.Present;
  }

  getTimeString(dateTimeString: string): string {
    return (dateTimeString ?? '') !== ''
      ? this.datePipe.transform(
          dateTimeString.replace('Z', '').replace('T', ' '),
          'shortTime'
        ) ?? ''
      : '';
  }

  isTimeRangeInvalid(row: AttendanceEditorBrowser): boolean {
    const isValid =
      (row.inTime ?? '') !== '' && (row.outTime ?? '') !== ''
        ? new Date(row.inTime) >= new Date(row.outTime)
        : false;
    row.hasError = isValid;
    return isValid;
  }

  resetTimePicker(row: AttendanceEditorBrowser) {
    row.inTime = '';
    row.outTime = '';
    row.status = AttendanceStatusEnum.NotMarked;
  }

  onAbsentCheckBoxChanged(event: any, row: AttendanceEditorBrowser) {
    if (event.checked) {
      row.status = AttendanceStatusEnum.Absent;
    } else {
      row.status = AttendanceStatusEnum.NotMarked;
    }
    this.resetTimePicker(row);
  }

  private buildDateTime(timeString: string): string | null {
    const timeArr = timeString.split(' ');
    if (timeArr.length <= 0) return null;
    const time = timeArr[0].split(':');
    if (time.length < 2) return null;
    const hour = +time[0];
    const mins = +time[1];
    const attendanceDate = new Date(
      new Date(this.form.controls.attendanceDate.value).setHours(
        timeArr[1].trim() === 'AM' ? hour : hour + 12,
        mins,
        0,
        0
      )
    );
    return this.datePipe.transform(attendanceDate, 'YYYY-MM-dd HH:mm:ss') ?? '';
  }

  private setupColumns(statusTemplate: TemplateRef<any>) {
    return [
      {
        key: 'sno',
        name: 'S.No.',
        type: GridColumnType.Sno,
      },
      {
        key: Helper.nameof<AttendanceEditorBrowser>('name'),
        name: 'Employee',
        type: GridColumnType.String,
      },
      {
        key: Helper.nameof<AttendanceEditorBrowser>('status'),
        name: 'Status',
        template: statusTemplate,
        type: GridColumnType.Template,
      },
    ];
  }

  private getAttendanceUnit(status: number) {
    switch (status) {
      case AttendanceStatusEnum.Present:
        return 1;
      case AttendanceStatusEnum.HalfDay:
        return 0.5;
    }
    return 0;
  }
}
