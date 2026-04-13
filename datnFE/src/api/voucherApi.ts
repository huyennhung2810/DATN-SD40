import axiosClient from '../api/axiosClient';

const BASE_URL = '/admin/vouchers'; 

export const voucherApi = {
    getAll: (params: any) => {
        return axiosClient.get(BASE_URL, { params });     },

    getById: (id: string) => {
        return axiosClient.get(`${BASE_URL}/${id}`);
    },

    create: (data: any) => {
        return axiosClient.post(BASE_URL, data);
    },

    update: (id: string, data: any) => {
        return axiosClient.put(`${BASE_URL}/${id}`, data);
    },

    delete: (id: string) => {
        return axiosClient.delete(`${BASE_URL}/${id}`);
    },

    stop: (id: string) => {
        return axiosClient.patch(`${BASE_URL}/${id}/stop`);
    },

    checkCodeExists: (code: string) => {
        return axiosClient.get(`${BASE_URL}/check-code/${code.trim()}`);
    },

    updateDetailStatus: (detailId: string, params: { status: number; reason: string }) => {
        return axiosClient.patch(`${BASE_URL}/detail/${detailId}/status`, params);
    },
};

export const getClientVouchers = (): Promise<any> => {
    return axiosClient.get('/client/vouchers');
};