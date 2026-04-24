import type { Dayjs } from "dayjs";

export interface Voucher {
    id: string;
    code: string;
    name: string;
    voucherType: "INDIVIDUAL" | "ALL"; // INDIVIDUAL: Cá nhân, ALL: Tất cả
    discountUnit: "PERCENT" | "VND";   // PERCENT: %, VND: Tiền mặt
    maxDiscountAmount: number;
    conditions: number;
    startDate: number;
    endDate: number;
    quantity: number;
    status: number;
    createdBy: string;         
    createdDate: number;
    lastModifiedBy: string; // Thêm trường này
    lastModifiedDate: number; // Thêm dòng này vào Interface
    discountValue:number;
    customerIds: string[];
    details?: {
        id: string;
        customer: {
            id: string;
            fullName: string;
            email: string;
        };
    }[];
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

// Interface for available coupons API response
export interface AvailableCoupon {
    id: string;
    code: string;
    name: string;
    voucherType: "INDIVIDUAL" | "ALL";
    discountUnit: "PERCENT" | "VND";
    discountValue: number;
    maxDiscountAmount: number;
    conditions: number;
    startDate: number;
    endDate: number;
    note: string;
    quantity: number;
    status: number;
    calculatedDiscount: number;
}

export interface AvailableCouponsResponse {
    bestCoupon: AvailableCoupon | null;
    availableCoupons: AvailableCoupon[];
}
// Interface dành riêng cho Ant Design Form
// Sử dụng Dayjs (viết hoa) để định nghĩa kiểu dữ liệu
export interface VoucherFormValues extends Omit<VoucherRequest, 'startDate' | 'endDate'> {
    dateRange: [Dayjs, Dayjs] | null; 
    maxDiscountValue: number;    // Số tiền giảm tối đa
    lastModifiedBy: string;      // Người cập nhật cuối cùng
    lastModifiedDate: number;   // Ngày cập nhật cuối cùng (thường do BE trả về)
    voucherName :String;
    createdBy: string;           // Người tạo ban đầu
    createdDate: number;
}
