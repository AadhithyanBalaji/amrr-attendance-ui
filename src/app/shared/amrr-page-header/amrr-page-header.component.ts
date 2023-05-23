import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-amrr-page-header',
  templateUrl: './amrr-page-header.component.html',
  styleUrls: ['./amrr-page-header.component.css']
})
export class AmrrPageHeaderComponent {
  @Input() title: string;
  @Input() actionName: string = 'Add';
  @Output() onActionClicked = new EventEmitter();

  onActionClick() {
    this.onActionClicked.emit();
  }
}
