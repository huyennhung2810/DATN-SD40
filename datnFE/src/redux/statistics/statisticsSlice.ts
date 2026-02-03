import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardSummary, GrowthStat, LowStockProduct, OrderStatusStat, RevenueStat, TopSellingProduct } from "../../models/statistics";

interface StatisticsState {
    loading: boolean;
    summary: DashboardSummary | null; 
    orderStatus: OrderStatusStat[];
    revenueData: RevenueStat[];
    lowStockProducts: LowStockProduct[];
    growthStat: GrowthStat[];
    topSelling: TopSellingProduct[];
}

const initialState: StatisticsState = {
    loading: false,
    summary: null,
    orderStatus: [],
    revenueData: [],
    lowStockProducts: [],
    growthStat: [],
    topSelling: [],
};

const statisticsSlice = createSlice({
    name: "statistics",
    initialState,
    reducers: {
        fetchData(state, _action: PayloadAction<string>) {
            state.loading = true;
        },
        
        fetchDataSuccess(state, action: PayloadAction<{ 
            summary: DashboardSummary; 
            orderStatus: OrderStatusStat[];
            revenueData: RevenueStat[];
            lowStockProducts: LowStockProduct[];
            growthStat: GrowthStat[];
            topSelling: TopSellingProduct[];
        }>) {
            state.loading = false;
            state.summary = action.payload.summary;
            state.orderStatus = action.payload.orderStatus;
            state.revenueData = action.payload.revenueData;
            state.lowStockProducts = action.payload.lowStockProducts;
            state.growthStat = action.payload.growthStat;
            state.topSelling = action.payload.topSelling;
        },
        
        fetchDataError(state) {
            state.loading = false;
        },
    }
});

export const statisticsActions = statisticsSlice.actions;
export default statisticsSlice.reducer;