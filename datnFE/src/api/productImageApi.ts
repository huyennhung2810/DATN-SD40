import axiosClient from "./axiosClient";
import type {
  ProductImageRequest,
  ProductImageResponse,
} from "../models/productImage";
import type { ResponseObject } from "../models/base";

const BASE_URL = "/admin/product-image";

const productImageApi = {
  listByProduct: async (productId: string): Promise<ProductImageResponse[]> => {
    const res = await axiosClient.get<ResponseObject<ProductImageResponse[]>>(
      `${BASE_URL}/product/${productId}`
    );
    return res.data.data ?? [];
  },

  getById: async (id: string): Promise<ProductImageResponse> => {
    const res = await axiosClient.get<ResponseObject<ProductImageResponse>>(
      `${BASE_URL}/${id}`
    );
    return res.data.data;
  },

  upload: async (
    productId: string,
    file: File
  ): Promise<ProductImageResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post<ResponseObject<ProductImageResponse>>(
      `${BASE_URL}/upload/${productId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data.data;
  },

  create: async (
    data: ProductImageRequest
  ): Promise<ResponseObject<ProductImageResponse>> => {
    const res = await axiosClient.post<ResponseObject<ProductImageResponse>>(
      BASE_URL,
      data
    );
    return res.data;
  },

  delete: async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/${id}`);
    return res.data;
  },
};

export default productImageApi;

