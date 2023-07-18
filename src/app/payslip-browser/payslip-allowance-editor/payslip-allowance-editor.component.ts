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
    this.dataSource = new MatTableDataSource(this.data.empRecords.recordset);
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
    this.apiBusinessService
      .post('payslip/generate', {
        generatedOn: this.data.generatedOn,
        companyId: this.data.companyId,
        userId: this.data.userId,
        empRecords: empRecords,
      })
      .pipe(take(1))
      .subscribe(
        (_) => {
          this.loading = false;
          this.dialogRef.close();
        },
        (error) => (this.loading = false)
      );
  }
}
