import axiosClient from "./axiosClient";
import type { ProductPageParams, ProductRequest, ProductResponse } from "../models/product";
import type { ProductVariantResponse, ProductWithVariantsResponse } from "../models/productVariant";
import type { ProductDetailRequest } from "../models/productdetail";
import type { PageResponse, PageableObject, ResponseObject } from "../models/base";

const BASE_URL = "/admin/product";

const productApi = {
    search: async (params: ProductPageParams): Promise<PageResponse<ProductResponse>> => {
        const res = await axiosClient.get<ResponseObject<PageableObject<ProductResponse>>>(BASE_URL, { params });
        return {
            data: res.data.data?.data ?? [],
            totalElements: res.data.data?.totalElements ?? 0,
            totalPages: res.data.data?.totalPages ?? 0,
            currentPage: res.data.data?.currentPage ?? 0,
        };
    },

    getById: async (id: string): Promise<ProductResponse> => {
        const res = await axiosClient.get<ResponseObject<ProductResponse>>(`${BASE_URL}/${id}`);
        return res.data.data;
    },

    // Lấy sản phẩm kèm danh sách biến thể con
    getProductWithVariants: async (id: string): Promise<ProductWithVariantsResponse> => {
        const res = await axiosClient.get<ResponseObject<ProductWithVariantsResponse>>(`${BASE_URL}/${id}/variants`);
        return res.data.data;
    },

    create: async (data: ProductRequest): Promise<ResponseObject<ProductResponse>> => {
        const res = await axiosClient.post<ResponseObject<ProductResponse>>(BASE_URL, data);
        return res.data;
    },

    update: async (id: string, data: ProductRequest): Promise<ResponseObject<ProductResponse>> => {
        const res = await axiosClient.put<ResponseObject<ProductResponse>>(`${BASE_URL}/${id}`, data);
        return res.data;
    },

    delete: async (id: string): Promise<ResponseObject<void>> => {
        const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/${id}`);
        return res.data;
    },

    /** Lưu thông số kỹ thuật động (tech_spec_value) */
    saveTechSpecValues: async (
        productId: string,
        values: Record<string, string | number | boolean | null | undefined>
    ): Promise<ResponseObject<void>> => {
        const res = await axiosClient.put<ResponseObject<void>>(
            `${BASE_URL}/${productId}/tech-spec-values`,
            values
        );
        return res.data;
    },

    // Thêm biến thể cho sản phẩm
    addVariant: async (productId: string, data: ProductDetailRequest): Promise<ResponseObject<ProductVariantResponse>> => {
        const res = await axiosClient.post<ResponseObject<ProductVariantResponse>>(`${BASE_URL}/${productId}/variants`, data);
        return res.data;
    },

    // Cập nhật biến thể
    updateVariant: async (variantId: string, data: ProductDetailRequest): Promise<ResponseObject<ProductVariantResponse>> => {
        const res = await axiosClient.put<ResponseObject<ProductVariantResponse>>(`${BASE_URL}/variants/${variantId}`, data);
        return res.data;
    },

    // Cập nhật ảnh đại diện cho biến thể (lưu ngay khi chọn)
    updateVariantImage: async (variantId: string, selectedImageId: string | null): Promise<ResponseObject<ProductVariantResponse>> => {
        const res = await axiosClient.put<ResponseObject<ProductVariantResponse>>(`${BASE_URL}/variants/${variantId}/image`, { selectedImageId });
        return res.data;
    },

    // Xóa biến thể
    deleteVariant: async (variantId: string): Promise<ResponseObject<void>> => {
        const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/variants/${variantId}`);
        return res.data;
    },

    // Toggle trạng thái sản phẩm
    changeStatus: async (id: string): Promise<ResponseObject<void>> => {
        const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
        return res.data;
    },
};

export default productApi;
