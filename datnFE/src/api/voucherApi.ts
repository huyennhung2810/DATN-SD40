import axiosClient from '../api/axiosClient';

const BASE_URL = '/admin/vouchers';
const CLIENT_BASE_URL = '/client/vouchers';

interface AvailableCoupon {
  id: string;
  code: string;
  name: string;
  voucherType: "INDIVIDUAL" | "ALL";
  discountUnit: "PERCENT" | "VND";
  discountValue: number;
  maxDiscountAmount: number;
  conditions: number;
  startDate: number;
  endDate: number;
  note: string;
  quantity: number;
  status: number;
  calculatedDiscount: number;
}

interface AvailableCouponsResponse {
  bestCoupon: AvailableCoupon | null;
  availableCoupons: AvailableCoupon[];
}

export type { AvailableCoupon, AvailableCouponsResponse };

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
    return axiosClient.get(CLIENT_BASE_URL);
};

export const getAvailableCoupons = async (cartTotal: number): Promise<AvailableCouponsResponse> => {
    const res = await axiosClient.get<any>(`${CLIENT_BASE_URL}/available`, {
        params: { cartTotal }
    });
    return res.data;
};