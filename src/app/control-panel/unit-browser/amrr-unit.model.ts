import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

export class AmrrUnit implements IAmrrTypeahead {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  company: IAmrrTypeahead;
}
