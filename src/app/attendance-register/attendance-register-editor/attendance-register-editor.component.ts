import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AttendanceRegisterEditorFormService } from './attendance-register-editor-form.service';
import { PayslipService } from 'src/app/payslip-browser/payslip.service';
import { AttendanceStatusEnum } from './attendance-status.enum';

@Component({
  selector: 'app-attendance-register-editor',
  templateUrl: './attendance-register-editor.component.html',
  styleUrls: ['./attendance-register-editor.component.css'],
  providers: [AttendanceRegisterEditorFormService, PayslipService],
})
export class AttendanceRegisterEditorComponent implements OnInit {
  @ViewChild('statusTemplate', { static: true })
  statusTemplate: TemplateRef<any>;

  statusEnum = AttendanceStatusEnum;

  constructor(readonly formService: AttendanceRegisterEditorFormService) {}

  ngOnInit(): void {
    this.formService.init(this.statusTemplate);
  }
}
