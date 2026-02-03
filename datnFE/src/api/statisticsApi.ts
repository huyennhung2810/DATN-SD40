import type {  DashboardSummary} from "../models/statistics";
import axiosClient from "./axiosClient";

const statisticsApi = {
    getOverview(): Promise<DashboardSummary> {
        const url = '/admin/statistics/overview';
        return axiosClient.get(url);
    },

    getOrderStatusStats(type: string) {
        const url = '/admin/statistics/order-status';
        return axiosClient.get(url, { params: { type } });
    },
    getRevenueStats(type: string) {
    const url = '/admin/statistics/revenue';
    return axiosClient.get(url, { params: { type } });
    },
    getLowStockProducts(type: string) {
    const url = '/admin/statistics/low-stock';
    return axiosClient.get(url, { params: { type } });
    },

    getGrowthStat(type: string) {
    const url = '/admin/statistics/growth';
    return axiosClient.get(url, { params: { type } });
    },

    getTopSelling(type: string) {
    const url = '/admin/statistics/top-selling';
    return axiosClient.get(url, { params: { type } });
    },
};

export default statisticsApi;