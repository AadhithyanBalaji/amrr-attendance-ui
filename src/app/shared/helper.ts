import { DatePipe } from '@angular/common';
import { IAmrrTypeahead } from './amrr-typeahead.interface';

export default class Helper {
  public static isTruthy(value: any) {
    return value !== null && value !== undefined;
  }

  public static isNullOrUndefined(value: any) {
    return value == null && value == undefined;
  }

  public static isValidNumber(value: any) {
    return (
      value !== null && value !== undefined && value != '' && !isNaN(value)
    );
  }

  public static nameof = <T>(name: keyof T) => name;

  public static getAttendanceDate(date: any, datePipe: DatePipe) {
    return (
      datePipe.transform(
        new Date(new Date(date).setHours(0, 0, 0, 0)),
        'YYYY-MM-dd HH:mm:ss'
      ) ?? ''
    );
  }

  public static getUnique(arr: IAmrrTypeahead[]) {
    let mapObj = new Map();

    arr.forEach((v) => {
      let prevValue = mapObj.get(v.name);
      if (!prevValue || prevValue.type === 'new') {
        mapObj.set(v.name, v);
      }
    });
    return [...mapObj.values()];
  }

  public static addAllOption(options: any[]) {
    if (
      options.length > 0 &&
      Helper.isNullOrUndefined(options.find((x) => x.id === 0))
    ) {
      options.unshift({
        id: 0,
        name: 'All',
      });
    }
    return options;
  }

  public static getNoOfDays(date: any) {
    const generatedOn = new Date(date);
    const year = generatedOn.getFullYear();
    const month = generatedOn.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }

  public static getMonthName(month: number) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month];
  }
}
