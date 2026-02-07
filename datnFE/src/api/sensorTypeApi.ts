import axiosClient from "./axiosClient";
import type { PageResponse, ResponseObject } from "../models/base";
import type { BaseSearchParams } from "../models/base";

export interface SensorTypeResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: number;
  updatedAt: number;
}

export interface SensorTypeRequest {
  id?: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}

export interface SensorTypeSearchParams extends BaseSearchParams {
  keyword?: string;
}

const BASE_URL = "/admin/tech-spec/sensor-type";

const sensorTypeApi = {
  search: async (params: SensorTypeSearchParams): Promise<PageResponse<SensorTypeResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<SensorTypeResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<SensorTypeResponse> => {
    const res = await axiosClient.get<ResponseObject<SensorTypeResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: SensorTypeRequest): Promise<ResponseObject<SensorTypeResponse>> => {
    const res = await axiosClient.post<ResponseObject<SensorTypeResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: SensorTypeRequest
  ): Promise<ResponseObject<SensorTypeResponse>> => {
    const res = await axiosClient.put<ResponseObject<SensorTypeResponse>>(
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

export default sensorTypeApi;

