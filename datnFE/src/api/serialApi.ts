import type { PageResponse, ResponseObject } from "../models/base";
import type { 
    SerialResponse, 
    SerialFormValues,
    SerialPageParams
} from "../models/serial";
import axiosClient from "./axiosClient";

// 1. Định nghĩa đường dẫn cơ sở (Khớp với @RequestMapping trong Controller của bạn)
const BASE_URL = "/admin/serial";

// 2. Lấy danh sách phân trang
export const getAll = async (params: SerialPageParams): Promise<PageResponse<SerialResponse[]>> => {
    // Backend trả về ResponseObject<PageResponse<T>>
    const res = await axiosClient.get<ResponseObject<PageResponse<SerialResponse[]>>>(BASE_URL, { params });
    return res.data.data;
};

// 3. Lấy chi tiết 1 Serial (Dùng khi sửa)
export const getSerialById = async (id: string): Promise<SerialResponse> => {
    const res = await axiosClient.get<ResponseObject<SerialResponse>>(`${BASE_URL}/${id}`);
    return res.data.data;
};

// 4. Thêm mới Serial (Gửi JSON trực tiếp, không dùng FormData vì không có ảnh)
export const addSerial = async (data: SerialFormValues): Promise<ResponseObject<SerialResponse>> => {
    const res = await axiosClient.post<ResponseObject<SerialResponse>>(BASE_URL, data);
    return res.data;
};

// 5. Cập nhật Serial
export const updateSerial = async (id: string, data: SerialFormValues): Promise<ResponseObject<SerialResponse>> => {
    const res = await axiosClient.put<ResponseObject<SerialResponse>>(`${BASE_URL}/${id}`, data);
    return res.data;
};

// 6. Đổi trạng thái (Khớp với hàm changeStatus trong Service BE của bạn)
export const changeStatusSerial = async (id: string): Promise<ResponseObject<void>> => {
    const res = await axiosClient.put<ResponseObject<void>>(`${BASE_URL}/${id}/change-status`);
    return res.data;
};

// 7. Xuất Excel (Dạng file nhị phân - Blob)
export const exportExcel = async (): Promise<Blob> => {
    const res = await axiosClient.get(`${BASE_URL}/export`, { responseType: 'blob' });
    return res.data;
};

// gom nhóm export giống mẫu Customer
export const serialApi = {
    getAll,
    getSerialById,
    addSerial,
    updateSerial,
    changeStatusSerial,
    exportExcel,
};

export default serialApi;