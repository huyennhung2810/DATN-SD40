import type {  DashboardSummary, FilteredStat, GrowthStat, LowStockProduct, OrderStatusStat, RevenueStat, TopSellingProduct} from "../models/statistics";
import axiosClient from "./axiosClient";

export interface FilterParams {
  type: string;
  startDate?: number;
  endDate?: number;
}

const statisticsApi = {
    getOverview() {
        const url = '/admin/statistics/overview';
        return axiosClient.get<DashboardSummary>(url);
    },

    getOrderStatusStats(params: FilterParams) {
      const url = '/admin/statistics/order-status';
      return axiosClient.get<OrderStatusStat[]>(url, { params });
    },

    getRevenueStats(params: FilterParams) {
    const url = '/admin/statistics/revenue';
    return axiosClient.get<RevenueStat[]>(url, { params });
    },

    getFilteredStats(params: FilterParams) {
    const url = '/admin/statistics/filtered';
    return axiosClient.get<FilteredStat>(url, { params });
    },

    getGrowthStat() {
    const url = '/admin/statistics/growth';
    return axiosClient.get<GrowthStat>(url);
    },

    getTopSellingProduct(params: FilterParams) {
    const url = '/admin/statistics/top-selling';
    return axiosClient.get<TopSellingProduct>(url, {params});
    },
    
    getLowStockProducts() {
    const url = '/admin/statistics/low-stock';
    return axiosClient.get<LowStockProduct>(url);
    },


    exportAll: (startDate?: number, endDate?: number) => {
    return axiosClient.get("/admin/statistics/export-all", {
        params: { startDate, endDate },
        responseType: "blob",
    });
},
};

export default statisticsApi;