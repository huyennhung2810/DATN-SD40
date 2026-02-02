import type { DashboardSummary, EmployeeSales, OrderDaily, OrderStatusStatistics, TopSellingProduct } from "../models/statistics";
import axiosClient from "./axiosClient";

const statisticsApi = {
    getSummary(params: { type: string }): Promise<DashboardSummary> {
        const url = '/admin/statistics/summary';
        return axiosClient.get(url, { params });
    },
    getOrderStatus(params: { type: string }): Promise<OrderStatusStatistics[]> {
        const url = '/admin/statistics/order-status';
        return axiosClient.get(url, { params });
    },
    getTopSelling(params: { type: string }): Promise<TopSellingProduct[]> {
        const url = '/admin/statistics/top-selling';
        return axiosClient.get(url, { params });
    },
    getDailyOrders(params: { type: string }): Promise<OrderDaily[]> {
        return axiosClient.get('/admin/statistics/daily-orders', { params });
    },
    getEmployeeSales(params: { type: string }): Promise<EmployeeSales[]> {
        return axiosClient.get('/admin/statistics/employee-sales', { params });
    }
};

export default statisticsApi;