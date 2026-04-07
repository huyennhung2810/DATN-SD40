import type { CommonStatus } from "./base";

export type SerialBusinessStatus = 'AVAILABLE' | 'IN_ORDER' | 'SOLD' | 'DEFECTIVE' | 'WARRANTY';

export interface SerialResponse {
  id: string;
  serialNumber: string;
  code: string;
  productName: string;
  productDetailId: string;
  createdDate: string;
  status: CommonStatus;
  /** AVAILABLE = trong kho, IN_ORDER = đang trong đơn, SOLD = đã bán */
  serialStatus?: SerialBusinessStatus;
}

export interface SerialFormValues {
  serialNumber: string;
  code: string;
  productDetailId: string;
  status: CommonStatus
}

export const initialSerial: SerialFormValues = {
  code: "",
  serialNumber: "",
  productDetailId: "",
  status: "ACTIVE"
}

export interface SerialPageParams {
  keyword?: string;
  status?: string;
  serialStatus?: string;
  productCategoryId?: string;
  productId?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}