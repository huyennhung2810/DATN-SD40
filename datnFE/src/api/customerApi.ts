import type { PageResponse, ResponseObject } from "../models/base";
import type { 
    CustomerPageParams, 
    CustomerRequest, 
    CustomerResponse, 
} from "../models/customer";
import axiosClient from "./axiosClient";


const BASE_URL = "/admin/customers";

const convertToFormData = (data: CustomerRequest): FormData => {
  const formData = new FormData();

  //Duyệt qua các trường cơ bản
  if (data.id) formData.append("id", data.id);
  if (data.code) formData.append("code", data.code);
  formData.append("name", data.name || "");
  formData.append("email", data.email || "");
  formData.append("phoneNumber", data.phoneNumber || "");
  formData.append("identityCard", data.identityCard || "");
  formData.append("gender", String(data.gender ?? true));


  // Xử lý Ngày sinh
  if (data.dateOfBirth) {
    formData.append("dateOfBirth", data.dateOfBirth.toString());
  }

  //File ảnh
  if (data.image instanceof File) {
    formData.append("image", data.image);
  } else if (typeof data.image === "string") {
    formData.append("imageUrl", data.image);
  }

  //Địa chỉ
if (data.addresses && data.addresses.length > 0) {
    data.addresses.forEach((addr, index) => {
      // Lưu ý: Key phải là "addresses" để khớp với List<ADAddressRequest> ở Backend
      if (addr.id) formData.append(`addresses[${index}].id`, addr.id);
      formData.append(`addresses[${index}].name`, addr.name || "");
      formData.append(`addresses[${index}].phoneNumber`, addr.phoneNumber || "");
      
      // Gửi các mã vùng (Dữ liệu số cực kỳ quan trọng)
      if (addr.provinceCode) 
        formData.append(`addresses[${index}].provinceCode`, addr.provinceCode.toString());
    
      if (addr.wardCode) 
        formData.append(`addresses[${index}].wardCode`, addr.wardCode.toString());

      // Gửi các chuỗi tên
      formData.append(`addresses[${index}].provinceCity`, addr.provinceCity || "");
      formData.append(`addresses[${index}].wardCommune`, addr.wardCommune || "");
      
      formData.append(`addresses[${index}].addressDetail`, addr.addressDetail || "");
      formData.append(`addresses[${index}].isDefault`, String(addr.isDefault ?? false));
    });
  }

  return formData;
}


export const addCustomer = async (data: CustomerRequest): Promise<ResponseObject<CustomerResponse>> => {
  const formData = convertToFormData(data);
  const res = await axiosClient.post<ResponseObject<CustomerResponse>>(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const getAll = async (params: CustomerPageParams): Promise<PageResponse<CustomerResponse>> => {
  const res = await axiosClient.get<ResponseObject<PageResponse<CustomerResponse>>>(BASE_URL, { params });
  return res.data.data;
};

export const getCustomerById = async (id: string): Promise<CustomerResponse> => {
  const res = await axiosClient.get<ResponseObject<CustomerResponse>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

export const updateCustomer = async (data: CustomerRequest): Promise<ResponseObject<CustomerResponse>> => {
  const formData = convertToFormData(data);
  const res = await axiosClient.put<ResponseObject<CustomerResponse>>(`${BASE_URL}/${data.id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const changeStatusCustomer = async (id: string): Promise<ResponseObject<void>> => {
  const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
  return res.data;
};

export const exportExcel = async (): Promise<Blob> => {
  const res = await axiosClient.get(`${BASE_URL}/export`, { responseType: 'blob' });
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

export const customerApi = {
    getAll,
    getCustomerById,
    addCustomer,
    updateCustomer,
    changeStatusCustomer,
    exportExcel,
    checkDuplicate,
};

export default customerApi;