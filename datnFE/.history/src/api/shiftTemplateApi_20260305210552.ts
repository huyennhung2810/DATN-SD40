import axiosClient from "./axiosClient";
import type { ResponseObject } from "../models/base";
import type { ADShiftTemplateRequest, ADShiftTemplateResponse } from "../models/shiftTemplate";

const BASE_URL = "/admin/shift-template"; 

export const shiftTemplateApi = {
    // Lấy danh sách có kèm bộ lọc (keyword, status, time)
    getAll: async (params: any): Promise<ResponseObject<ADShiftTemplateResponse[]>> => {
        const res = await axiosClient.get<ResponseObject<ADShiftTemplateResponse[]>>(BASE_URL, { params });
        return res.data;
    },

    // Tạo mới ca làm việc
    create: async (data: ADShiftTemplateRequest): Promise<ResponseObject<ADShiftTemplateResponse>> => {
        const res = await axiosClient.post<ResponseObject<ADShiftTemplateResponse>>(BASE_URL, data);
        return res.data;
    },

    //Update ca làm việc
    update: async (id: string, data: ADShiftTemplateRequest): Promise<ResponseObject<ADShiftTemplateResponse>> => {
    const res = await axiosClient.put<ResponseObject<ADShiftTemplateResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
},

    changeStatus: async (id: string): Promise<ResponseObject<ADShiftTemplateResponse>> => {
    const res = await axiosClient.put<ResponseObject<ADShiftTemplateResponse>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
},
};

export default shiftTemplateApi;