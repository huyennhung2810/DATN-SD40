import axios from 'axios';

// Cấu hình URL cơ sở trỏ đến Backend Spring Boot của bạn
const BASE_URL = 'http://localhost:8386/api/admin/vouchers';

export const voucherApi = {
    /**
     * Lấy danh sách voucher có phân trang và tìm kiếm
     * @param params Bao gồm page, size, keyword, status...
     */
    getAll: (params: any) => {
        return axios.get(BASE_URL, { params });
    },

    /**
     * Lấy chi tiết một voucher theo ID
     */
    getById: (id: string) => {
        return axios.get(`${BASE_URL}/${id}`);
    },

    /**
     * Thêm mới một voucher
     */
    create: (data: any) => {
        return axios.post(BASE_URL, data);
    },

    /**
     * Cập nhật thông tin voucher
     */
    update: (id: string, data: any) => {
        return axios.put(`${BASE_URL}/${id}`, data);
    },

    /**
     * Xóa voucher (nếu backend hỗ trợ)
     */
    delete: (id: string) => {
        return axios.delete(`${BASE_URL}/${id}`);
    }
};