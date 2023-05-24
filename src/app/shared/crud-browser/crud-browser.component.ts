import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { CrudBrowserService } from './crud-browser.service';
import { IAmmrGridColumn } from 'src/app/shared/ammr-grid/ammr-grid-column.interface';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-crud-browser',
  template: ` <div class="df">
    <app-amrr-page-header
      [title]="entityName + ' List'"
      (onActionClicked)="browserService.addNewEntity()"
    ></app-amrr-page-header>
    <div class="grid-container">
      <app-ammr-grid
        [columns]="browserService.columns"
        [dataSource]="browserService.dataSource"
        [loading]="browserService.loading"
        [hideDeleteActionForColumnKey]="'isSuperAdmin'"
        (onEdit)="browserService.onEdit($event)"
        (onDelete)="browserService.onDelete($event)"
      ></app-ammr-grid>
    </div>
  </div>`,
  providers: [CrudBrowserService],
})
export class CrudBrowserComponent implements OnInit {
  @Input() entityEndpoint: string;
  @Input() entityName: string;
  @Input() columns: IAmmrGridColumn[];
  @Input() formTemplate: TemplateRef<any>;
  @Input() form: FormGroup<any>;
  @Input() isCustomEditHandler: boolean;
  @Output() onSave = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();

  constructor(readonly browserService: CrudBrowserService) {}

  ngOnInit(): void {
    this.browserService.init(
      this.entityEndpoint,
      this.entityName,
      this.columns,
      this.formTemplate,
      this.onSave,
      this.onEdit,
      this.form,
      this.isCustomEditHandler
    );
  }
}
