import axios from 'axios';

const BASE_URL = 'http://localhost:8386/api/admin/voucher-details';

export const voucherDetailApi = {
    // Lấy danh sách khách hàng đã áp dụng voucher (phân trang)
    getByVoucher: (voucherId: string, params: any) => {
        return axios.get(`${BASE_URL}/${voucherId}`, { params });
    },

    // Vô hiệu hóa voucher của 1 khách hàng
    disable: (data: { voucherId: string, customerId: string, reason: string }) => {
        return axios.patch(`${BASE_URL}/disable`, data);
    },

    // Xóa khách hàng khỏi danh sách (khi chưa dùng/chưa gửi mail)
    remove: (voucherId: string, customerId: string) => {
        return axios.delete(`${BASE_URL}/${voucherId}/${customerId}`);
    }
};