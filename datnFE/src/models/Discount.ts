export interface Discount {
  id: string;
  code: string;
  name: string;
  discountPercent: number;
  startDate: number;
  endDate: number;
  note: string;
  quantity: number;
  status: number;
  createdAt: number;
  updatedAt: number;
  updatedBy: String;
  createdBy: String;
  discountDetails?: any[];
}

export interface DiscountRequest {
  code: string;
  name: string;
  discountPercent: number;
  startDate: number;
  endDate: number;
  quantity: number;
  note: string;
  productDetailIds: string[];
}
