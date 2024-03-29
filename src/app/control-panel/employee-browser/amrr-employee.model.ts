import { IAmrrTypeahead } from 'src/app/shared/amrr-typeahead.interface';

export class AmrrEmployee implements IAmrrTypeahead {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  designation: string;
  payCycleTypeId: number;
  payCycleTypeName: string;
  unitId: number;
  unitName: string;
  salary: number;
  basic: number;
  hra: number;
  salaryEffectiveDate: string;
  dateOfJoining: string;
  uanNo: string | null;
  esiNo: string | null;
  aadharNo: string | null;
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
  bankName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  branchLocation: string | null;
}
