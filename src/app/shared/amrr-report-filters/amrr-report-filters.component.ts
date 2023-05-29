import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';

import { AmrrReportFilters } from './amrr-report-filters.model';
import { ApiBusinessService } from '../api-business.service';
import { AmrrCompany } from 'src/app/control-panel/company-browser/amrr-company.model';
import { AmrrUnit } from 'src/app/control-panel/unit-browser/amrr-unit.model';
import { combineLatest, filter, take } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Helper from '../helper';

@Component({
  selector: 'app-amrr-report-filters',
  templateUrl: './amrr-report-filters.component.html',
  styleUrls: ['./amrr-report-filters.component.css'],
  //providers: [AmrrReportFiltersFormService],
})
export class AmrrReportFiltersComponent implements OnInit {
  @Input() transactionTypeId: number;
  @Input() enableAllOptions = true;
  @Input() showCheckBox = false;
  @Input() checkBoxText: string;
  @Output() onViewClicked = new EventEmitter<any>();

  companies: AmrrCompany[] = [];
  units: AmrrUnit[] = [];
  form = new FormGroup({
    fromDate: new FormControl(new Date()),
    toDate: new FormControl(new Date()),
    company: new FormControl(null, [Validators.required]),
    unit: new FormControl(null),
  });
  //constructor(readonly formService: AmrrReportFiltersFormService) {}
  constructor(
    readonly apiBusinessService: ApiBusinessService,
    readonly datePipe: DatePipe
  ) {}
  ngOnInit(): void {
    // this.formService.init(
    //   this.onViewClicked,
    //   this.enableAllOptions,
    //   this.transactionTypeId
    // );
    combineLatest([
      this.apiBusinessService.get('company'),
      this.apiBusinessService.get('unit'),
    ])
      .pipe(take(1))
      .subscribe((data: any) => {
        this.companies = data[0].recordset as AmrrCompany[];
        this.units = data[1].recordset as AmrrUnit[];
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
