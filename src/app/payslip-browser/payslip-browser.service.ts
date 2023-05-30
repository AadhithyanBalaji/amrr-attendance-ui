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
import { AmrrEmployee } from '../control-panel/employee-browser/amrr-employee.model';
import { IAmrrTypeahead } from '../shared/amrr-typeahead.interface';

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
  employees: AmrrEmployee[] = [];

  form = new FormGroup({
    month: new FormControl(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      [Validators.required]
    ),
    company: new FormControl({}, [Validators.required]),
    unit: new FormControl(),
    employee: new FormControl(),
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
        this.units = data.recordset as AmrrUnit[];

        const companyNames = this.units.map((u) => {
          return { id: u.companyId, name: u.companyName };
        });
        this.companies = Helper.addAllOption(Helper.getUnique(companyNames));

        this.setupFormListeners();
        this.form.controls.company.setValue({ id: 0, name: 'All' });
        this.getBrowserData({
          month: Helper.getAttendanceDate(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            this.datePipe
          ),
        });
      });
  }

  monthSelected(event: any, dp: any, input: any) {
    dp.close();
    input.value = event.toISOString().split('-').join('/').substr(0, 7);
    this.form.controls.month.setValue(event.toDate());
  }

  onViewClicked() {
    const filterData = this.getFilterData();
    if (Helper.isNullOrUndefined(filterData)) {
      return;
    }
    this.getBrowserData(filterData);
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
        this.onViewClicked();
      });
  }

  generateESIReport() {}
  displayBonusModal() {}

  private getBrowserData(filterData: any) {
    this.loading = true;
    this.apiBusinessService
      .post('payslip/filter', filterData)
      .pipe(take(1))
      .subscribe((results: any) => {
        this.dataSource = new MatTableDataSource(results.recordset);
        this.loading = false;
      });
  }

  private setupFormListeners() {
    this.form.controls.company.valueChanges.subscribe((company: any) => {
      const filteredUnits =
        company.id === 0
          ? this.units
          : this.units.filter((u) => u.companyId === company.id);

      this.filteredUnits = Helper.addAllOption(filteredUnits);
      this.form.controls.unit.setValue({ id: 0, name: 'All' });
    });

    this.form.controls.unit.valueChanges.subscribe((unit: any) => {
      this.apiBusinessService
        .get(`employee/${unit.id}`)
        .pipe(take(1))
        .subscribe((employees: any) => {
          const dataSet = employees.recordset satisfies AmrrEmployee[];
          this.employees = Helper.addAllOption(dataSet);
          this.form.controls.employee.setValue({ id: 0, name: 'All' });
        });
    });
  }

  private getFilterData() {
    const value = this.form.value;
    this.form.markAllAsTouched();
    return this.form.valid
      ? {
          month: Helper.getAttendanceDate(value.month, this.datePipe),
          companyId: (value.company as IAmrrTypeahead)?.id,
          unitId: (value.unit as IAmrrTypeahead)?.id,
          employeeId: (value.employee as IAmrrTypeahead)?.id,
        }
      : null;
  }
}
