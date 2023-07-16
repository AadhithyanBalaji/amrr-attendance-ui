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
  editorWidth: string;

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
    isCustomEditHandler: boolean,
    editorWidth: string
  ) {
    this.entityEndpoint = entityEndpoint;
    this.entityName = entityName;
    this.columns = columns;
    this.formTemplate = formTemplate;
    this.onSave = onSave;
    this.onEditEmitter = onEdit;
    this.form = form;
    this.isCustomEditHandler = isCustomEditHandler;
    this.editorWidth = editorWidth;
    this.getData();
  }

  addNewEntity() {
    this.formHelper.resetForm(this.form);
    this.dialog
      .open(CrudEditorComponent, this.buildEditorData(null))
      .afterClosed()
      .subscribe((result) => (result ? this.getData() : null));
  }

  onEdit(event: any) {
    this.isCustomEditHandler
      ? this.onEditEmitter.emit(event)
      : this.form.patchValue(event);
    this.dialog
      .open(CrudEditorComponent, this.buildEditorData(event))
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
      .subscribe(
        (_) => {
          event.closeDialog
            ? event.dialogRef.close(new DummyTypeaheadImpl())
            : null;
          this.snackBar.open(
            `${entityName} ${
              Helper.isNullOrUndefined(item.id) ? 'created!' : 'updated'
            }`
          );
          this.formHelper.resetForm(form);
        },
        (error) => {
          this.snackBar.open(error?.error, '', { duration: 5000 });
        }
      );
  }

  private getData() {
    this.loading = true;
    this.apiBusinessService
      .get(this.entityEndpoint)
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          this.dataSource = new MatTableDataSource(data.recordset);
          this.loading = false;
        },
        (error) => {
          this.snackBar.open(error?.error, '', { duration: 5000 });
        }
      );
  }

  private deleteEntity(id: number) {
    this.apiBusinessService
      .delete(this.entityEndpoint, id)
      .pipe(take(1))
      .subscribe(
        (_) => this.getData(),
        (error) => {
          this.snackBar.open(this.getErrorMessage(error?.error), '', {
            duration: 5000,
          });
        }
      );
  }

  private buildEditorData(event: any) {
    return {
      data: {
        event: event,
        formTemplate: this.formTemplate,
        onSave: this.onSave,
        form: this.form,
        editorWidth: this.editorWidth,
        entityName: this.entityName
      },
    };
  }

  private getErrorMessage(error: string) {
    if (error.includes('table "attendance.PaySlip", column \'BonusId\''))
      return 'This bonus has already been assigned to a Payslip and hence cannot be deleted';
    return error;
  }
}
