import axiosClient from "./axiosClient";
import type { ProductResponse, ProductPageParams } from "../models/product";
import type { ProductCategoryResponse } from "../models/productCategory";
import type { PageResponse, ResponseObject } from "../models/base";

// Customer Product endpoints
export const customerProductApi = {
  getProducts: async (params: ProductPageParams): Promise<PageResponse<ProductResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ProductResponse>>>("/public/products", { params });
    return res.data.data;
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const res = await axiosClient.get<ResponseObject<ProductResponse>>(`/public/products/${id}`);
    return res.data.data;
  },

  // Get all active categories for filter
  getCategories: async (): Promise<ProductCategoryResponse[]> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ProductCategoryResponse>>>("/admin/product-category", {
      params: {
        page: 1,
        size: 100,
        status: "ACTIVE",
      },
    });
    return res.data.data?.data || [];
  },
};

export default {
  product: customerProductApi,
};

