import type { PageResponse, ResponseObject } from "../models/base";
import type { 
    ProductDetailResponse, 
    ProductDetailFormValues,
    ProductDetailPageParams
} from "../models/productdetail";
import axiosClient from "./axiosClient";

const BASE_URL = "/admin/products/product-detail";
const PRODUCT_BASE_URL = "/admin/product"; // URL lấy sản phẩm cha

export const getAll = async (params: ProductDetailPageParams): Promise<PageResponse<ProductDetailResponse>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<ProductDetailResponse>>>(BASE_URL, { params });
    return res.data.data;
};

// Hàm lấy Sản phẩm cha đổ vào Select
export const getAllProduct = async (params: any): Promise<any> => {
    const res = await axiosClient.get<ResponseObject<any>>(PRODUCT_BASE_URL, { params });
    return res.data.data;
};

export const getById = async (id: string): Promise<ProductDetailResponse> => {
    const res = await axiosClient.get<ResponseObject<ProductDetailResponse>>(`${BASE_URL}/${id}`);
    return res.data.data;
};

export const add = async (data: ProductDetailFormValues): Promise<ResponseObject<ProductDetailResponse>> => {
    const res = await axiosClient.post<ResponseObject<ProductDetailResponse>>(BASE_URL, data);
    return res.data;
};

export const update = async (id: string, data: ProductDetailFormValues): Promise<ResponseObject<ProductDetailResponse>> => {
    const res = await axiosClient.put<ResponseObject<ProductDetailResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
};

export const changeStatus = async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
};

export const exportExcel = async (params: ProductDetailPageParams): Promise<Blob> => {
    const res = await axiosClient.get(`${BASE_URL}/export`, { 
        params, 
        responseType: 'blob' 
    });
    return res.data;
};

export const productDetailApi = {
    getAll,
    getById,
    add,
    update,
    changeStatus,
    exportExcel,
    getAllProduct,
    batchCreate: async (productId: string, data: any) => {
        const res = await axiosClient.post<any>(`${BASE_URL}/batch/${productId}`, data);
        return res.data;
    },
};

export default productDetailApi;