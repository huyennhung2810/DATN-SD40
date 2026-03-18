import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { CommonStatus } from "./base";
import { initialAddress, type AddressRequest, type AddressResponse } from "./address";

export interface CustomerPageParams {
  keyword?: string;
  status?: string;
  page: number;
  size: number;
}

interface CustomerBase {
  name: string;
  email: string;
  phoneNumber: string;
  gender: boolean;
  identityCard: string;
}

// Dữ liệu nhận về từ API
export interface CustomerResponse extends CustomerBase {
  id: string;
  code: string;
  status: CommonStatus;
  dateOfBirth: number | null;
  image: string | null; 
  createdDate: number;
  lastModifiedDate?: number;
  addresses?: AddressResponse[];
  account?: {
    id: string;
    username: string | null;
    role: "CUSTOMER" | "ADMIN" | "STAFF";
  };
}

// Dữ liệu dùng cho Ant Design Form (Xử lý DatePicker)
export interface CustomerFormValues extends CustomerBase {
  dateOfBirth: Dayjs | null;
  addresses: AddressRequest[];
}

// Dữ liệu đóng gói gửi lên API (Multipart/FormData)
export interface CustomerRequest extends CustomerBase {
  id?: string;
  code?: string;
  dateOfBirth: number | null;
  image?: File | string | null;
  addresses: AddressRequest[];
}

export const initialCustomer: CustomerFormValues = {
  name: "",
  email: "",
  phoneNumber: "",
  identityCard: "",
  gender: true,
  dateOfBirth: null,
  addresses: [{ ...initialAddress, isDefault: true }],
};

export const mapResponseToFormValues = (response: CustomerResponse): CustomerFormValues => {
  return {
    name: response.name,
    email: response.email,
    phoneNumber: response.phoneNumber,
    identityCard: response.identityCard,
    gender: response.gender,
    dateOfBirth: response.dateOfBirth ? dayjs(response.dateOfBirth) : null,
    addresses: response.addresses && response.addresses.length > 0 
      ? response.addresses.map(addr => ({
          id: addr.id,
          name: addr.name,
          phoneNumber: addr.phoneNumber,
          provinceCity: addr.provinceCity,
          wardCommune: addr.wardCommune,
          addressDetail: addr.addressDetail,
          provinceCode: addr.provinceCode,
          wardCode: addr.wardCode,
          isDefault: addr.isDefault
        })) 
      : [{ ...initialAddress, isDefault: true }]
  };
};