import type { ResponseObject } from "../models/base";
import type { CustomerRequest, CustomerResponse } from "../models/customer";
import axiosClient from "./axiosClient";

const BASE_URL = "/client/profile";

const buildFormData = (data: CustomerRequest): FormData => {
  const formData = new FormData();
  if (data.id) formData.append("id", data.id);
  if (data.code) formData.append("code", data.code);
  formData.append("name", data.name || "");
  if (data.email) formData.append("email", data.email);
  formData.append("phoneNumber", data.phoneNumber || "");
  formData.append("gender", String(data.gender ?? true));
  if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth.toString());

  if (data.image instanceof File) {
    formData.append("image", data.image);
  } else if (typeof data.image === "string") {
    formData.append("imageUrl", data.image);
  }

  // Gửi addresses nếu có (nếu rỗng, backend sẽ bỏ qua và không thay đổi addresses)
  if (data.addresses && data.addresses.length > 0) {
    data.addresses.forEach((addr, index) => {
      if (addr.id) formData.append(`addresses[${index}].id`, addr.id);
      formData.append(`addresses[${index}].name`, addr.name || "");
      formData.append(`addresses[${index}].phoneNumber`, addr.phoneNumber || "");
      if (addr.provinceCode) formData.append(`addresses[${index}].provinceCode`, addr.provinceCode.toString());
      if (addr.wardCode) formData.append(`addresses[${index}].wardCode`, addr.wardCode.toString());
      formData.append(`addresses[${index}].provinceCity`, addr.provinceCity || "");
      formData.append(`addresses[${index}].wardCommune`, addr.wardCommune || "");
      formData.append(`addresses[${index}].addressDetail`, addr.addressDetail || "");
      formData.append(`addresses[${index}].isDefault`, String(addr.isDefault ?? false));
    });
  }

  return formData;
};

export const getProfile = async (customerId: string): Promise<CustomerResponse> => {
  const res = await axiosClient.get<ResponseObject<CustomerResponse>>(`${BASE_URL}/${customerId}`);
  return res.data.data;
};

export const updateProfile = async (data: CustomerRequest): Promise<ResponseObject<CustomerResponse>> => {
  const formData = buildFormData(data);
  const res = await axiosClient.put<ResponseObject<CustomerResponse>>(
    `${BASE_URL}/${data.id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};
