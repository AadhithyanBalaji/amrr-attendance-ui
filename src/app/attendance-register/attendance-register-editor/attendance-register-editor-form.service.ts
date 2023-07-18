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
    if (Helper.isNullOrUndefined(this.getAttendanceDate())) return;

    const attendanceRecords = this.dataSource.data
      .filter((x) => Helper.isTruthy(x.status) && x.payCycleTypeId === 1)
      .map((x) => ({
        employeeId: x.id,
        isPresent:
          x.status === AttendanceStatusEnum.Present.toString() ||
          x.status === AttendanceStatusEnum.HalfDay.toString(),
        attendanceUnit: this.getAttendanceUnit(x.status),
      }));

    const dailyWagesAttendanceRecords = this.dataSource.data
      .filter((x) => Helper.isTruthy(x.status) && x.payCycleTypeId === 3)
      .map((x) => ({
        employeeId: x.id,
        inTime: x.inTime.replace('T', ' ').replace('Z', ''),
        outTime: x.outTime.replace('T', ' ').replace('Z', ''),
      }));

    this.saving = true;
    combineLatest([
      this.apiBusinessService.post('attendance', {
        attendanceRecords: attendanceRecords,
        attendanceDate: this.getAttendanceDate(),
        unitId: this.form.controls.unitId.value?.id,
      }),
      this.apiBusinessService.post('attendance/daily', {
        attendanceRecords: dailyWagesAttendanceRecords,
        attendanceDate: this.getAttendanceDate(),
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

  getAttendanceRegister() {
    this.getAttendanceGridData();
  }

  getUnMarkedCount() {
    return this.dataSource.data.filter((x) =>
      Helper.isNullOrUndefined(x.status)
    ).length;
  }

  getEmployeeCount(status: AttendanceStatusEnum) {
    return this.dataSource.data.filter(
      (x) => Helper.isTruthy(x.status) && x.status === status.toString()
    ).length;
  }

  inTimeChanged(timeString: string, row: AttendanceEditorBrowser) {
    row.inTime = this.buildDateTime(timeString) ?? '';
    row.status = this.getStatusEnumForDailyWages(row.inTime, row.outTime);
  }

  outTimeChanged(timeString: string, row: AttendanceEditorBrowser) {
    row.outTime = this.buildDateTime(timeString) ?? '';
    row.status = this.getStatusEnumForDailyWages(row.inTime, row.outTime);
  }

  getTimeString(dateTimeString: string): string {
    return (dateTimeString ?? '') !== ''
      ? this.datePipe.transform(
          dateTimeString.replace('Z', '').replace('T', ' '),
          'shortTime'
        ) ?? ''
      : '';
  }

  isTimeRangeInvalid(inTimeString: string, outTimeString: string): boolean {
    console.log(inTimeString, outTimeString);
    return (inTimeString ?? '') !== '' && (outTimeString ?? '') !== ''
      ? new Date(inTimeString) >= new Date(outTimeString)
      : false;
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

  private getAttendanceDate() {
    return (
      this.datePipe.transform(
        new Date(
          new Date(this.form.controls.attendanceDate.value).setHours(0, 0, 0, 0)
        ),
        'YYYY-MM-dd HH:mm:ss'
      ) ?? ''
    );
  }

  private getAttendanceGridData() {
    if (!this.form.valid && !this.form.dirty) return;
    const date = this.getAttendanceDate();
    const unitId = this.form.controls.unitId.value?.id;
    if (Helper.isNullOrUndefined(date) || Helper.isNullOrUndefined(unitId))
      return;
    this.loading = true;
    this.apiBusinessService
      .get(`attendance/editor/${date}/${unitId}`)
      .pipe(take(1))
      .subscribe((data: any) => {
        const entries: AttendanceRegisterEntry[] =
          data.recordset satisfies AttendanceRegisterEntry[];
        const convData = entries.map((x) => ({
          id: x.employeeId,
          name: x.employeeName,
          payCycleTypeId: x.payCycleTypeId,
          inTime: x.inTime,
          outTime: x.outTime,
          status:
            x.payCycleTypeId === 1
              ? this.getStatusEnum(x.isPresent, x.attendanceUnit)
              : this.getStatusEnumForDailyWages(x.inTime, x.outTime),
        }));
        this.dataSource = new MatTableDataSource(convData);
        this.queriedDate = date;
        this.loading = false;
      });
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

  private getAttendanceUnit(status: string | null) {
    switch (status) {
      case AttendanceStatusEnum.Present.toString():
        return 1;
      case AttendanceStatusEnum.HalfDay.toString():
        return 0.5;
    }
    return 0;
  }

  private getStatusEnum(isPresent: boolean, attendanceUnit: number) {
    if (isPresent && attendanceUnit > 0.5)
      return AttendanceStatusEnum.Present.toString();
    if (isPresent && attendanceUnit === 0.5)
      return AttendanceStatusEnum.HalfDay.toString();
    if (Helper.isTruthy(isPresent) && !isPresent)
      return AttendanceStatusEnum.Absent.toString();
    return null;
  }

  private getStatusEnumForDailyWages(
    inTimeString: string,
    outTimeString: string
  ) {
    if ((inTimeString ?? '') === '' || (outTimeString ?? '') === '')
      return null;
    var inTime = new Date(inTimeString);
    var outTime = new Date(outTimeString);
    var hours = Math.abs(outTime.getTime() - inTime.getTime()) / 36e5;
    if (hours > 5) return AttendanceStatusEnum.Present.toString();
    if (hours > 0 && hours <= 5) return AttendanceStatusEnum.HalfDay.toString();
    if (hours <= 0) return AttendanceStatusEnum.Absent.toString();
    return null;
  }
}
