import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";
import type { BaseSearchParams } from "../models/base";

export interface LensMountResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: number;
  updatedAt: number;
}

export interface LensMountRequest {
  id?: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}

export interface LensMountSearchParams extends BaseSearchParams {
  keyword?: string;
}

const BASE_URL = "/admin/tech-spec/lens-mount";

const lensMountApi = {
  search: async (params: LensMountSearchParams): Promise<PageResponse<LensMountResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<LensMountResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<LensMountResponse> => {
    const res = await axiosClient.get<ResponseObject<LensMountResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: LensMountRequest): Promise<ResponseObject<LensMountResponse>> => {
    const res = await axiosClient.post<ResponseObject<LensMountResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: LensMountRequest
  ): Promise<ResponseObject<LensMountResponse>> => {
    const res = await axiosClient.put<ResponseObject<LensMountResponse>>(
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

export default lensMountApi;

