import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AttendanceRegisterFormService {
  constructor(private readonly router: Router) {}

  navigateToAddAttendance() {
    this.router.navigate(['attendanceEditor']);
  }
}
