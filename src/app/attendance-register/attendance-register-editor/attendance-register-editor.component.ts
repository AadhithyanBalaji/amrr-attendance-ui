import { Component, OnInit } from '@angular/core';
import { AttendanceRegisterEditorFormService } from './attendance-register-editor-form.service';

@Component({
  selector: 'app-attendance-register-editor',
  templateUrl: './attendance-register-editor.component.html',
  styleUrls: ['./attendance-register-editor.component.css'],
  providers: [AttendanceRegisterEditorFormService],
})
export class AttendanceRegisterEditorComponent implements OnInit {
  constructor(readonly formService: AttendanceRegisterEditorFormService) {}

  ngOnInit(): void {
    this.formService.init();
  }
}
