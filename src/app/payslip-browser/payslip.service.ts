import { Injectable } from '@angular/core';
import { ApiBusinessService } from '../shared/api-business.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';
import { take } from 'rxjs';

@Injectable()
export class PayslipService {
  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly snackBar: MatSnackBar,
    private readonly authService: AuthService
  ) {}

  generatePayslips(paySlipMonth: string, companyId: number) {
    const generatePayslip$ = this.apiBusinessService.post('payslip/generate', {
      generatedOn: paySlipMonth,
      companyId: companyId,
      userId: this.authService.getUserId(),
    });

    generatePayslip$.pipe(take(1)).subscribe(
      (_) => this.snackBar.open('Payslips generated successfully'),
      (error) => {
        let errMsg = error?.error;
        if (
          error?.error.includes(
            "Cannot insert the value NULL into column 'PayId'"
          )
        ) {
          errMsg =
            'Pay has not been configured for employee(s) for the selected period';
        }
        this.snackBar.open(errMsg);
      }
    );

    return generatePayslip$;
  }
}
