import { IAmrrTypeahead } from '../shared/amrr-typeahead.interface';

export class AmrrSalaryAdvance implements IAmrrTypeahead {
  id: number;
  name: string;
  employeeId: number;
  salary: number;
  advanceAmount: number;
  dateCredited: string;
}
