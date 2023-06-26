import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, pairwise, startWith, take } from 'rxjs';
import { Unit } from 'src/app/models/unit.model';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { AttendanceRegisterEntry } from './attendance-register-entry.model';
import { AttendanceRecord } from './attendance-record.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import Helper from 'src/app/shared/helper';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { AmrrModalComponent } from 'src/app/shared/amrr-modal/amrr-modal.component';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { PayslipService } from 'src/app/payslip-browser/payslip.service';

@Injectable()
export class AttendanceRegisterEditorFormService {
  form: FormGroup<{
    attendanceDate: FormControl<any>;
    unitId: FormControl<any>;
  }>;
  units: Unit[] = [];

  totalEntries: AttendanceRegisterEntry[] = [];
  filteredTotalEntries: AttendanceRegisterEntry[] = [];
  absentEntries: AttendanceRegisterEntry[] = [];
  presentEntries: AttendanceRegisterEntry[] = [];
  halfDayEntries: AttendanceRegisterEntry[] = [];
  totalEntriesFilter = new FormControl();

  saving = false;
  areEntriesDirty: boolean;
  entries: AttendanceRegisterEntry[] = [];
  queriedDate: string;

  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly payslipService: PayslipService
  ) {}

  init() {
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
          this.setupFormListeners();
        });
    }
  }

  addAttendance() {
    const attendanceRecords: AttendanceRecord[] = [
      ...this.presentEntries.map(
        (x) => new AttendanceRecord(x.employeeId, true, 1)
      ),
      ...this.absentEntries.map(
        (x) => new AttendanceRecord(x.employeeId, false, 0)
      ),
      ...this.halfDayEntries.map(
        (x) => new AttendanceRecord(x.employeeId, true, 0.5)
      ),
    ];

    if (
      attendanceRecords.length === 0 ||
      Helper.isNullOrUndefined(this.getAttendanceDate()) ||
      this.filteredTotalEntries.length !== 0
    )
      return;

    this.apiBusinessService
      .post('attendance', {
        attendanceRecords: attendanceRecords,
        attendanceDate: this.getAttendanceDate(),
      })
      .pipe(take(1))
      .subscribe((_) => {
        this.snackBar.open('Updated Attendance Register');
        this.areEntriesDirty = false;
        const attendanceDateForm = new Date(
          this.form.controls.attendanceDate.value
        );
        const lastBusinessDay = this.getLastBusinessDay(
          new Date(this.form.controls.attendanceDate.value)
        );
        if (attendanceDateForm.getDate() === lastBusinessDay.getDate()) {
          this.requestPayslipGeneration();
        }
      });
  }

  addAttendanceAndClose() {}

  cancel() {
    if (this.areEntriesDirty) {
      this.dialog
        .open(AmrrModalComponent, {
          data: {
            title: 'Unsaved Changes',
            body: `You will lose changes to attendance entries for the date ${this.getAttendanceDate()}. Are you sure to exit?`,
          },
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) =>
          result ? this.router.navigate(['register']) : null
        );
    } else {
      this.router.navigate(['register']);
    }
  }

  drop(event: any) {
    this.areEntriesDirty = true;
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    const absentEntries = this.absentEntries;
    const presentEntries = this.presentEntries;
    const halfDayEntries = this.halfDayEntries;
    this.totalEntries = this.totalEntries.filter(function (el) {
      return (
        !presentEntries.includes(el) &&
        !absentEntries.includes(el) &&
        !halfDayEntries.includes(el)
      );
    });

    this.totalEntriesFilter.setValue('');
  }

  getAttendanceRegister() {
    if (this.areEntriesDirty) {
      this.dialog
        .open(AmrrModalComponent, {
          data: {
            title: 'Unsaved Changes',
            body: `You will lose changes to attendance entries for the date ${this.getAttendanceDate()}. Are you sure to change selection?`,
          },
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => (result ? this.updateAttendanceEditor() : null));
    } else {
      this.updateAttendanceEditor();
    }
  }

  getAttendanceDate() {
    return (
      this.datePipe.transform(
        new Date(
          new Date(this.form.controls.attendanceDate.value).setHours(0, 0, 0, 0)
        ),
        'YYYY-MM-dd HH:mm:ss'
      ) ?? ''
    );
  }

  private setupFormListeners() {
    this.totalEntriesFilter.valueChanges
      .pipe(debounceTime(300))
      .subscribe(
        (name: string) =>
          (this.filteredTotalEntries =
            Helper.isTruthy(name) && name.length > 0
              ? this.totalEntries.filter((e) =>
                  e.employeeName.toLowerCase().includes(name.toLowerCase())
                )
              : this.totalEntries)
      );
  }

  private updateAttendanceEditor() {
    if (!this.form.valid && !this.form.dirty) return;
    const date = this.getAttendanceDate();
    const unitId = this.form.controls.unitId.value?.id;
    if (Helper.isNullOrUndefined(date) || Helper.isNullOrUndefined(unitId))
      return;
    this.apiBusinessService
      .get(`attendance/editor/${date}/${unitId}`)
      .pipe(take(1))
      .subscribe((data: any) => {
        const entries = data.recordset satisfies AttendanceRegisterEntry[];
        this.entries = entries;
        this.filteredTotalEntries = this.totalEntries = entries.filter(
          (e: AttendanceRegisterEntry) => Helper.isNullOrUndefined(e.isPresent)
        );
        this.presentEntries = entries.filter(
          (e: AttendanceRegisterEntry) =>
            Helper.isTruthy(e.isPresent) && e.attendanceUnit > 0.5
        );
        this.absentEntries = entries.filter(
          (e: AttendanceRegisterEntry) =>
            Helper.isTruthy(e.isPresent) && e.isPresent
        );
        this.halfDayEntries = entries.filter(
          (e: AttendanceRegisterEntry) =>
            Helper.isTruthy(e.isPresent) && e.attendanceUnit === 0.5
        );
        this.queriedDate = date;
        this.areEntriesDirty = false;
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
    while (!this.isBusinessDay(date)) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  private isBusinessDay(date: Date) {
    var day = date.getDay();
    if (day == 0) {
      return false;
    }
    return true;
  }
}
