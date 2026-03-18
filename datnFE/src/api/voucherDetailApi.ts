import axiosClient from '../api/axiosClient'; 

const BASE_URL = '/admin/voucher-details';

export const voucherDetailApi = {
    getByVoucher: (voucherId: string, params: any) => {
        return axiosClient.get(`${BASE_URL}/${voucherId}`, { params });
    },

    disable: (data: { voucherId: string, customerId: string, reason: string }) => {
        return axiosClient.patch(`${BASE_URL}/disable`, data);
    },

    remove: (voucherId: string, customerId: string) => {
        return axiosClient.delete(`${BASE_URL}/${voucherId}/${customerId}`);
    }
};