import type {  DashboardSummary} from "../models/statistics";
import axiosClient from "./axiosClient";

const statisticsApi = {
    getOverview(): Promise<DashboardSummary> {
        const url = '/admin/statistics/overview';
        return axiosClient.get(url);
    },
};

export default statisticsApi;