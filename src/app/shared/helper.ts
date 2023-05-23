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
}
