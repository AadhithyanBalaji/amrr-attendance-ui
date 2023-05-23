import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { IAmrrTypeahead } from '../amrr-typeahead.interface';

@Component({
  selector: 'app-amrr-select-with-search',
  templateUrl: './amrr-select-with-search.component.html',
  styleUrls: ['./amrr-select-with-search.component.css'],
})
export class AmrrSelectWithSearchComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() title: string;
  @Input() options: IAmrrTypeahead[] = [];
  @Input() ctrl: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  public selectCtrl = new FormControl<string>('');
  public filteredOptions = new ReplaySubject<IAmrrTypeahead[]>(1);
  protected _onDestroy = new Subject<void>();

  searchCtrl = new FormControl('');

  ngOnInit() {
    this.filteredOptions.next(this.options.slice());
    this.selectCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanks();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.filterBanks();
    }
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected setInitialValue() {
    this.filteredOptions
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (
          a: IAmrrTypeahead,
          b: IAmrrTypeahead
        ) => a && b && a.id === b.id;
      });
  }

  protected filterBanks() {
    if (!this.options) {
      return;
    }
    let search = this.selectCtrl.value;
    if (!search) {
      this.filteredOptions.next(this.options.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredOptions.next(
      this.options.filter(
        (bank) => bank.name.toLowerCase().indexOf(search!) > -1
      )
    );
  }
}
