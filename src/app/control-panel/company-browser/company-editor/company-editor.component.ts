import { Component, Inject, OnInit } from '@angular/core';
import { CompanyEditorFormService } from './company-editor-form.service';
import { AmrrCompany } from '../amrr-company.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-company-editor',
  templateUrl: './company-editor.component.html',
  providers: [CompanyEditorFormService],
})
export class CompanyEditorComponent implements OnInit {
  constructor(
    readonly formService: CompanyEditorFormService,
    @Inject(MAT_DIALOG_DATA) public data: AmrrCompany,
    private readonly dialogRef: MatDialogRef<CompanyEditorComponent>
  ) {}
  ngOnInit(): void {
    this.formService.init(this.dialogRef, this.data);
  }
}
