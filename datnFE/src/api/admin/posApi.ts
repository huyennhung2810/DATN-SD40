import axiosInstance from "../../api/axiosClient";

export const posApi = {
    createOrder: () => axiosInstance.post("/admin/pos/orders"),
    getPendingOrders: () => axiosInstance.get("/admin/pos/orders"),
    getOrderDetails: (orderId: string) => axiosInstance.get(`/admin/pos/orders/${orderId}`),
    addProductToOrder: (orderId: string, productDetailId: string, quantity: number = 1) =>
        axiosInstance.post(`/admin/pos/orders/${orderId}/add-product`, null, { params: { productDetailId, quantity } }),
    assignSerialsToOrderDetail: (orderId: string, detailId: string, serialNumbers: string[]) =>
        axiosInstance.post(`/admin/pos/orders/${orderId}/details/${detailId}/assign-serials`, serialNumbers),
    removeProductFromOrder: (orderId: string, detailId: string) =>
        axiosInstance.delete(`/admin/pos/orders/${orderId}/details/${detailId}/remove-product`),
    removeSerialFromOrderDetail: (orderId: string, detailId: string, serialNumber: string) =>
        axiosInstance.delete(`/admin/pos/orders/${orderId}/details/${detailId}/remove-serial`, { params: { serialNumber } }),
    setCustomer: (orderId: string, customerId: string) =>
        axiosInstance.put(`/admin/pos/orders/${orderId}/customer`, null, { params: { customerId } }),
    checkout: (orderId: string) => axiosInstance.post(`/admin/pos/orders/${orderId}/checkout`),
    cancelOrder: (orderId: string) => axiosInstance.delete(`/admin/pos/orders/${orderId}`),
    getAvailableSerials: (productDetailId: string) =>
        axiosInstance.get(`/admin/pos/orders/available-serials`, { params: { productDetailId } }),
    getApplicableVouchers: (orderTotal: number) =>
        axiosInstance.get(`/admin/pos/orders/applicable-vouchers`, { params: { orderTotal } }),
    applyVoucher: (orderId: string, voucherId: string) =>
        axiosInstance.post(`/admin/pos/orders/${orderId}/apply-voucher`, null, { params: { voucherId } }),
    removeVoucher: (orderId: string) =>
        axiosInstance.delete(`/admin/pos/orders/${orderId}/remove-voucher`),
};
