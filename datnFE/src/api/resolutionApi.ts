import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";
import type { BaseSearchParams } from "../models/base";

export interface ResolutionResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: number;
  updatedAt: number;
}

export interface ResolutionRequest {
  id?: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}

export interface ResolutionSearchParams extends BaseSearchParams {
  keyword?: string;
}

const BASE_URL = "/admin/tech-spec/resolution";

const resolutionApi = {
  search: async (params: ResolutionSearchParams): Promise<PageResponse<ResolutionResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ResolutionResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<ResolutionResponse> => {
    const res = await axiosClient.get<ResponseObject<ResolutionResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: ResolutionRequest): Promise<ResponseObject<ResolutionResponse>> => {
    const res = await axiosClient.post<ResponseObject<ResolutionResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: ResolutionRequest
  ): Promise<ResponseObject<ResolutionResponse>> => {
    const res = await axiosClient.put<ResponseObject<ResolutionResponse>>(
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

export default resolutionApi;

