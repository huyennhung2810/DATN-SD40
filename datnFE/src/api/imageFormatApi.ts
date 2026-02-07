import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";
import type { BaseSearchParams } from "../models/base";

export interface ImageFormatResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: number;
  updatedAt: number;
}

export interface ImageFormatRequest {
  id?: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}

export interface ImageFormatSearchParams extends BaseSearchParams {
  keyword?: string;
}

const BASE_URL = "/admin/tech-spec/image-format";

const imageFormatApi = {
  search: async (params: ImageFormatSearchParams): Promise<PageResponse<ImageFormatResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ImageFormatResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<ImageFormatResponse> => {
    const res = await axiosClient.get<ResponseObject<ImageFormatResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: ImageFormatRequest): Promise<ResponseObject<ImageFormatResponse>> => {
    const res = await axiosClient.post<ResponseObject<ImageFormatResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: ImageFormatRequest
  ): Promise<ResponseObject<ImageFormatResponse>> => {
    const res = await axiosClient.put<ResponseObject<ImageFormatResponse>>(
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

export default imageFormatApi;

