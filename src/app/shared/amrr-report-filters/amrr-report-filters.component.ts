import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiBusinessService } from '../api-business.service';
import { AmrrUnit } from 'src/app/control-panel/unit-browser/amrr-unit.model';
import { take } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Helper from '../helper';
import { AuthService } from 'src/app/auth/auth.service';
import { IAmrrTypeahead } from '../amrr-typeahead.interface';

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
  form = new FormGroup({
    fromDate: new FormControl(new Date()),
    toDate: new FormControl(new Date()),
    company: new FormControl(null, [Validators.required]),
    unit: new FormControl(null),
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

  onView() {
    const filterData = this.getFilterData();
    this.onViewClicked.emit(filterData);
  }

  private getFilterData() {
    const value = this.form.value;
    return {
      fromDate: Helper.getAttendanceDate(value.fromDate, this.datePipe),
      toDate: Helper.getAttendanceDate(value.toDate, this.datePipe),
      companyId: (value.company as any)?.id,
      unitId: (value.unit as any)?.id,
    };
  }
}
