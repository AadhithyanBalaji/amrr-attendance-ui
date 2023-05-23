import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-amrr-action-row',
  templateUrl: './amrr-action-row.component.html',
  styleUrls: ['./amrr-action-row.component.css'],
})
export class AmrrActionRowComponent {
  @Input() loading = true;
  @Input() isUpdateMode = false;
  @Output() add = new EventEmitter<any>();
  @Output() addAndClose = new EventEmitter<any>();
  @Output() close = new EventEmitter<any>();

  onAdd() {
    this.add.emit();
  }

  onAddAndClose() {
    this.addAndClose.emit();
  }

  onClose() {
    this.close.emit();
  }
}
