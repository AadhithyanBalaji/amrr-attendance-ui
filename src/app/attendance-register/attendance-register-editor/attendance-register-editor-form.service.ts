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

@Injectable()
export class AttendanceRegisterEditorFormService {
  form: FormGroup<{
    attendanceDate: FormControl<any>;
    unitId: FormControl<any>;
  }>;
  units: Unit[] = [];

  presentEntries: AttendanceRegisterEntry[] = [];
  filteredPresentEntries: AttendanceRegisterEntry[] = [];
  absentEntries: AttendanceRegisterEntry[] = [];
  halfDayEntries: AttendanceRegisterEntry[] = [];
  presentEntriesFilter = new FormControl();

  saving = false;
  areEntriesDirty: boolean;
  entries: AttendanceRegisterEntry[] = [];
  queriedDate: string;

  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  init() {
    this.apiBusinessService
      .get(`unit/3`)
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

  addAttendance() {
    const attendanceRecords: AttendanceRecord[] = [
      ...this.filteredPresentEntries.map(
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
      Helper.isNullOrUndefined(this.getAttendanceDate())
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
      });
  }

  addAttendanceAndClose() {}

  cancel() {}

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
    const halfDayEntries = this.halfDayEntries;
    this.presentEntries = this.presentEntries.filter(function (el) {
      return !absentEntries.includes(el) && !halfDayEntries.includes(el);
    });

    this.presentEntriesFilter.setValue('');
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
    this.presentEntriesFilter.valueChanges
      .pipe(debounceTime(300))
      .subscribe(
        (name: string) =>
          (this.filteredPresentEntries =
            Helper.isTruthy(name) && name.length > 0
              ? this.presentEntries.filter((e) =>
                  e.employeeName.toLowerCase().includes(name.toLowerCase())
                )
              : this.presentEntries)
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
        this.filteredPresentEntries = this.presentEntries = entries.filter(
          (e: AttendanceRegisterEntry) =>
            (e.isPresent || e.isPresent === null) &&
            (e.attendanceUnit === null || e.attendanceUnit > 0.5)
        );
        this.absentEntries = entries.filter(
          (e: AttendanceRegisterEntry) => e.isPresent !== null && !e.isPresent
        );
        this.halfDayEntries = entries.filter(
          (e: AttendanceRegisterEntry) =>
            e.isPresent && e.attendanceUnit === 0.5
        );
        this.queriedDate = date;
        this.areEntriesDirty = false;
      });
  }
}
