import type { ResponseObject } from "../models/base";
import type { 
    ColorResponse, 
    ColorFormValues,
    ColorPageParams
} from "../models/color"; 
import axiosClient from "./axiosClient";

// 1. Đã xóa chữ /products để tránh lỗi 404
const BASE_URL = "/admin/products/color"; 

export const getAll = async (params: ColorPageParams): Promise<any> => {
    // Trả về toàn bộ res.data (chứa cả { status, data, success... })
    const res = await axiosClient.get<ResponseObject<ColorResponse[]>>(BASE_URL, { params });
    return res.data; 
};

export const getColorById = async (id: string): Promise<ColorResponse> => {
    const res = await axiosClient.get<ResponseObject<ColorResponse>>(`${BASE_URL}/${id}`);
    return res.data.data;
};

export const addColor = async (data: ColorFormValues): Promise<ResponseObject<ColorResponse>> => {
    const res = await axiosClient.post<ResponseObject<ColorResponse>>(BASE_URL, data);
    return res.data;
};

export const updateColor = async (id: string, data: ColorFormValues): Promise<ResponseObject<ColorResponse>> => {
    const res = await axiosClient.put<ResponseObject<ColorResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
};

export const changeStatusColor = async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
};

export const exportExcel = async (): Promise<Blob> => {
    const res = await axiosClient.get(`${BASE_URL}/export`, { responseType: 'blob' });
    return res.data;
};

export const colorApi = {
    getAll,
    getColorById,
    addColor,
    updateColor,
    changeStatusColor,
    exportExcel,
};

export default colorApi;