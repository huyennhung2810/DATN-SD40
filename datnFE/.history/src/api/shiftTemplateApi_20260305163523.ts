import axiosClient from "./axiosClient";
import type { ResponseObject } from "../models/base";
import type { , ADShiftTemplateResponse } from "../models/shiftTemplate";

// Khớp với MappingConstants.API_ADMIN_PREFIX_SHIFT_TEMPLATE ở Backend
const BASE_URL = "/admin/shift-templates"; 

export const shiftTemplateApi = {
    // Lấy danh sách có kèm bộ lọc (keyword, status, time)
    getAll: async (params: any): Promise<ResponseObject<ADShiftTemplateResponse[]>> => {
        const res = await axiosClient.get<ResponseObject<ADShiftTemplateResponse[]>>(BASE_URL, { params });
        return res.data;
    },

    // Tạo mới ca làm việc mẫu
    create: async (data: ADShiftTemplateRequest): Promise<ResponseObject<ADShiftTemplateResponse>> => {
        const res = await axiosClient.post<ResponseObject<ADShiftTemplateResponse>>(BASE_URL, data);
        return res.data;
    }
};

export default shiftTemplateApi;