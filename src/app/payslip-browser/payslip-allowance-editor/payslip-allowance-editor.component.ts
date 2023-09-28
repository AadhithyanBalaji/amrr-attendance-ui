import {
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  IAmmrGridColumn,
  GridColumnType,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { CrudEditorComponent } from 'src/app/shared/crud-browser/crud-editor.component';
import Helper from 'src/app/shared/helper';
import { PayslipBrowser } from '../payslip-browser.model';
import { PayslipAllowanceEditor } from './payslip-allowance-editor.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-payslip-allowance-editor',
  templateUrl: './payslip-allowance-editor.component.html',
  styleUrls: ['./payslip-allowance-editor.component.scss'],
})
export class PayslipAllowanceEditorComponent implements OnInit {
  @ViewChild('allowanceTemplate', { static: true })
  allowanceTemplate: TemplateRef<any>;

  @ViewChild('empNameTemplate', { static: true })
  empNameTemplate: TemplateRef<any>;

  columns: IAmmrGridColumn[] = [];
  dataSource: MatTableDataSource<PayslipAllowanceEditor, MatPaginator>;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<PayslipAllowanceEditorComponent>,
    private readonly apiBusinessService: ApiBusinessService
  ) {}

  ngOnInit(): void {
    this.setupColumns();
    const empRecords = this.data?.resultData[0]?.recordset ?? [];
    const attendanceRecords = this.data?.resultData[1]?.recordset ?? [];

    const noOfDays = Helper.getNoOfDays(this.data.generatedOn);
    for (let i = 1; i <= noOfDays; i++) {
      const date: Date = this.data.requestDate;
      date.setDate(i);
      if (date.getDay() === 6 || date.getDay() === 0) {
        this.columns.push({
          key: i + '',
          name: i + '',
          type: GridColumnType.String,
        });
      }
    }

    for (let i = 0; i < empRecords.length; i++) {
      const empId = empRecords[i].employeeId;
      const attendanceRecord = attendanceRecords.find(
        (a) => a.EmployeeId === empId
      );
      for (
        let j = 7;
        j < this.columns.length && Helper.isTruthy(attendanceRecord);
        j++
      ) {
        const index = this.columns[j].key;
        empRecords[i][index] = attendanceRecord[index];
      }
    }
    this.dataSource = new MatTableDataSource(empRecords);
  }

  setupColumns() {
    this.columns = [
      {
        key: 'sno',
        name: 'S.No.',
        type: GridColumnType.Sno,
      },
      {
        key: Helper.nameof<PayslipAllowanceEditor>('employeeName'),
        name: 'Name',
        type: GridColumnType.Template,
        template: this.empNameTemplate,
      },
      {
        key: Helper.nameof<PayslipAllowanceEditor>('petrolAllowance'),
        name: 'Petrol Allowance',
        type: GridColumnType.Template,
        template: this.allowanceTemplate,
      },
      {
        key: Helper.nameof<PayslipAllowanceEditor>('basic'),
        name: 'Basic',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<PayslipAllowanceEditor>('hra'),
        name: 'HRA',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<PayslipAllowanceEditor>('totalPay'),
        name: 'Total',
        type: GridColumnType.Number,
      },
      {
        key: Helper.nameof<PayslipAllowanceEditor>('totalWorkingDays'),
        name: 'Total working days',
        type: GridColumnType.Number,
      },
    ];
  }

  generate() {
    this.initiateGeneratePayslips();
  }

  private initiateGeneratePayslips() {
    this.loading = true;
    const empRecords = this.dataSource.data.map((x) => ({
      employeeId: x.employeeId,
      petrolAllowance: x.petrolAllowance,
    }));
    const request = {
      generatedOn: this.data.generatedOn,
      companyId: this.data.companyId,
      userId: this.data.userId,
      empRecords: empRecords,
    };
    this.apiBusinessService
      .post('payslip/generate', request)
      .pipe(take(1))
      .subscribe((_) => {
        this.loading = false;
        this.dialogRef.close();
      });
  }
}
