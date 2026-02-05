import { all, call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError, type AxiosResponse } from "axios";
import statisticsApi, { type FilterParams } from "../../api/statisticsApi";
import { statisticsActions } from "../../redux/statistics/statisticsSlice";
import type { 
    FilteredStat, RevenueStat, OrderStatusStat, 
    DashboardSummary, LowStockProduct, 
    TopSellingProduct,
    GrowthStat
} from "../../models/statistics";

function* handleFetchDashboardData(action: PayloadAction<FilterParams>) {
    try {
        const params = action.payload;

        const [filteredRes, revenueRes, orderStatusRes, topSellingRes]: [
            AxiosResponse<FilteredStat>,
            AxiosResponse<RevenueStat[]>,
            AxiosResponse<OrderStatusStat[]>,
            AxiosResponse<TopSellingProduct[]>
        ] = yield all([
            call(statisticsApi.getFilteredStats, params),
            call(statisticsApi.getRevenueStats, params),
            call(statisticsApi.getOrderStatusStats, params),
            call(statisticsApi.getTopSellingProduct, params)         
        ]);

        console.log("Dữ liệu Top Selling từ Server:", topSellingRes.data);
        yield put(statisticsActions.fetchDashboardDataSuccess({
            filteredStat: filteredRes.data,
            revenueData: revenueRes.data,
            orderStatus: orderStatusRes.data,
            topSelling : topSellingRes.data,
        }));

    } catch (error: unknown) {
        console.error("Lỗi tải thống kê dashboard:", error);
        let errorMessage = "Không thể tải dữ liệu thống kê";

        if (isAxiosError(error)) {
            if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                errorMessage = (error.response.data as { message: string }).message;
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        
        yield put(statisticsActions.fetchDashboardDataFailure(errorMessage));
    }
}

function* handleFetchInitialData() {
    try {
        const [summaryRes, lowStockRes, growthStatRes]: [
            AxiosResponse<DashboardSummary>,
            AxiosResponse<LowStockProduct[]>,
            AxiosResponse<GrowthStat[]>,
        ] = yield all([
             call(statisticsApi.getOverview),
             call(statisticsApi.getLowStockProducts),
             call(statisticsApi.getGrowthStat),
        ]);

        yield put(statisticsActions.fetchInitialDataSuccess({
            summary: summaryRes.data,
            lowStock: lowStockRes.data,
            growthStat: growthStatRes.data,
        }));
    } catch (error) {
        console.error("Lỗi tải overview/initial:", error);
        yield put(statisticsActions.fetchInitialDataFailure());
    }
}

// Watcher
export default function* statisticsSaga() {
    yield takeLatest(statisticsActions.fetchDashboardData.type, handleFetchDashboardData);
    yield takeLatest(statisticsActions.fetchInitialData.type, handleFetchInitialData);
}