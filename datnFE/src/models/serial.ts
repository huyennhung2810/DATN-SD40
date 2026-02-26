import type { CommonStatus } from "./base";


export interface SerialResponse {
  id: string;
  serialNumber: string;
  code: string;
  productName: string;
  productDetailId: string;
  createdDate: string;
  status: CommonStatus;
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
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}