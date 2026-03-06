import axiosClient from "./axiosClient";
import type { BannerSearchParams, BannerRequest, BannerResponse } from "../models/banner";
import type { PageResponse, ResponseObject } from "../models/base";

const BASE_URL = "/api/v1/admin/banner";

const bannerApi = {
  search: async (params: BannerSearchParams): Promise<PageResponse<BannerResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<BannerResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<BannerResponse> => {
    const res = await axiosClient.get<ResponseObject<BannerResponse>>(`${BASE_URL}/${id}`);
    return res.data.data;
  },

  create: async (data: BannerRequest): Promise<ResponseObject<BannerResponse>> => {
    const res = await axiosClient.post<ResponseObject<BannerResponse>>(BASE_URL, data);
    return res.data;
  },

  update: async (id: string, data: BannerRequest): Promise<ResponseObject<BannerResponse>> => {
    const res = await axiosClient.put<ResponseObject<BannerResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/${id}`);
    return res.data;
  },

  // Toggle status
  updateStatus: async (id: string, status: string): Promise<ResponseObject<BannerResponse>> => {
    const res = await axiosClient.patch<ResponseObject<BannerResponse>>(
      `${BASE_URL}/${id}/status?status=${status}`
    );
    return res.data;
  },

  // API cho client - lấy banner đang hoạt động
  getActiveBanners: async (slot?: string): Promise<BannerResponse[]> => {
    const params = slot ? { slot } : {};
    const res = await axiosClient.get<ResponseObject<BannerResponse[]>>(
      `${BASE_URL}/active`,
      { params }
    );
    return res.data.data;
  },
};

export default bannerApi;
