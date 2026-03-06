import axiosInstance from "../../api/axiosClient";

export const orderApi = {
    searchOrders: (params: { status?: string, keyword?: string, page?: number, size?: number }) =>
        axiosInstance.get("/admin/orders", { params }),

    getOrderDetails: (id: string) =>
        axiosInstance.get(`/admin/orders/${id}`),

    updateOrderStatus: (id: string, status: string, note?: string) =>
        axiosInstance.put(`/admin/orders/${id}/status`, null, { params: { status, note } }),

    assignSerials: (id: string, detailId: string, serialNumbers: string[]) =>
        axiosInstance.post(`/admin/orders/${id}/details/${detailId}/assign-serials`, serialNumbers)
};
