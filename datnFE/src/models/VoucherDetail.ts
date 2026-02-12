import type { CustomerResponse } from "./customer";
import type { Voucher } from "./Voucher";

export interface VoucherDetail {
  id: string;
  voucher: Voucher;
  customer: CustomerResponse;
  usageStatus: number;
  isNotified: number;
  reason?: string; // Dấu ? vì trường này có thể null
  createdDate: number;
  usedDate?: number;
}