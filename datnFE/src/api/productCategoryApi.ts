import axiosClient from "./axiosClient";
import type {
  ProductCategoryPageParams,
  ProductCategoryRequest,
  ProductCategoryResponse,
} from "../models/productCategory";
import type { PageResponse, PageableObject, ResponseObject } from "../models/base";

const BASE_URL = "/admin/product-category";

const productCategoryApi = {
  search: async (
    params: ProductCategoryPageParams
  ): Promise<PageResponse<ProductCategoryResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageableObject<ProductCategoryResponse>>>(
      BASE_URL,
      { params }
    );
    const d = res.data.data;
    return {
      data: d?.data ?? [],
      totalElements: d?.totalElements ?? 0,
      totalPages: d?.totalPages ?? 0,
      currentPage: d?.currentPage ?? 0,
    };
  },

  getAll: async (): Promise<ProductCategoryResponse[]> => {
    const res = await axiosClient.get<ResponseObject<PageableObject<ProductCategoryResponse>>>(
      BASE_URL,
      { params: { page: 0, size: 1000 } }
    );
    return res.data.data?.data ?? [];
  },

  getById: async (id: string): Promise<ProductCategoryResponse> => {
    const res = await axiosClient.get<ResponseObject<ProductCategoryResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  create: async (
    data: ProductCategoryRequest
  ): Promise<ResponseObject<ProductCategoryResponse>> => {
    const res = await axiosClient.post<ResponseObject<ProductCategoryResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  update: async (
    id: string,
    data: ProductCategoryRequest
  ): Promise<ResponseObject<ProductCategoryResponse>> => {
    const res = await axiosClient.put<ResponseObject<ProductCategoryResponse>>(
      `${BASE_URL}/${id}`,
      data
    );
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/${id}`);
    return res.data;
  },

  changeStatus: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
  },
};

export default productCategoryApi;

