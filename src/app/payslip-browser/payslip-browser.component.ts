import { Component, OnInit } from '@angular/core';
import { PayslipBrowserService } from './payslip-browser.service';

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-payslip-browser',
  templateUrl: './payslip-browser.component.html',
  styleUrls: ['./payslip-browser.component.css'],
  providers: [
    PayslipBrowserService,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PayslipBrowserComponent implements OnInit {
  constructor(readonly browserService: PayslipBrowserService) {}
  ngOnInit(): void {
    this.browserService.init();
  }
}
