import { TemplateRef } from '@angular/core';

export class IAmmrGridColumn {
  key: string;
  name: string;
  type?: GridColumnType = GridColumnType.String;
  template?: TemplateRef<any>;
  hidden? = false;
}

export enum GridColumnType {
  Sno = 1,
  Number = 2,
  String = 3,
  Template = 4,
  Boolean = 5,
  Date = 6,
}
