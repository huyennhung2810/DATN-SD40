import type { Dayjs } from "dayjs";


export interface AccountResponse {
  id: string;
  username: string;
  role: string;
  status: string;
  code?: string;
  createdDate?: number;
  lastModifiedDate?: number;
}

//Trả về từ API
export interface EmployeeResponse{
    id: string;
    code: string;
    name: string;
    email: string;
    phoneNumber: string;
    gender: boolean;
    dateOfBirth: number;
    employeeImage: string;
    identityCard: string;
    status: string;
    createdDate: number;
    hometown: string;
    provinceCity: string;
    wardCommune: string;
    provinceCode: number;
    wardCode: number;
    account?: AccountResponse;
}

//tìm kiếm, phân trang
export interface EmployeePageParams {
    keyword?: string;
    status?: string;
    gender?: boolean;
    page: number;
    size: number;
    role?: string;
}

//dùng để Thêm/Sửa
export interface EmployeeRequest {
    id?: string;
    code?: string;
    name: string;
    email: string;
    phoneNumber: string;
    gender: boolean;
    dateOfBirth: Dayjs | number | null; 
    identityCard: string;
    hometown: string;
    provinceCity: string;
    wardCommune: string;
    provinceCode?: number;
    wardCode?: number;

    employeeImage?: File | string | null;

    username?: string;
    password?: string;
    role: string;
}


//Giá trị khởi tạo ban đầu cho Form
export const initialEmployee: EmployeeRequest = {
    code: "",
    name: "",
    dateOfBirth: null,
    gender: true,
    email: "",
    phoneNumber: "",
    identityCard: "",
    hometown: "",
    provinceCity: "",
    wardCommune: "",
    provinceCode: undefined,
    wardCode: undefined,
    role: "STAFF",
    username: "",
    password: ""
};