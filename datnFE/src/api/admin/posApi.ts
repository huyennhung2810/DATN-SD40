import axiosInstance from "../../api/axiosClient";

export const posApi = {
    createOrder: () => axiosInstance.post("/admin/pos/orders"),
    getPendingOrders: () => axiosInstance.get("/admin/pos/orders"),
    getOrderDetails: (orderId: string) => axiosInstance.get(`/admin/pos/orders/${orderId}`),
    addSerialToOrder: (orderId: string, serialNumber: string) =>
        axiosInstance.post(`/admin/pos/orders/${orderId}/add-serial`, null, { params: { serialNumber } }),
    removeSerialFromOrder: (orderId: string, serialNumber: string) =>
        axiosInstance.delete(`/admin/pos/orders/${orderId}/remove-serial`, { params: { serialNumber } }),
    setCustomer: (orderId: string, customerId: string) =>
        axiosInstance.put(`/admin/pos/orders/${orderId}/customer`, null, { params: { customerId } }),
    checkout: (orderId: string) => axiosInstance.post(`/admin/pos/orders/${orderId}/checkout`),
};
