import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";
import type { BaseSearchParams } from "../models/base";

export interface ProcessorResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: number;
  updatedAt: number;
}

export interface ProcessorRequest {
  id?: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}

export interface ProcessorSearchParams extends BaseSearchParams {
  keyword?: string;
}

const BASE_URL = "/admin/tech-spec/processor";

const processorApi = {
  search: async (params: ProcessorSearchParams): Promise<PageResponse<ProcessorResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ProcessorResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<ProcessorResponse> => {
    const res = await axiosClient.get<ResponseObject<ProcessorResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: ProcessorRequest): Promise<ResponseObject<ProcessorResponse>> => {
    const res = await axiosClient.post<ResponseObject<ProcessorResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: ProcessorRequest
  ): Promise<ResponseObject<ProcessorResponse>> => {
    const res = await axiosClient.put<ResponseObject<ProcessorResponse>>(
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

export default processorApi;

