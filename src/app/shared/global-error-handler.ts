import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AmrrModalType } from './amrr-modal/amrr-modal-type.enum';
import { AmrrModalComponent } from './amrr-modal/amrr-modal.component';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private readonly dialog: MatDialog,
    private readonly zone: NgZone
  ) {}

  handleError(error: any): void {
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }

    this.zone.run(() => {
      this.dialog.open(AmrrModalComponent, {
        data: {
          title: `Error - ${error?.status}`,
          body: `An unexpected error occurred. Please contact tech support. Additional info : ${error?.error}.`,
          actionText1: 'Ok',
          type: AmrrModalType.Alert,
        },
      });
    });
    console.log('Error from global error handler', error);
  }
}
