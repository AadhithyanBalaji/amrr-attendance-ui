import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Helper from '../helper';
import { AmrrLoadingComponent } from './amrr-loading.component';

@Injectable()
export class AmrrLoadingDialogService {
  dialogRef: MatDialogRef<any>;
  constructor(private dialog: MatDialog) {}

  showLoading() {
    if (!Helper.isTruthy(this.dialogRef)) {
      this.dialogRef = this.dialog.open(AmrrLoadingComponent, {
        disableClose: true,
      });
    }
  }

  hideLoading() {
    this.dialogRef.close();
  }
}
