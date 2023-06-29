import { DatePipe } from '@angular/common';
import { Injectable, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { Unit } from 'src/app/models/unit.model';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { AttendanceRegisterEntry } from './attendance-register-entry.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import Helper from 'src/app/shared/helper';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { PayslipService } from 'src/app/payslip-browser/payslip.service';
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
    private readonly router: Router,
    private readonly payslipService: PayslipService
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
      .filter((x) => Helper.isTruthy(x.status))
      .map((x) => ({
        employeeId: x.id,
        isPresent:
          x.status === AttendanceStatusEnum.Present.toString() ||
          x.status === AttendanceStatusEnum.HalfDay.toString(),
        attendanceUnit: this.getAttendanceUnit(x.status),
      }));

    this.saving = true;
    this.apiBusinessService
      .post('attendance', {
        attendanceRecords: attendanceRecords,
        attendanceDate: this.getAttendanceDate(),
      })
      .pipe(take(1))
      .subscribe((_) => {
        this.snackBar.open('Updated Attendance Register');
        const attendanceDateForm = new Date(
          this.form.controls.attendanceDate.value
        );
        const lastBusinessDay = this.getLastBusinessDay(
          new Date(this.form.controls.attendanceDate.value)
        );
        if (attendanceDateForm.getDate() === lastBusinessDay.getDate()) {
          this.requestPayslipGeneration();
        }
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
          status: this.getStatusEnum(x.isPresent, x.attendanceUnit),
        }));
        this.dataSource = new MatTableDataSource(convData);
        this.queriedDate = date;
        this.loading = false;
      });
  }

  private requestPayslipGeneration() {
    const companyId =
      this.units.find((u) => u.id === this.form.controls.unitId.value?.id)
        ?.companyId ?? 0;
    const payCycleDate = Helper.getAttendanceDate(
      this.form.controls.attendanceDate.value,
      this.datePipe
    );
    this.payslipService.generatePayslips(payCycleDate, companyId);
  }

  private getLastBusinessDay(date: Date) {
    const noOfDays = Helper.getNoOfDays(date);
    const lastWorkingDayOfTheMonth = new Date(
      date.getFullYear(),
      date.getMonth(),
      noOfDays
    );
    while (lastWorkingDayOfTheMonth.getDay() === 0) {
      lastWorkingDayOfTheMonth.setDate(lastWorkingDayOfTheMonth.getDate() - 1);
    }
    return lastWorkingDayOfTheMonth;
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
}
