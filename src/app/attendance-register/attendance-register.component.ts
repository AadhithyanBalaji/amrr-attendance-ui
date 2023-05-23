import { Component } from '@angular/core';
import { AttendanceRegisterFormService } from './attendance-register-form.service';

@Component({
  selector: 'app-attendance-register',
  templateUrl: './attendance-register.component.html',
  styleUrls: ['./attendance-register.component.css'],
  providers: [AttendanceRegisterFormService],
})
export class AttendanceRegisterComponent {
  constructor(readonly formService: AttendanceRegisterFormService) {}
}
