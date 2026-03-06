import type { ResponseObject } from "../models/base";
import type { ADShiftTemplateResponse } from "../models/shiftTemplate";
import axiosClient from "./axiosClient";

const shiftTemplateApi = {
    getAll: async () => {
        const res = await axiosClient.get<ResponseObject<ADShiftTemplateResponse[]>>(
            "/admin/shift-template"
        );
        return res.data;
    },
};

export default shiftTemplateApi;