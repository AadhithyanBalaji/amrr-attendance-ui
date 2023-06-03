import { DatePipe, DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { PayslipBrowser } from './payslip-browser.model';
import Helper from '../shared/helper';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class PdfService {
  exporting = false;
  headerHeight = 15;
  normalHeight = 10;

  constructor(private readonly snackBar: MatSnackBar) {}

  generatePayslips(filterData: any, payslips: PayslipBrowser[]) {
    if (
      Helper.isNullOrUndefined(filterData) ||
      Helper.isNullOrUndefined(filterData.month)
    ) {
      this.snackBar.open('Month is not selected');
      return;
    }
    if (payslips.length <= 0) {
      this.snackBar.open('No payslips to be printed');
      return;
    }
    const paySlipDate: Date = new Date(filterData.month);
    let payslipContent: any[] = [];
    for (let i = 0; i < payslips.length; i++) {
      const payslip = payslips[i];
      payslipContent = [
        ...payslipContent,
        { text: 'Employer Copy', alignment: 'center' },
        this.generatePayslipDocDef(payslip),
        { text: 'Employee Copy', alignment: 'center' },
        this.generatePayslipDocDef(payslip),
        i == payslips.length - 1
          ? { text: '' }
          : { text: '', pageBreak: 'after' },
      ];
    }

    const docDef = {
      info: {
        title: `Payslips - ${Helper.getMonthName(
          paySlipDate.getMonth()
        )} ${paySlipDate.getFullYear()}`,
        author: 'AMRR',
        subject: 'Payslips',
        keywords: 'amrr payslips',
      },
      content: payslipContent,
      styles: this.getPdfStyles(),
      defaultStyle: {
        columnGap: 20,
        color: 'black',
      },
    };

    this.printPdf(docDef);
  }

  private generatePayslipDocDef(payslip: PayslipBrowser) {
    return [
      {
        style: 'tableExample',
        color: '#444',
        table: {
          widths: ['*', '*', '*', '*'],
          heights: [
            this.headerHeight,
            this.headerHeight,
            this.normalHeight,
            this.normalHeight,
            this.normalHeight,
            this.headerHeight,
            this.normalHeight,
            this.normalHeight,
            this.normalHeight,
            this.headerHeight,
            this.normalHeight,
            this.normalHeight,
            this.normalHeight,
            this.normalHeight,
            this.normalHeight,
            this.headerHeight,
            this.headerHeight,
            this.headerHeight,
          ],
          headerRows: 2,
          body: [
            [
              {
                text: 'Salary slip',
                style: 'tableMainHeader',
                colSpan: 4,
                alignment: 'center',
              },
              {},
              {},
              {},
            ],
            ...this.buildCompanyInformation(payslip),
            ...this.buildEmployeeInformation(payslip),
            [
              {
                text: 'Earnings',
                style: 'tableMainHeader',
                alignment: 'center',
              },
              {
                text: 'Amount',
                style: 'tableMainHeader',
                alignment: 'center',
              },
              {
                text: 'Attendance',
                style: 'tableMainHeader',
                alignment: 'center',
              },
              {
                text: 'Days',
                style: 'tableMainHeader',
                alignment: 'center',
              },
            ],
            [
              {
                text: 'Salary',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.grossSalary,
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: 'Working Days',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.workingDays,
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            [
              {
                text: 'Salary Payable',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.totalPay,
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: 'Days Off',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.offDays,
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            [
              {
                text: 'ESI',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.esiComponent,
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: 'Company Holidays',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.companyHolidays,
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            [
              {
                text: 'PF',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.pfComponent,
                style: 'tableHeader',
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              {
                text: 'Net Pay',
                style: 'tableMainHeader',
                alignment: 'center',
              },
              {
                text: payslip.totalPay,
                style: 'tableMainHeader',
                alignment: 'center',
              },
              { style: 'tableMainHeader', text: '' },
              { style: 'tableMainHeader', text: '' },
            ],
            [
              {
                colSpan: 4,
                text: `In words : \t ${this.inWords(payslip.totalPay)}`,
              },
            ],
            [
              {
                colSpan: 4,
                text: '',
              },
              {},
              {},
              {},
            ],
            [
              {
                colSpan: 2,
                text: `Prepared By: \t${payslip.preparedByUser}`,
                style: 'tableMainHeader',
              },
              {},
              {
                colSpan: 2,
                text: 'Received By:',
                style: 'tableMainHeader',
              },
              {},
            ],
          ],
        },
      },
    ];
  }

  private buildCompanyInformation(payslip: PayslipBrowser) {
    return [
      [
        {
          text: 'Company Information',
          style: 'tableMainHeader',
          colSpan: 4,
          alignment: 'center',
        },
        {},
        {},
        {},
      ],
      this.buildKeyValueRow('Company Name', payslip.companyName),
      this.buildKeyValueRow(
        'Company Address',
        `${payslip.companyAddressLine1} ${this.validateString(
          payslip.companyAddressLine2
        )} ${this.validateString(payslip.companyAddressLine3)}, ${
          payslip.companyPostalCode
        }`
      ),
      [
        {
          text: 'Company Phone #',
        },
        {
          text: payslip.companyPhoneNumber,
        },
        {
          text: 'Email',
        },
        {
          text: payslip.companyEmailAddress,
        },
      ],
    ];
  }

  private buildEmployeeInformation(payslip: PayslipBrowser) {
    return [
      [
        {
          text: 'Employee Information',
          style: 'tableMainHeader',
          colSpan: 4,
          alignment: 'center',
        },
        {},
        {},
        {},
      ],
      this.buildKeyValueRow('Employee Name', payslip.employeeName),
      this.buildKeyValueRow(
        'Employee Address',
        `${payslip.employeeAddressLine1} ${this.validateString(
          payslip.employeeAddressLine2
        )} ${this.validateString(payslip.employeeAddressLine3)}, ${
          payslip.employeePostalCode
        }`
      ),
      [
        {
          text: `Phone # :\n${payslip.employeePhoneNumber}`,
        },
        {
          text: `UAN # :\n${payslip.uanNo}`,
        },
        {
          text: `ESI # :\n${payslip.esiNo}`,
        },
        {
          text: `Aadhar # :\n${payslip.aadharNo}`,
        },
      ],
    ];
  }

  private buildKeyValueRow(key: string, value: string) {
    return [
      {
        colSpan: 2,
        text: key,
      },
      {},
      {
        colSpan: 2,
        text: value,
      },
      {},
    ];
  }

  private validateString(str: string) {
    return Helper.isNullOrUndefined(str) || str === '' ? '' : ',' + str;
  }

  private printPdf(docDef: any) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    isSafari
      ? pdfMake.createPdf(docDef as any).open({}, window)
      : pdfMake.createPdf(docDef as any).open();
  }

  private getPdfStyles() {
    return {
      tableExample: {
        margin: [0, 5, 0, 15],
        fontSize: 10,
        color: 'black',
      },
      tableHeader: {
        fontSize: 10,
        color: 'black',
        alignment: 'center',
      },
      tableMainHeader: {
        color: 'black',
        fillColor: '#cccccc',
        bold: true,
      },
    };
  }

  private inWords(number: number) {
    var converted = require('number-to-words');
    return `${(
      converted.toWords(number) satisfies string
    ).toUpperCase()} RUPEES ONLY `;
  }
}
