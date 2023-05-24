import { IAmrrTypeahead } from "src/app/shared/amrr-typeahead.interface";

export class AmrrHoliday implements IAmrrTypeahead{
    id:number;
    name: string;
    holidayDate: string;
    attendanceUnit: number;
    companyIds: string;
    companies: string;
}