import type { PageResponse, ResponseObject } from "../models/base";
import type { 
    SerialResponse, 
    SerialFormValues,
    SerialPageParams
} from "../models/serial";
import axiosClient from "./axiosClient";

const BASE_URL = "/admin/serial";

export const getAll = async (params: SerialPageParams): Promise<PageResponse<SerialResponse[]>> => {
    const res = await axiosClient.get<ResponseObject<PageResponse<SerialResponse[]>>>(BASE_URL, { params });
    return res.data.data;
};

export const getSerialById = async (id: string): Promise<SerialResponse> => {
    const res = await axiosClient.get<ResponseObject<SerialResponse>>(`${BASE_URL}/${id}`);
    return res.data.data;
};


export const addSerial = async (data: SerialFormValues): Promise<ResponseObject<SerialResponse>> => {
    const res = await axiosClient.post<ResponseObject<SerialResponse>>(BASE_URL, data);
    return res.data;
};

export const updateSerial = async (id: string, data: SerialFormValues): Promise<ResponseObject<SerialResponse>> => {
    const res = await axiosClient.put<ResponseObject<SerialResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
};

export const changeStatusSerial = async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
};

export const exportExcel = async (): Promise<Blob> => {
    const res = await axiosClient.get(`${BASE_URL}/export`, { responseType: 'blob' });
    return res.data;
};

export const serialApi = {
    getAll,
    getSerialById,
    addSerial,
    updateSerial,
    changeStatusSerial,
    exportExcel,
};

export default serialApi;