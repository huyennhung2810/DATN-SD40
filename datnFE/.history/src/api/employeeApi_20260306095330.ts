import dayjs from "dayjs";
import type { EmployeePageParams, EmployeeRequest, EmployeeResponse, ResetPasswordPayload } from "../models/employee"
import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";

const BASE_URL = "/admin/employee"

const convertToFormData = (data: EmployeeRequest) : FormData => {
    const formData = new FormData();

    //Thông tin cơ bản
  if (data.id) formData.append("id", data.id);
  if (data.code) formData.append("code", data.code);
  formData.append("name", data.name || "");
  formData.append("email", data.email || "");
  formData.append("phoneNumber", data.phoneNumber || "");
  formData.append("identityCard", data.identityCard || "");
  formData.append("gender", String(data.gender ?? true));
  formData.append("hometown", data.hometown || "");
  formData.append("role", data.role || "STAFF");

  //Xử lý Ngày sinh (Chuyển Dayjs sang Long timestamp)
  if (data.dateOfBirth) {
    const timestamp = dayjs.isDayjs(data.dateOfBirth) 
      ? data.dateOfBirth.valueOf() 
      : data.dateOfBirth;
    formData.append("dateOfBirth", String(timestamp));
  }

  //Thông tin địa chỉ
  formData.append("provinceCity", data.provinceCity || "");
  formData.append("wardCommune", data.wardCommune || "");
  if (data.provinceCode) formData.append("provinceCode", String(data.provinceCode));
  if (data.wardCode) formData.append("wardCode", String(data.wardCode));

  // Thông tin tài khoản (Account)
  if (data.username) formData.append("username", data.username);
  if (data.password) formData.append("password", data.password);

  // Xử lý File ảnh
  if (data.employeeImage instanceof File) {
    formData.append("employeeImage", data.employeeImage);
  }

  return formData;

}

export const getAll = async (params: EmployeePageParams): Promise<PageResponse<EmployeeResponse>> => {
  const res = await axiosClient.get<ResponseObject<PageResponse<EmployeeResponse>>>(BASE_URL, { params });
  return res.data.data;
};

export const getEmployeeById = async (id: string): Promise<EmployeeResponse> => {
  const res = await axiosClient.get<ResponseObject<EmployeeResponse>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

export const addEmployee = async (data: EmployeeRequest): Promise<ResponseObject<EmployeeResponse>> => {
  const formData = convertToFormData(data);
  const res = await axiosClient.post<ResponseObject<EmployeeResponse>>(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const updateEmployee = async (data: EmployeeRequest): Promise<ResponseObject<EmployeeResponse>> => {
  const formData = convertToFormData(data);
  const res = await axiosClient.put<ResponseObject<EmployeeResponse>>(`${BASE_URL}/${data.id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const changeStatusEmployee = async (id: string): Promise<ResponseObject<void>> => {
  const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
  return res.data;
};

export const exportExcel = async (): Promise<Blob> => {
  const res = await axiosClient.get(`${BASE_URL}/export`, { responseType: 'blob' });
  return res.data;
};

export const requestOtp = async (email: string) => {
  return await axiosClient.post(`${BASE_URL}/forgot-password/request-otp`, null, { params: { email } });
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<ResponseObject<void>> => {
  const res = await axiosClient.post<ResponseObject<void>>(
    `${BASE_URL}/forgot-password/reset`, 
    null, 
    { params: payload }
  );
  return res.data;
};

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
}

export const changePassword = async (username: string, payload: ChangePasswordPayload): Promise<ResponseObject<void>> => {
  // Gửi request PUT với body là thông tin mật khẩu
  const res = await axiosClient.put<ResponseObject<void>>(
    `${BASE_URL}/change-password/${username}`, 
    payload
  );
  return res.data;
};

export const checkDuplicate = async (params: { 
  identityCard?: string; 
  email?: string; 
  phoneNumber?: string; 
  id?: string 
}): Promise<ResponseObject<boolean>> => {
  const res = await axiosClient.get<ResponseObject<boolean>>(`${BASE_URL}/validation/duplicate`, { params });
  return res.data;
};

export const employeeApi = {
    getAll,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    changeStatusEmployee,
    exportExcel,
    checkDuplicate
};

export default employeeApi;