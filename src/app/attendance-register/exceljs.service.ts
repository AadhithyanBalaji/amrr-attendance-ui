import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import Helper from '../shared/helper';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ExcelJSService {
  exporting = false;
  worksheet: ExcelJS.Worksheet;
  gridHeaderRowIndex = 4;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly snackBar: MatSnackBar
  ) {}

  async exportAttendance(data: any[], filterData: any) {
    const noOfDaysInMonth = Helper.getNoOfDays(filterData.generatedOn);
    const totalColumnsCount = 6 + noOfDaysInMonth;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AMRR';
    workbook.lastModifiedBy = 'AMRR';
    workbook.created = new Date();
    workbook.modified = new Date();

    this.worksheet = workbook.addWorksheet(
      Helper.getMonthName(new Date(filterData.generatedOn).getMonth()),
      {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      }
    );

    this.setupTitle(totalColumnsCount);
    this.addYearMonthInfo(filterData, totalColumnsCount);
    this.addGridHeader(noOfDaysInMonth, totalColumnsCount);
    this.addGridData(filterData, data, noOfDaysInMonth, totalColumnsCount);
    this.sizeColumns(noOfDaysInMonth, totalColumnsCount);

    await workbook.xlsx
      .writeBuffer()
      .then((buffer) =>
        saveAs(
          new Blob([buffer]),
          `Attendance - ${this.datePipe.transform(
            new Date(),
            'dd/MM/YYYY'
          )}.xlsx`
        )
      )
      .catch((err) => this.snackBar.open('Error writing excel export' + err));
  }

  private sizeColumns(noOfDaysInMonth: number, totalColumnsCount: number) {
    if (Helper.isNullOrUndefined(this.worksheet)) return;
    const worksheet = this.worksheet;
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    for (let i = 1; i <= noOfDaysInMonth; i++) {
      worksheet.getColumn(i + 3).width = 5;
    }
    worksheet.getColumn(totalColumnsCount - 2).width = 20;
    worksheet.getColumn(totalColumnsCount - 1).width = 10;
    worksheet.getColumn(totalColumnsCount).width = 27;
  }

  private addGridData(
    filterData: any,
    data: any[],
    noOfDaysInMonth: number,
    totalColumnsCount: number
  ) {
    const attendanceDate = new Date(filterData.generatedOn);
    const year = attendanceDate.getFullYear();
    const month = attendanceDate.getFullYear();
    for (let i = 0; i <= data.length - 1; i++) {
      const index = i + this.gridHeaderRowIndex;
      this.setGridCellAt(index, 1, i+1, 'center');
      this.setGridCellAt(index, 2, data[i].EmployeeName.toUpperCase(), 'left');
      this.setGridCellAt(index, 3, data[i].Designation.toUpperCase(), 'left');
      for (let dayOfMonth = 1; dayOfMonth <= noOfDaysInMonth; dayOfMonth++) {
        const cell = this.setGridCellAt(
          index,
          3 + dayOfMonth,
          data[i][dayOfMonth]
        );
        const isSunday = new Date(year, month, dayOfMonth).getDay() === 0;
        if (isSunday) {
          cell!.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'd3d3d3' },
          };
        }
      }

      this.setGridCellAt(index, totalColumnsCount - 2, data[i].WorkingDays);
      this.setGridCellAt(index, totalColumnsCount - 1, data[i].Holiday);
      this.setGridCellAt(index, totalColumnsCount, data[i].NoOfDaysSalaryPaid);
    }
  }

  private addGridHeader(noOfDaysInMonth: number, totalColumnsCount: number) {
    this.setGridCellAt(this.gridHeaderRowIndex, 1, 'S.No', 'center', true);
    this.setGridCellAt(this.gridHeaderRowIndex, 2, 'NAME', 'center', true);
    this.setGridCellAt(
      this.gridHeaderRowIndex,
      3,
      'DESIGNATION',
      'center',
      true
    );
    for (let i = 1; i <= noOfDaysInMonth; i++) {
      this.setGridCellAt(
        this.gridHeaderRowIndex,
        this.gridHeaderRowIndex + i,
        i,
        'center',
        true
      );
    }
    this.setGridCellAt(
      this.gridHeaderRowIndex,
      totalColumnsCount - 2,
      'WORKING DAYS',
      'center',
      true
    );
    this.setGridCellAt(
      this.gridHeaderRowIndex,
      totalColumnsCount - 1,
      'HOLIDAY',
      'center',
      true
    );
    this.setGridCellAt(
      this.gridHeaderRowIndex,
      totalColumnsCount,
      'NO OF DAYS SALARY PAID',
      'center',
      true
    );
  }

  private addYearMonthInfo(filterData: any, totalColumnsCount: number) {
    if (Helper.isNullOrUndefined(this.worksheet)) return;
    const worksheet = this.worksheet;
    const attendanceDate = new Date(filterData.generatedOn);
    const year = attendanceDate.getFullYear();
    const yearCell = this.mergeCells(2, totalColumnsCount - 7);
    yearCell!.value = year;
    yearCell!.alignment = { horizontal: 'center' };

    const yearLabelCell = this.mergeCells(2, totalColumnsCount - 5);
    yearLabelCell!.value = 'YEAR';
    yearLabelCell!.alignment = { horizontal: 'center' };

    const monthCell = this.mergeCells(2, totalColumnsCount - 3);
    monthCell!.value = Helper.getMonthName(attendanceDate.getMonth());
    monthCell!.alignment = { horizontal: 'center' };

    const monthLabelCell = this.mergeCells(2, totalColumnsCount - 1);
    monthLabelCell!.value = 'MONTH';
    monthLabelCell!.alignment = { horizontal: 'center' };
  }

  private setupTitle(totalColumnsCount: number) {
    if (Helper.isNullOrUndefined(this.worksheet)) return;
    const worksheet = this.worksheet;
    worksheet.mergeCells(1, 1, 1, totalColumnsCount);
    worksheet.getCell('A1').value = 'AMRR MAHARAJA DHALL MILLS PRIVATE LIMITED';
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = {
      name: 'Calibri',
      family: 2,
      size: 14,
      bold: true,
    };
  }

  private setGridCellAt(
    rowIndex: number,
    colIndex: number,
    value: any,
    hAlign: any = 'center',
    bold = false
  ) {
    if (Helper.isNullOrUndefined(this.worksheet)) return;
    const ws = this.worksheet;
    var cell = ws.getCell(rowIndex, colIndex);
    cell.value = value;
    cell.alignment = { vertical: 'middle', horizontal: hAlign };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    cell.font = {
      name: 'Calibri',
      family: 2,
      size: 12,
      bold: bold,
    };
    return cell;
  }

  private mergeCells(rowIndex: number, colIndex: number, count = 2) {
    if (Helper.isNullOrUndefined(this.worksheet)) return;
    const ws = this.worksheet;
    ws.mergeCells(rowIndex, colIndex, rowIndex, colIndex + count - 1);
    return ws.getCell(rowIndex, colIndex);
  }
}
