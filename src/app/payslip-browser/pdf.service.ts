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
    const paySlipCycle = `${Helper.getMonthName(
      paySlipDate.getMonth()
    )} ${paySlipDate.getFullYear()}`;
    let payslipContent: any[] = [];
    for (let i = 0; i < payslips.length; i++) {
      const payslip = payslips[i];
      payslipContent = [
        ...payslipContent,
        { text: 'Employer Copy', alignment: 'center' },
        this.generatePayslipDocDef(payslip, paySlipCycle, paySlipDate),
      ];
    }

    const docDef = {
      info: {
        title: `Payslips - ${paySlipCycle}`,
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

  generateBankInfo(filterData: any, payslips: PayslipBrowser[]) {
    if (
      Helper.isNullOrUndefined(filterData) ||
      Helper.isNullOrUndefined(filterData.month)
    ) {
      this.snackBar.open('Month is not selected');
      return;
    }
    if (payslips.length <= 0) {
      this.snackBar.open('No salary information to be printed');
      return;
    }
    const paySlipDate: Date = new Date(filterData.month);
    const paySlipCycle = `${Helper.getMonthName(
      paySlipDate.getMonth()
    )} ${paySlipDate.getFullYear()}`;

    let bankDetailsContent: any[] = [];

    const bankGroups = Helper.groupBy(payslips, 'bankName');
    const bankGroupNames = Object.keys(bankGroups);
    for (let i = 0; i < bankGroupNames.length; i++) {
      let bankName = bankGroupNames[i];
      const payeeList = bankGroups[bankGroupNames[i]];
      if (bankName === 'null') {
        bankName = 'Bank info not found';
      }
      bankDetailsContent = [
        ...bankDetailsContent,
        { text: bankName, alignment: 'center' },
        [
          {
            style: 'tableExample',
            color: '#444',
            table: {
              widths: ['*', '*', '*', '*'],
              headerRows: 1,
              body: [
                [
                  {
                    text: `Employee Name`,
                    style: 'tableMainHeader',
                    alignment: 'center',
                  },
                  {
                    text: `Salary payable`,
                    style: 'tableMainHeader',
                    alignment: 'center',
                  },
                  {
                    text: `Account Number`,
                    style: 'tableMainHeader',
                    alignment: 'center',
                  },
                  {
                    text: `IFSC`,
                    style: 'tableMainHeader',
                    alignment: 'center',
                  },
                ],
                ...this.generatePayeeList(payeeList),
              ],
            },
          },
        ],
        i == bankGroupNames.length - 1
          ? { text: '' }
          : { text: '', pageBreak: 'after' },
      ];
    }

    const docDef = {
      info: {
        title: `Bank Details - ${paySlipCycle}`,
        author: 'AMRR',
        subject: 'Bank Info',
        keywords: 'amrr bank transfer',
      },
      pageSize: 'A4',
      content: bankDetailsContent,
      styles: this.getPdfStyles(),
      defaultStyle: {
        columnGap: 20,
        color: 'black',
      },
    };

    this.printPdf(docDef);
  }

  private generatePayeeList(payeeList: PayslipBrowser[]): any[] {
    const list: any[] = [];
    payeeList.forEach((payee) => {
      list.push([
        {
          text: payee.employeeName,
          alignment: 'center',
        },
        {
          text: this.getTotalSalaryPaid(payee),
          alignment: 'center',
        },
        {
          text: payee.accountNumber,
          alignment: 'center',
        },
        {
          text: payee.ifsc,
          alignment: 'center',
        },
      ]);
    });
    return list;
  }

  private generatePayslipDocDef(
    payslip: PayslipBrowser,
    paySlipCycle: string,
    paySlipDate: Date
  ) {
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
                text: `PAY SLIP FOR ${paySlipCycle.toUpperCase()}`,
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
                text: 'Salary Information',
                style: 'tableMainHeader',
                colSpan: 4,
                alignment: 'center',
              },
              { text: '' },
              { text: '' },
              { text: '' },
            ],
            [
              {
                text: 'Working Days',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: `${payslip.workingDays - payslip.weekendsCount} + ${
                  payslip.weekendsCount
                }`,
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: `EPFO PAID BY COMPANY`,
                style: 'tableMainHeader',
                alignment: 'center',
                rowSpan: 2,
                margin: [0, 7, 0, 0],
              },
              {
                text: `ESI PAID BY COMPANY`,
                style: 'tableMainHeader',
                alignment: 'center',
                rowSpan: 2,
                margin: [0, 7, 0, 0],
              },
            ],
            [
              {
                text: `ESI & EPFO BOTH CONTRIBUTION PAID BY COMPANY`,
                style: 'tableMainHeader',
                alignment: 'center',
                colSpan: 2,
              },
              '',
              '',
              '',
            ],
            [
              {
                text: `BASIC SALARY + DA`,
                alignment: 'center',
              },
              {
                text: payslip.basicComponent?.toFixed(2) ?? '-',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.pfComponent?.toFixed(2) ?? '-',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: payslip.esiComponent?.toFixed(2) ?? '-',
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            [
              {
                text: `HRA`,
                alignment: 'center',
              },
              {
                text: payslip.hraComponent?.toFixed(2) ?? '-',
                style: 'tableHeader',
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              {
                text: `PETROL ALLOWANCE`,
                alignment: 'center',
              },
              {
                text: payslip.petrolAllowance?.toFixed(2) ?? '-',
                style: 'tableHeader',
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              {
                text: `TOTAL SALARY PAID THROUGH BANK`,
                style: 'tableMainHeader',
                alignment: 'center',
              },
              {
                text: this.getTotalSalaryPaid(payslip),
                style: 'tableHeader',
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              {
                text: `TOTAL COST TO COMPANY`,
                alignment: 'center',
                colSpan: 2,
              },
              {},
              {
                text: (
                  (payslip.basicComponent ?? 0) +
                  (payslip.hraComponent ?? 0) +
                  (payslip.petrolAllowance ?? 0) +
                  (payslip.esiComponent ?? 0) +
                  (payslip.pfComponent ?? 0)
                ).toFixed(2),
                style: 'tableHeader',
                alignment: 'center',
                colSpan: 2,
              },
              {},
            ],
            [
              {
                colSpan: 2,
                rowSpan: 4,
                text: `EMPLOYEE SIGNATURE`,
                style: 'tableMainHeader',
              },
              { text: '' },
              {
                colSpan: 2,
                rowSpan: 4,
                text: 'HR MANAGER SIGNATURE',
                style: 'tableMainHeader',
              },
              { text: '' },
            ],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
          ],
        },
      },
    ];
  }

  private buildCompanyInformation(payslip: PayslipBrowser) {
    return [
      [
        {
          text: payslip.companyName.toUpperCase(),
          style: 'tableMainHeader',
          colSpan: 4,
          alignment: 'center',
        },
        {},
        {},
        {},
      ],
      [
        {
          text: 'Company Address',
        },
        {
          colSpan: 3,
          text: `${payslip.companyAddressLine1} ${this.validateAddressString(
            payslip.companyAddressLine2
          )} ${this.validateAddressString(payslip.companyAddressLine3)}, ${
            payslip.companyPostalCode
          }`,
        },
        {},
        {},
      ],
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
      [
        {
          text: 'Employee Address',
        },
        {
          colSpan: 3,
          text: `${payslip.employeeAddressLine1} ${this.validateAddressString(
            payslip.employeeAddressLine2
          )} ${this.validateAddressString(payslip.employeeAddressLine3)}, ${
            payslip.employeePostalCode
          }`,
        },
        {},
        {},
      ],
      [
        {
          text: `Phone # : ${this.validateString(payslip.employeePhoneNumber)}`,
        },
        {
          text: `UAN # : ${this.validateString(payslip.uanNo)}`,
        },
        {
          text: `ESI # : ${this.validateString(payslip.esiNo)}`,
        },
        {
          text: `Aadhar # : ${this.validateString(payslip.aadharNo)}`,
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

  private validateAddressString(str: string) {
    return Helper.isNullOrUndefined(str) || str === '' ? '' : ',' + str;
  }

  private validateString(str: string) {
    return Helper.isNullOrUndefined(str) || str === '' ? '' : str;
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
      quote: {
        italics: true,
        bold: true,
      },
      small: {
        fontSize: 8,
      },
    };
  }

  private getTotalSalaryPaid(paySlip: PayslipBrowser) {
    return (
      (paySlip.basicComponent ?? 0) +
      (paySlip.hraComponent ?? 0) +
      (paySlip.petrolAllowance ?? 0)
    ).toFixed(2);
  }
}
