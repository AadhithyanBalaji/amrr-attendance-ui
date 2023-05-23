import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

export class DummyTypeaheadImpl implements IAmrrTypeahead {
  id: number;
  name: string;
}

@Component({
  selector: 'app-crud-editor',
  template: `<div style="width: 30vw">
    <h2 mat-dialog-title>
      {{ data && data.event?.id !== null ? 'Edit' : 'New' }}
    </h2>
    <div style="padding: 15px !important" mat-dialog-content>
      <ng-container *ngTemplateOutlet="data.formTemplate"></ng-container>
    </div>
    <div mat-dialog-actions>
      <mat-divider></mat-divider>
      <div
        style="width: 100%;        display: flex;        justify-content: end;"
      >
        <button mat-flat-button color="primary" (click)="addEntity()">
          Save
        </button>
        <button mat-flat-button color="primary" (click)="addEntityAndClose()">
          Save & Continue
        </button>
        <button mat-flat-button color="secondary" (click)="cancel()">
          Close
        </button>
      </div>
    </div>
  </div> `,
})
export class CrudEditorComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<CrudEditorComponent>
  ) {}

  addEntity() {
    this.saveEntity(true);
  }

  addEntityAndClose() {
    this.saveEntity();
  }

  cancel() {
    this.dialogRef.close(new DummyTypeaheadImpl());
  }

  saveEntity(closeDialog = false) {
    this.data.onSave.emit({
      closeDialog: closeDialog,
      dialogRef: this.dialogRef,
    });
  }
}
