import type { BaseEntity, CommonStatus } from "./base";
import type { CustomerResponse } from "./customer";

//Các trường dữ liệu cốt lõi của địa chỉ
export interface AddressBase {
    name: string;
    phoneNumber: string;
    provinceCity: string;
    wardCommune: string; 
    addressDetail: string;
    isDefault: boolean;
}

// Dùng khi gửi dữ liệu lên (Request)
export interface AddressRequest extends Partial<Pick<BaseEntity, 'id'>>, AddressBase {
    provinceCode?: number;
    wardCode?: number;
}

// Dữ liệu nhận về từ API (Response)
export interface AddressResponse extends BaseEntity, AddressBase {
    status: CommonStatus;
    provinceCode: number;
    wardCode: number;
}
//Hiển thị địa chỉ rút gọn
export const getDisplayAddress = (customer: CustomerResponse): string => {
    if (!customer.addresses || customer.addresses.length === 0) return "Chưa có địa chỉ";
    const defaultAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
    return `${defaultAddr.addressDetail}, ${defaultAddr.wardCommune}, ${defaultAddr.provinceCity}`;
};

export const initialAddress: AddressRequest = {
    name: "",
    phoneNumber: "",
    provinceCity: "",
    provinceCode: undefined,
    wardCommune: "",
    wardCode: undefined,
    addressDetail: "",
    isDefault: false,
};
