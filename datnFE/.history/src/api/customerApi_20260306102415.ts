import axiosClient from "./axiosClient";
import type { BannerResponse } from "../models/banner";
import type { ResponseObject } from "../models/base";
import type { PageResponse } from "../models/base";
import type { CustomerResponse, CustomerRequest, CustomerPageParams } from "../models/customer";

// Banner endpoints
export const bannerApi = {
  getActiveBanners: async (position: string = "HOME_TOP"): Promise<BannerResponse[]> => {
    const res = await axiosClient.get<ResponseObject<BannerResponse[]>>(`/banners/active?position=${position}`);
    return res.data.data;
  },
};

// Customer endpoints - reused from existing admin customer management
export const customerApi = {
  getAll: async (params: CustomerPageParams): Promise<PageResponse<CustomerResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<CustomerResponse>>>("/admin/customers", { params });
    return res.data.data;
  },
  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const res = await axiosClient.get<ResponseObject<CustomerResponse>>(`/admin/customers/${id}`);
    return res.data.data;
  },
  addCustomer: async (data: CustomerRequest): Promise<CustomerResponse> => {
    const res = await axiosClient.post<ResponseObject<CustomerResponse>>("/admin/customers", data);
    return res.data.data;
  },
  updateCustomer: async (data: CustomerRequest): Promise<CustomerResponse> => {
    const res = await axiosClient.put<ResponseObject<CustomerResponse>>(`/admin/customers/${data.id}`, data);
    return res.data.data;
  },
  changeStatusCustomer: async (id: string): Promise<void> => {
    await axiosClient.put<ResponseObject<void>>(`/admin/customers/${id}/status`);
  },
  exportExcel: async (): Promise<Blob> => {
    const res = await axiosClient.get<ResponseObject<Blob>>("/admin/customers/export", { responseType: 'blob' });
    return res.data.data;
  },
  checkDuplicate: async (field: string, value: string, excludeId?: string): Promise<boolean> => {
    const res = await axiosClient.get<ResponseObject<boolean>>("/admin/customers/check-duplicate", {
      params: { field, value, excludeId },
    });
    return res.data.data;
  },
};

export default {
  banner: bannerApi,
  customer: customerApi,
};