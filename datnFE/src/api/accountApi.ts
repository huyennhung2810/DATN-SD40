import axiosClient from "./axiosClient";
import type { AccountRequest, AccountSearchParams, AccountResponse, ResetPasswordRequest } from "../models/account";
import type { ResponseObject } from "../models/base";

const ADMIN_ACCOUNT_URL = "/admin/accounts";

interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

const accountApi = {
  search: async (params: AccountSearchParams) => {
    const res = await axiosClient.get<ResponseObject<SpringPage<AccountResponse>>>(ADMIN_ACCOUNT_URL, { params });
    const pageData = res.data.data;
    return {
      data: pageData.content,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      size: pageData.size,
      number: pageData.number,
    };
  },

  getById: async (id: string): Promise<AccountResponse> => {
    const res = await axiosClient.get<ResponseObject<AccountResponse>>(`${ADMIN_ACCOUNT_URL}/${id}`);
    return res.data.data;
  },

  create: async (data: AccountRequest): Promise<AccountResponse> => {
    const res = await axiosClient.post<ResponseObject<AccountResponse>>(ADMIN_ACCOUNT_URL, data);
    return res.data.data;
  },

  update: async (id: string, data: AccountRequest): Promise<AccountResponse> => {
    const res = await axiosClient.put<ResponseObject<AccountResponse>>(`${ADMIN_ACCOUNT_URL}/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${ADMIN_ACCOUNT_URL}/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const res = await axiosClient.patch<ResponseObject<void>>(`${ADMIN_ACCOUNT_URL}/${id}/status?status=${status}`);
    return res.data;
  },

  resetPassword: async (id: string, data: ResetPasswordRequest): Promise<void> => {
    const res = await axiosClient.post<ResponseObject<void>>(`${ADMIN_ACCOUNT_URL}/${id}/reset-password`, data);
    return res.data;
  },
};

export default accountApi;
