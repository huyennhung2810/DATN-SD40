import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";
import type { BaseSearchParams } from "../models/base";

export interface VideoFormatResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: number;
  updatedAt: number;
}

export interface VideoFormatRequest {
  id?: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}

export interface VideoFormatSearchParams extends BaseSearchParams {
  keyword?: string;
}

const BASE_URL = "/admin/tech-spec/video-format";

const videoFormatApi = {
  search: async (params: VideoFormatSearchParams): Promise<PageResponse<VideoFormatResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<VideoFormatResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<VideoFormatResponse> => {
    const res = await axiosClient.get<ResponseObject<VideoFormatResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: VideoFormatRequest): Promise<ResponseObject<VideoFormatResponse>> => {
    const res = await axiosClient.post<ResponseObject<VideoFormatResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: VideoFormatRequest
  ): Promise<ResponseObject<VideoFormatResponse>> => {
    const res = await axiosClient.put<ResponseObject<VideoFormatResponse>>(
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

export default videoFormatApi;

