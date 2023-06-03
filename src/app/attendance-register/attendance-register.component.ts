import { Component } from '@angular/core';
import { AttendanceRegisterFormService } from './attendance-register-form.service';
import { ExcelJSService } from './exceljs.service';
import { AttendanceChartService } from './attendance-chart.service';

@Component({
  selector: 'app-attendance-register',
  templateUrl: './attendance-register.component.html',
  styleUrls: ['./attendance-register.component.css'],
  providers: [
    AttendanceRegisterFormService,
    ExcelJSService,
    AttendanceChartService,
  ],
})
export class AttendanceRegisterComponent {
  constructor(
    readonly formService: AttendanceRegisterFormService,
    readonly chartService: AttendanceChartService
  ) {}
}
