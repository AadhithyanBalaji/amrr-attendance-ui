import { AttendanceStatusEnum } from './attendance-status.enum';

export class AttendanceEditorBrowser {
  id: number;
  payCycleTypeId: number;
  name: string;
  status = AttendanceStatusEnum.NotMarked;
  inTime: string;
  outTime: string;
  hasError = false;
}
