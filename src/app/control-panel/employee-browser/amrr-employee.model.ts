import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

export class AmrrEmployee implements IAmrrTypeahead {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  designation: string;
  unitId: number;
  unitName: string;
  salary: number;
  hra: number;
  dateOfJoining: string;
  uanNo: string;
  esiNo: string;
  aadharNo: string;
  isActive: number | boolean;
  inActiveSince: Date | null;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  postalCode: string;
  emailAddress: string;
  phoneNumber: string;
  unit: IAmrrTypeahead;
  bankDetailId: number;
  accountNumber: string | null;
  ifsc: string | null;
  branchLocation: string | null;
}
