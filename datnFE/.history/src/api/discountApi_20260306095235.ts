import axios from 'axios';

// ĐỊNH NGHĨA URL GỐC (Bỏ /api/v1 nếu nó đã có trong cấu hình chung)
const BASE_URL = 'http://localhost:8386/api/admin/discounts';

export const discountApi = {
    /**
     * Lấy danh sách đợt giảm giá (Phân trang + Tìm kiếm)
     */
    getAll: (params: any) => {
        // Gọi thẳng đến BASE_URL, không thêm /api/v1 ở đây nữa
        return axios.get(BASE_URL, { params });
    },

    /**
     * Lấy chi tiết một đợt giảm giá
     */
    getOne: (id: string) => {
        return axios.get(`${BASE_URL}/${id}`);
  },

    /**
     * Thêm mới đợt giảm giá
     */
    add: (data: any) => {
        return axios.post(BASE_URL, data);
    },

    /**
     * Cập nhật đợt giảm giá
     */
    update: (id: string, data: any) => {
        return axios.put(`${BASE_URL}/${id}`, data);
    },

    /**
     * Dừng đợt giảm giá (Giống logic Stop của Voucher)
     */
    changeStatus: (id: string) => {
        return axios.patch(`${BASE_URL}/${id}/status`);
    }
};

export default discountApi;