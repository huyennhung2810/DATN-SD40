import axiosClient from "./axiosClient";
import type {
  ProductCategoryPageParams,
  ProductCategoryRequest,
  ProductCategoryResponse,
} from "../models/productCategory";
import type { PageResponse, ResponseObject } from "../models/base";

const BASE_URL = "/admin/product-category";

const productCategoryApi = {
  search: async (
    params: ProductCategoryPageParams
  ): Promise<PageResponse<ProductCategoryResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ProductCategoryResponse>>>(
      BASE_URL,
      { params }
    );
    return res.data.data;
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
};

export default productCategoryApi;

