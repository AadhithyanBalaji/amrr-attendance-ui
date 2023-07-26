import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiBusinessService } from '../api-business.service';
import { AmrrUnit } from 'src/app/control-panel/unit-browser/amrr-unit.model';
import { take } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Helper from '../helper';
import { AuthService } from 'src/app/auth/auth.service';
import { IAmrrTypeahead } from '../amrr-typeahead.interface';
import { AmrrEmployee } from 'src/app/control-panel/employee-browser/amrr-employee.model';

@Component({
  selector: 'app-amrr-report-filters',
  templateUrl: './amrr-report-filters.component.html',
  styleUrls: ['./amrr-report-filters.component.css'],
})
export class AmrrReportFiltersComponent implements OnInit {
  @Input() transactionTypeId: number;
  @Input() enableAllOptions = true;
  @Input() showCheckBox = false;
  @Input() checkBoxText: string;
  @Output() onViewClicked = new EventEmitter<any>();

  companies: IAmrrTypeahead[] = [];
  units: AmrrUnit[] = [];
  filteredUnits: AmrrUnit[] = [];
  employees: AmrrEmployee[] = [];

  form = new FormGroup({
    month: new FormControl(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      [Validators.required]
    ),
    company: new FormControl({}, [Validators.required]),
    employee: new FormControl(),
    unit: new FormControl(),
  });

  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
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
        this.onViewClicked.emit({
          generatedOn: Helper.getAttendanceDate(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            this.datePipe
          ),
          companyId: 0,
          unitId: 0,
          employeeId: 0,
        });
      });
  }

  monthSelected(event: any, dp: any, input: any) {
    dp.close();
    input.value = event.toISOString().split('-').join('/').substr(0, 7);
    this.form.controls.month.setValue(event.toDate());
  }

  onView() {
    const filterData = this.getFilterData();
    this.onViewClicked.emit(filterData);
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
        .get(`employee/${unit.id}/0`)
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
    return {
      generatedOn: Helper.getAttendanceDate(value.month, this.datePipe),
      companyId: (value.company as any)?.id,
      unitId: (value.unit as any)?.id,
      employeeId: (value.employee as any)?.id,
    };
  }
}
