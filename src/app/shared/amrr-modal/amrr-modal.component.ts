import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AmrrModalType } from './amrr-modal-type.enum';

@Component({
  selector: 'app-amrr-modal',
  templateUrl: './amrr-modal.component.html',
  styleUrls: ['./amrr-modal.component.css'],
})
export class AmrrModalComponent {
  title: string;
  body: string;
  actionText1: string;
  actionText2: string;
  type: AmrrModalType;

  AmrrModalType = AmrrModalType;

  constructor(
    public dialogRef: MatDialogRef<AmrrModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AmrrModalComponent
  ) {
    this.title = data.title;
    this.body = data.body;
    this.actionText1 = data.actionText1 ?? 'Yes';
    this.actionText2 = data.actionText2 ?? 'No';
    this.type = data.type ?? AmrrModalType.Confirmation;
  }

  onActionOne() {
    this.dialogRef.close(true);
  }

  onActionTwo() {
    this.dialogRef.close(false);
  }
}
