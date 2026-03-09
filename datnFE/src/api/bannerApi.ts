import axiosClient from "./axiosClient";
import type {
  BannerRequest,
  BannerResponse,
  BannerSearchRequest,
  BannerPageResponse,
} from "../models/banner";
import type { ResponseObject } from "../models/base";

const ADMIN_BASE_URL = "/admin/banners";
const CLIENT_BASE_URL = "/client/banners";

const bannerApi = {
  // Admin APIs
  search: async (params: BannerSearchRequest): Promise<BannerPageResponse> => {
    const res = await axiosClient.get<ResponseObject<BannerPageResponse>>(ADMIN_BASE_URL, { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<BannerResponse> => {
    const res = await axiosClient.get<ResponseObject<BannerResponse>>(`${ADMIN_BASE_URL}/${id}`);
    return res.data.data;
  },

  create: async (data: BannerRequest): Promise<BannerResponse> => {
    const res = await axiosClient.post<ResponseObject<BannerResponse>>(ADMIN_BASE_URL, data);
    return res.data.data;
  },

  update: async (id: string, data: BannerRequest): Promise<BannerResponse> => {
    const res = await axiosClient.put<ResponseObject<BannerResponse>>(`${ADMIN_BASE_URL}/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`${ADMIN_BASE_URL}/${id}`);
  },

  changeStatus: async (id: string, status: string): Promise<BannerResponse> => {
    const res = await axiosClient.patch<ResponseObject<BannerResponse>>(
      `${ADMIN_BASE_URL}/${id}/status?status=${status}`
    );
    return res.data.data;
  },

  // Client APIs
  getActiveBanners: async (position?: string): Promise<BannerResponse[]> => {
    const url = position 
      ? `${CLIENT_BASE_URL}/active?position=${position}` 
      : `${CLIENT_BASE_URL}/active`;
    const res = await axiosClient.get<ResponseObject<BannerResponse[]>>(url);
    return res.data.data || [];
  },

  getGroupedBanners: async (): Promise<BannerResponse[]> => {
    const res = await axiosClient.get<ResponseObject<BannerResponse[]>>(`${CLIENT_BASE_URL}/grouped`);
    return res.data.data || [];
  },
};

export default bannerApi;
