import axiosClient from "./axiosClient";
import type { BannerRequest, BannerSearchParams, BannerResponse } from "../models/banner";
import type { ResponseObject } from "../models/base";

const ADMIN_BANNER_URL = "/admin/banners";
const PUBLIC_BANNER_URL = "/public/banners";

// Spring Page response interface
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

interface UploadResponse {
  url: string;
  publicId: string;
}

const bannerApi = {
    search: async (params: BannerSearchParams) => {
        const res = await axiosClient.get<ResponseObject<SpringPage<BannerResponse>>>(ADMIN_BANNER_URL, { params });
        const pageData = res.data.data;
        return {
            data: pageData.content,
            totalElements: pageData.totalElements,
            totalPages: pageData.totalPages,
            size: pageData.size,
            number: pageData.number,
        };
    },

    getById: async (id: string): Promise<BannerResponse> => {
        const res = await axiosClient.get<ResponseObject<BannerResponse>>(`${ADMIN_BANNER_URL}/${id}`);
        return res.data.data;
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosClient.post<ResponseObject<UploadResponse>>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.data.url;
    },

    create: async (data: BannerRequest): Promise<BannerResponse> => {
        const res = await axiosClient.post<ResponseObject<BannerResponse>>(ADMIN_BANNER_URL, data);
        return res.data.data;
    },

    update: async (id: string, data: BannerRequest): Promise<BannerResponse> => {
        const res = await axiosClient.put<ResponseObject<BannerResponse>>(`${ADMIN_BANNER_URL}/${id}`, data);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        const res = await axiosClient.delete<ResponseObject<void>>(`${ADMIN_BANNER_URL}/${id}`);
        return res.data;
    },

    updateStatus: async (id: string, status: number): Promise<void> => {
        const res = await axiosClient.patch<ResponseObject<void>>(`${ADMIN_BANNER_URL}/${id}/status?status=${status}`);
        return res.data;
    },

    getBannersByPosition: async (position: string): Promise<BannerResponse[]> => {
        const res = await axiosClient.get<ResponseObject<BannerResponse[]>>(`${PUBLIC_BANNER_URL}/position/${position}`);
        return res.data.data;
    },

    getAllActiveBanners: async (): Promise<BannerResponse[]> => {
        const res = await axiosClient.get<ResponseObject<BannerResponse[]>>(`${PUBLIC_BANNER_URL}`);
        return res.data.data;
    },
};

export default bannerApi;
