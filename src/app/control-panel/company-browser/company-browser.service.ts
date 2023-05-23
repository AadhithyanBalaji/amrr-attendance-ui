import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  GridColumnType,
  IAmmrGridColumn,
} from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { AmrrCompany } from './amrr-company.model';
import { CompanyEditorComponent } from './company-editor/company-editor.component';
import { take } from 'rxjs';
import { AmrrModalComponent } from 'src/app/shared/amrr-modal/amrr-modal.component';
import Helper from 'src/app/shared/helper';

@Injectable()
export class CompanyBrowserService {
  columns: IAmmrGridColumn[];
  dataSource: MatTableDataSource<AmrrCompany, MatPaginator>;
  loading = false;

  constructor(
    private readonly dialog: MatDialog,
    private readonly apiBusinessService: ApiBusinessService
  ) {}

  init() {
    this.columns = this.getColumns();
    this.getData();
  }

  addNewCompany() {
    this.dialog
      .open(CompanyEditorComponent)
      .afterClosed()
      .subscribe((result) => (result ? this.getData() : null));
  }

  onEdit(event: AmrrCompany) {
    this.dialog
      .open(CompanyEditorComponent, {
        data: event,
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) =>
        result
          ? setTimeout(() => {
              this.getData();
            }, 300)
          : null
      );
  }

  onDelete(event: AmrrCompany) {
    this.dialog
      .open(AmrrModalComponent, {
        data: {
          title: 'Confirm Deletion',
          body: `Are you sure you want to delete the company - ${event.name} ?`,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => (result ? this.deleteCompany(event.id) : null));
  }

  private getData() {
    this.loading = true;
    this.apiBusinessService
      .get('company')
      .pipe(take(1))
      .subscribe((data: any) => {
        this.dataSource = new MatTableDataSource(data.recordset as AmrrCompany[]);
        this.loading = false;
      });
  }

  private deleteCompany(id: number) {
    this.apiBusinessService
      .delete(`company`, id)
      .pipe(take(1))
      .subscribe((_) => this.getData());
  }

  private getColumns(): IAmmrGridColumn[] {
    return [
      {
        key: 'sno',
        name: 'S.No.',
        type: GridColumnType.Sno,
      },
      {
        key: Helper.nameof<AmrrCompany>('name'),
        name: 'Company Name',
      },
      {
        key: Helper.nameof<AmrrCompany>('addressLine1'),
        name: 'Address Line 1',
      },
      {
        key: Helper.nameof<AmrrCompany>('addressLine2'),
        name: 'Address Line 2',
      },
      {
        key: Helper.nameof<AmrrCompany>('addressLine3'),
        name: 'Address Line 3',
      },
      {
        key: Helper.nameof<AmrrCompany>('postalCode'),
        name: 'Postal Code',
      },
      {
        key: Helper.nameof<AmrrCompany>('gstNo'),
        name: 'GST#',
      },
      {
        key: Helper.nameof<AmrrCompany>('emailAddress'),
        name: 'Email',
      },
      {
        key: Helper.nameof<AmrrCompany>('phoneNumber'),
        name: 'Phone',
      },
    ];
  }
}
