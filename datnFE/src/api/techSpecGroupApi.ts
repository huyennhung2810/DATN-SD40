import axiosClient from "./axiosClient";
import type {
  TechSpecGroupSearchParams,
  TechSpecGroupRequest,
  TechSpecGroupResponse,
  TechSpecDefinitionSearchParams,
  TechSpecDefinitionRequest,
  TechSpecDefinitionResponse,
  TechSpecDefinitionItemRequest,
  TechSpecDefinitionItemResponse,
} from "../models/techSpecGroup";
import type { PageResponse, ResponseObject } from "../models/base";

const GROUP_URL = "/admin/tech-spec-group";
const DEFINITION_URL = "/admin/tech-spec-definition";
const DEFINITION_ITEM_URL = "/admin/tech-spec-definition-item";

// ========== GROUP APIs ==========

const techSpecGroupApi = {
  search: async (params: TechSpecGroupSearchParams): Promise<PageResponse<TechSpecGroupResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<TechSpecGroupResponse>>>(
      GROUP_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<TechSpecGroupResponse> => {
    const res = await axiosClient.get<ResponseObject<TechSpecGroupResponse>>(`${GROUP_URL}/${id}`);
    return res.data.data;
  },

  create: async (data: TechSpecGroupRequest): Promise<ResponseObject<TechSpecGroupResponse>> => {
    const res = await axiosClient.post<ResponseObject<TechSpecGroupResponse>>(GROUP_URL, data);
    return res.data;
  },

  update: async (id: string, data: TechSpecGroupRequest): Promise<ResponseObject<TechSpecGroupResponse>> => {
    const res = await axiosClient.put<ResponseObject<TechSpecGroupResponse>>(`${GROUP_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${GROUP_URL}/${id}`);
    return res.data;
  },
};

// ========== DEFINITION APIs ==========

const techSpecDefinitionApi = {
  search: async (params: TechSpecDefinitionSearchParams): Promise<PageResponse<TechSpecDefinitionResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<TechSpecDefinitionResponse>>>(
      DEFINITION_URL,
      { params }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<TechSpecDefinitionResponse> => {
    const res = await axiosClient.get<ResponseObject<TechSpecDefinitionResponse>>(`${DEFINITION_URL}/${id}`);
    return res.data.data;
  },

  getAllActive: async (): Promise<TechSpecDefinitionResponse[]> => {
    const res = await axiosClient.get<ResponseObject<TechSpecDefinitionResponse[]>>(`${DEFINITION_URL}/all-active`);
    return res.data.data;
  },

  create: async (data: TechSpecDefinitionRequest): Promise<ResponseObject<TechSpecDefinitionResponse>> => {
    const res = await axiosClient.post<ResponseObject<TechSpecDefinitionResponse>>(DEFINITION_URL, data);
    return res.data;
  },

  update: async (id: string, data: TechSpecDefinitionRequest): Promise<ResponseObject<TechSpecDefinitionResponse>> => {
    const res = await axiosClient.put<ResponseObject<TechSpecDefinitionResponse>>(`${DEFINITION_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${DEFINITION_URL}/${id}`);
    return res.data;
  },
};

// ========== DEFINITION ITEM APIs ==========

const techSpecDefinitionItemApi = {
  getByDefinitionId: async (definitionId: string): Promise<TechSpecDefinitionItemResponse[]> => {
    const res = await axiosClient.get<ResponseObject<TechSpecDefinitionItemResponse[]>>(
      `${DEFINITION_ITEM_URL}/definition/${definitionId}`
    );
    return res.data.data;
  },

  create: async (data: TechSpecDefinitionItemRequest): Promise<ResponseObject<TechSpecDefinitionItemResponse>> => {
    const res = await axiosClient.post<ResponseObject<TechSpecDefinitionItemResponse>>(DEFINITION_ITEM_URL, data);
    return res.data;
  },

  update: async (id: string, data: TechSpecDefinitionItemRequest): Promise<ResponseObject<TechSpecDefinitionItemResponse>> => {
    const res = await axiosClient.put<ResponseObject<TechSpecDefinitionItemResponse>>(`${DEFINITION_ITEM_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${DEFINITION_ITEM_URL}/${id}`);
    return res.data;
  },
};

export { techSpecGroupApi, techSpecDefinitionApi, techSpecDefinitionItemApi };
