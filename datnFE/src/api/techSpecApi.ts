import axiosClient from "./axiosClient";
import type { TechSpecPageParams, TechSpecRequest, TechSpecResponse } from "../models/techSpec";
import type { PageResponse, ResponseObject } from "../models/base";

const BASE_URL = "/admin/tech-spec";

const techSpecApi = {
  search: async (params: TechSpecPageParams): Promise<PageResponse<TechSpecResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<TechSpecResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<TechSpecResponse> => {
    const res = await axiosClient.get<ResponseObject<TechSpecResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (data: TechSpecRequest): Promise<ResponseObject<TechSpecResponse>> => {
    const res = await axiosClient.post<ResponseObject<TechSpecResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: TechSpecRequest
  ): Promise<ResponseObject<TechSpecResponse>> => {
    const res = await axiosClient.put<ResponseObject<TechSpecResponse>>(
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

export default techSpecApi;

