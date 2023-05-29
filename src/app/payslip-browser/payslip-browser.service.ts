import { Injectable } from '@angular/core';
import {
  GridColumnType,
  IAmmrGridColumn,
} from '../shared/ammr-grid/ammr-grid-column.interface';
import Helper from '../shared/helper';
import { PayslipBrowser } from './payslip-browser.model';
import { ApiBusinessService } from '../shared/api-business.service';
import { combineLatest, take } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AmrrCompany } from '../control-panel/company-browser/amrr-company.model';
import { AmrrUnit } from '../control-panel/unit-browser/amrr-unit.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PdfService } from './pdf.service';

@Injectable({
  providedIn: 'root',
})
export class PayslipBrowserService {
  columns: IAmmrGridColumn[] = [
    {
      key: 'sno',
      name: 'S.No.',
      type: GridColumnType.Sno,
    },
    {
      key: Helper.nameof<PayslipBrowser>('payCycle'),
      name: 'Month',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<PayslipBrowser>('employeeName'),
      name: 'Employee',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<PayslipBrowser>('unitName'),
      name: 'Unit',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<PayslipBrowser>('companyName'),
      name: 'Company',
      type: GridColumnType.String,
    },
    {
      key: Helper.nameof<PayslipBrowser>('workingDays'),
      name: 'Working Days',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<PayslipBrowser>('offDays'),
      name: 'Absent Days',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<PayslipBrowser>('companyHolidays'),
      name: 'Company Holidays',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<PayslipBrowser>('esiComponent'),
      name: 'ESI',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<PayslipBrowser>('pfComponent'),
      name: 'PF',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<PayslipBrowser>('bonusComponent'),
      name: 'Bonus',
      type: GridColumnType.Number,
    },
    {
      key: Helper.nameof<PayslipBrowser>('totalPay'),
      name: 'Total',
      type: GridColumnType.Number,
    },
  ];

  loading = false;
  actionLoading = false;
  dataSource: MatTableDataSource<PayslipBrowser, MatPaginator>;

  companies: AmrrCompany[] = [];
  filteredUnits: AmrrUnit[] = [];
  units: AmrrUnit[] = [];

  form = new FormGroup({
    month: new FormControl(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      [Validators.required]
    ),
    company: new FormControl(null, [Validators.required]),
    unit: new FormControl(null),
  });
  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly pdfService: PdfService
  ) {}

  init() {
    this.apiBusinessService
      .get(`unit/${this.authService.getUserId()}`)
      .pipe(take(1))
      .subscribe((data: any) => {
        this.filteredUnits = this.units = data.recordset as AmrrUnit[];
        const companyNames = this.units.map((u) => {
          return { id: u.companyId, name: u.companyName };
        });
        this.companies = Helper.getUnique(companyNames);
        this.form.controls.company.valueChanges.subscribe((company: any) => {
          this.filteredUnits = this.units.filter(
            (u) => u.companyId === company.id
          );
        });
      });
  }

  monthSelected(event: any, dp: any, input: any) {
    dp.close();
    input.value = event.toISOString().split('-').join('/').substr(0, 7);
    this.form.controls.month.setValue(event.toDate());
  }

  onViewClicked(printPayslips = false) {
    const filterData = this.getFilterData();
    if (Helper.isNullOrUndefined(filterData)) {
      return;
    }
    this.loading = true;
    this.apiBusinessService
      .post('payslip/filter', filterData)
      .pipe(take(1))
      .subscribe((results: any) => {
        this.dataSource = new MatTableDataSource(results.recordset);
        if (printPayslips) {
          this.pdfService.generatePayslips(filterData, results.recordset);
        }
        this.loading = false;
      });
  }

  generatePayslips() {
    const filterData = this.getFilterData();
    if (Helper.isNullOrUndefined(filterData)) {
      return;
    }
    this.actionLoading = true;
    this.apiBusinessService
      .post('payslip/generate', {
        generatedOn: Helper.getAttendanceDate(new Date(), this.datePipe),
        companyId: filterData!.companyId,
        userId: this.authService.getUserId(),
      })
      .pipe(take(1))
      .subscribe((_) => {
        this.actionLoading = false;
        this.snackBar.open('Payslips generated successfully');
        this.onViewClicked(true);
      });
  }

  generateESIReport() {}
  displayBonusModal() {}

  private getFilterData() {
    const value = this.form.value;
    this.form.markAllAsTouched();
    return this.form.valid
      ? {
          month: Helper.getAttendanceDate(value.month, this.datePipe),
          companyId: (value.company as any)?.id,
          unitId: (value.unit as any)?.id,
        }
      : null;
  }
}
