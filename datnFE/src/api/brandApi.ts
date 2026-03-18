import axiosClient from "./axiosClient";
import type { BrandPageParams, BrandRequest, BrandResponse } from "../models/brand";
import type { PageResponse, ResponseObject } from "../models/base";

const BASE_URL = "/admin/brand";

const brandApi = {
  search: async (
    params: BrandPageParams
  ): Promise<PageResponse<BrandResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<BrandResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  // Get all active brands for client homepage
  getAll: async (): Promise<BrandResponse[]> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<BrandResponse>>>(
      BASE_URL,
      { params: { page: 1, size: 100, status: "ACTIVE" } }
    );
    return res.data.data?.data || [];
  },

  getById: async (id: string): Promise<BrandResponse> => {
    const res = await axiosClient.get<ResponseObject<BrandResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (
    data: BrandRequest
  ): Promise<ResponseObject<BrandResponse>> => {
    const res = await axiosClient.post<ResponseObject<BrandResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: BrandRequest
  ): Promise<ResponseObject<BrandResponse>> => {
    const res = await axiosClient.put<ResponseObject<BrandResponse>>(
      `${BASE_URL}/${id}`,
      data
    );
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/${id}`);
    return res.data;
  },
};

export default brandApi;
