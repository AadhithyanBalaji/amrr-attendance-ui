export class AttendanceRecord {
  constructor(
    public employeeId: number,
    public isPresent: boolean,
    public attendanceUnit: number
  ) {}
}
