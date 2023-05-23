import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiBusinessService } from './api-business.service';

@Injectable({
  providedIn: 'root',
})
export class DataHelperService {
  // bays$ = new Subject<AmrrBay[]>();
  

  constructor(
    private readonly apiBusinessService: ApiBusinessService,
    private readonly snackBar: MatSnackBar
  ) {}

  // getGodownAndItems(restrictByStock = false) {
  //   combineLatest([
  //     this.apiBusinessService.get(
  //       `godown/userId/${this.authService.getUserId()}/restrictByStock/${restrictByStock}`
  //     ),
  //     this.apiBusinessService.get('item'),
  //   ])
  //     .pipe(take(1))
  //     .subscribe((result) =>
  //       this.godownsItems$.next({
  //         godowns: result[0] as AmrrGodown[],
  //         items: result[1] as AmrrItem[],
  //       })
  //     );
  // }

  
}
