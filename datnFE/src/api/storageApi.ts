import type { ResponseObject } from "../models/base";
import type { 
    StorageCapacityResponse, 
    StorageCapacityFormValues,
    StorageCapacityPageParams
} from "../models/storage"; 
import axiosClient from "./axiosClient";

// 1. Đường dẫn cho Dung lượng bộ nhớ (thường theo chuẩn admin/storage-capacity)
const BASE_URL = "/admin/products/storage-capacity"; 

export const getAll = async (params: StorageCapacityPageParams): Promise<any> => {
    // Trả về toàn bộ res.data để Saga xử lý phân trang giả
    const res = await axiosClient.get<ResponseObject<StorageCapacityResponse[]>>(BASE_URL, { params });
    return res.data; 
};

export const getStorageById = async (id: string): Promise<StorageCapacityResponse> => {
    const res = await axiosClient.get<ResponseObject<StorageCapacityResponse>>(`${BASE_URL}/${id}`);
    return res.data.data;
};

export const addStorage = async (data: StorageCapacityFormValues): Promise<ResponseObject<StorageCapacityResponse>> => {
    const res = await axiosClient.post<ResponseObject<StorageCapacityResponse>>(BASE_URL, data);
    return res.data;
};

export const updateStorage = async (id: string, data: StorageCapacityFormValues): Promise<ResponseObject<StorageCapacityResponse>> => {
    const res = await axiosClient.put<ResponseObject<StorageCapacityResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
};

export const changeStatusStorage = async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
};

export const exportExcel = async (): Promise<Blob> => {
    const res = await axiosClient.get(`${BASE_URL}/export`, { responseType: 'blob' });
    return res.data;
};

// Gom nhóm lại để gọi trong Saga: storageCapacityApi.getAll(...)
export const storageCapacityApi = {
    getAll,
    getStorageById,
    addStorage,
    updateStorage,
    changeStatusStorage,
    exportExcel,
};

export default storageCapacityApi;