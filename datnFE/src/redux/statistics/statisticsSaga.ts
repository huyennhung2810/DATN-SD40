import { all, call, put, takeLatest } from "redux-saga/effects";
import { statisticsActions } from "./statisticsSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import type { AxiosResponse } from "axios";
import statisticsApi from "../../api/statisticsApi";
import type { DashboardSummary, GrowthStat, LowStockProduct, OrderStatusStat, RevenueStat, TopSellingProduct } from "../../models/statistics";

function* handleFetchData(action: PayloadAction<string>): SagaIterator {
    try {
        const [summaryRes, orderStatusRes, revenueRes, lowStockProductsRes, growthStatRes, topSellingRes]: [
            AxiosResponse<DashboardSummary>, 
            AxiosResponse<OrderStatusStat[]>,
            AxiosResponse<RevenueStat[]>,
            AxiosResponse<LowStockProduct[]>,
            AxiosResponse<GrowthStat[]>,
            AxiosResponse<TopSellingProduct[]>,
        ] = yield all([
            call(statisticsApi.getOverview),
            call(statisticsApi.getOrderStatusStats, action.payload),
            call(statisticsApi.getRevenueStats, action.payload),
            call(statisticsApi.getLowStockProducts, action.payload),
            call(statisticsApi.getGrowthStat, action.payload),
            call(statisticsApi.getTopSelling, action.payload),
        ]);

        yield put(
            statisticsActions.fetchDataSuccess({
                summary: summaryRes.data,
                orderStatus: orderStatusRes.data,
                revenueData: revenueRes.data,
                lowStockProducts: lowStockProductsRes.data,
                growthStat : growthStatRes.data,
                topSelling: topSellingRes.data,
            })
        );
    } catch (error) {
        console.error("Error fetching statistics data:", error);
        yield put(statisticsActions.fetchDataError());
    }
}

export default function* statisticsSaga(): SagaIterator {
    yield takeLatest(statisticsActions.fetchData.type, handleFetchData);
}