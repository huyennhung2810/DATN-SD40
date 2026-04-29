import type { ResponseObject } from "../../models/base";
import type { ADAssignSerialRequest, ADChangeStatusRequest, ADOrderSearchRequest, ADUpdateCustomerRequest, OrderDetailPageResponse, OrderPageResponse } from "../../models/order";
import axiosClient from "../axiosClient";



const PREFIX = "/admin/orders"; 

export const orderApi = {
    //Lấy danh sách hóa đơn
    searchOrders: (params: ADOrderSearchRequest): Promise<{ data: ResponseObject<OrderPageResponse> }> => {
        return axiosClient.get(`${PREFIX}`, { params });
    },

    //chi tiét
    getOrderDetails: async (maHoaDon: string, params?: { page?: number, size?: number }): Promise<ResponseObject<OrderDetailPageResponse>> => {
        const res = await axiosClient.get(`${PREFIX}/all`, { 
            params: { maHoaDon, page: 0, size: 100, ...params } 
        });
        return res.data;
    },

    //cập nhật trạng thái
    updateOrderStatus: (data: ADChangeStatusRequest): Promise<ResponseObject<any>> => {
        return axiosClient.put(`${PREFIX}/change-status`, data);
    },

    //thay đổi mã
    assignSerials: async (data: ADAssignSerialRequest): Promise<ResponseObject<any>> => {
        const res = await axiosClient.put(`${PREFIX}/doi-imei`, data);
        return res.data;
    },

    //cập nhật tt giao hàng
    updateCustomerInfo: (data: ADUpdateCustomerRequest): Promise<ResponseObject<any>> => {
        return axiosClient.put(`${PREFIX}/cap-nhat-khach-hang`, data);
    }
};