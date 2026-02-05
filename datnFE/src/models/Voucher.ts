import type { Dayjs } from "dayjs";

export interface Voucher {
    id: string;
    voucherCode: string;
    voucherName: string;
    voucherType: string;
    discountUnit: string;
    maxDiscountAmount: number;
    conditions: number;
    startDate: number;
    endDate: number;
    quantity: number;
    status: number;
}
export interface VoucherRequest extends Omit<Voucher, 'id' | 'startDate' | 'endDate'> {
    id?: string;
    startDate: number | null;
    endDate: number | null;
}
export interface VoucherResponse {
    data: Voucher[];
    totalPages: number;
    totalElements: number;
}
// Interface dành riêng cho Ant Design Form
// Sử dụng Dayjs (viết hoa) để định nghĩa kiểu dữ liệu
export interface VoucherFormValues extends Omit<VoucherRequest, 'startDate' | 'endDate'> {
    dateRange: [Dayjs, Dayjs] | null; 
}