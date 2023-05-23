import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

export class AmrrCompany implements IAmrrTypeahead {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  postalCode: string;
  gstNo: string;
  emailAddress: string;
  phoneNumber: string;
}
