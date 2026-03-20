import type { ResponseObject } from "../../models/base";
import type { ADAssignSerialRequest, ADChangeStatusRequest, ADOrderSearchRequest, ADUpdateCustomerRequest, OrderDetailPageResponse, OrderPageResponse } from "../../models/order";
import axiosClient from "../axiosClient";



const PREFIX = "/admin/orders"; 

export const orderApi = {
    //Layas ds hd
    searchOrders: (params: ADOrderSearchRequest): Promise<ResponseObject<OrderPageResponse>> => {
        return axiosClient.get(`${PREFIX}`, { params });
    },

    //chi tiét
    getOrderDetails: (maHoaDon: string, params?: { page?: number, size?: number }): Promise<ResponseObject<OrderDetailPageResponse>> => {
        return axiosClient.get(`${PREFIX}/all`, { 
            params: { maHoaDon, ...params } 
        });
    },

    //cập nhật trạng thái
    updateOrderStatus: (data: ADChangeStatusRequest): Promise<ResponseObject<any>> => {
        return axiosClient.put(`${PREFIX}/change-status`, data);
    },

    //thay đổi mã
    assignSerials: (data: ADAssignSerialRequest): Promise<ResponseObject<any>> => {
        return axiosClient.put(`${PREFIX}/doi-imei`, data);
    },

    //cập nhật tt giao hàng
    updateCustomerInfo: (data: ADUpdateCustomerRequest): Promise<ResponseObject<any>> => {
        return axiosClient.put(`${PREFIX}/cap-nhat-khach-hang`, data);
    }
};