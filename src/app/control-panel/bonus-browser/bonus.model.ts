import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

export class Bonus implements IAmrrTypeahead {
  id: number;
  name: string;
  employeeId: string;
  unitName: string;
  companyName: string;
  amount: number;
  effectiveDate: string;
}
