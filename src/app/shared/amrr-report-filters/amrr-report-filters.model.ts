export class AmrrReportFilters {
  userId: number;
  transactionTypeId: number | null;
  fromDate: string;
  toDate: string;
  godownId?: number | null;
  bayId?: number | null;
  itemGroupId?: number | null;
  itemId?: number | null;
  batchId?: number | null;
  godown?: string;
  bay?: string;
  itemGroup?: string;
  item?: string;
  batch?: string;
  checkBoxValue?: boolean;
}
