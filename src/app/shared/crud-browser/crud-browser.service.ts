import { EventEmitter, Injectable, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IAmmrGridColumn } from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { ApiBusinessService } from 'src/app/shared/api-business.service';
import { take } from 'rxjs';
import { AmrrModalComponent } from 'src/app/shared/amrr-modal/amrr-modal.component';
import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';
import {
  CrudEditorComponent,
  DummyTypeaheadImpl,
} from './crud-editor.component';
import { FormGroup } from '@angular/forms';
import { FormHelper } from 'src/app/shared/form-helper.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Helper from 'src/app/shared/helper';

@Injectable({
  providedIn: 'root',
})
export class CrudBrowserService {
  columns: IAmmrGridColumn[];
  dataSource: MatTableDataSource<IAmrrTypeahead, MatPaginator>;
  loading = false;
  entityEndpoint: string;
  entityName: string;
  onSave: EventEmitter<any>;
  formTemplate: TemplateRef<any>;
  onEditEmitter: EventEmitter<any>;
  onAdd: EventEmitter<any>;
  form: FormGroup<any>;
  isCustomEditHandler: boolean;

  constructor(
    private readonly dialog: MatDialog,
    private readonly apiBusinessService: ApiBusinessService,
    private readonly formHelper: FormHelper,
    private readonly snackBar: MatSnackBar
  ) {}

  init(
    entityEndpoint: string,
    entityName: string,
    columns: IAmmrGridColumn[],
    formTemplate: TemplateRef<any>,
    onSave: EventEmitter<any>,
    onEdit: EventEmitter<any>,
    form: FormGroup<any>,
    isCustomEditHandler: boolean
  ) {
    this.entityEndpoint = entityEndpoint;
    this.entityName = entityName;
    this.columns = columns;
    this.formTemplate = formTemplate;
    this.onSave = onSave;
    this.onEditEmitter = onEdit;
    this.form = form;
    this.isCustomEditHandler = isCustomEditHandler;
    this.getData();
  }

  addNewEntity() {
    this.formHelper.resetForm(this.form);
    this.dialog
      .open(CrudEditorComponent, {
        data: {
          event: null,
          formTemplate: this.formTemplate,
          onSave: this.onSave,
        },
      })
      .afterClosed()
      .subscribe((result) => (result ? this.getData() : null));
  }

  onEdit(event: any) {
    this.isCustomEditHandler
      ? this.onEditEmitter.emit(event)
      : this.form.patchValue(event);
    this.dialog
      .open(CrudEditorComponent, {
        data: {
          event: event,
          formTemplate: this.formTemplate,
          onSave: this.onSave,
        },
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

  onDelete(event: IAmrrTypeahead) {
    this.dialog
      .open(AmrrModalComponent, {
        data: {
          title: 'Confirm Deletion',
          body: `Are you sure you want to delete the ${this.entityName} - ${event.name} ?`,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => (result ? this.deleteEntity(event.id) : null));
  }

  performSave(
    entityEndpoint: string,
    entityName: string,
    item: any,
    event: any,
    form: FormGroup<any>
  ) {
    this.apiBusinessService
      .post(entityEndpoint, item)
      .pipe(take(1))
      .subscribe((_) => {
        event.closeDialog
          ? event.dialogRef.close(new DummyTypeaheadImpl())
          : null;
        this.snackBar.open(
          `${entityName} ${
            Helper.isNullOrUndefined(item.id) ? 'created!' : 'updated'
          }`
        );
        this.formHelper.resetForm(form);
      });
  }

  private getData() {
    this.loading = true;
    this.apiBusinessService
      .get(this.entityEndpoint)
      .pipe(take(1))
      .subscribe((data: any) => {
        this.dataSource = new MatTableDataSource(data.recordset);
        this.loading = false;
      });
  }

  private deleteEntity(id: number) {
    this.apiBusinessService
      .delete(this.entityEndpoint, id)
      .pipe(take(1))
      .subscribe((_) => this.getData());
  }
}
