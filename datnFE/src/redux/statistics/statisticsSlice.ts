import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { 
    DashboardSummary, FilteredStat, GrowthStat, LowStockProduct, OrderStatusStat, 
    RevenueStat, TopSellingProduct
} from "../../models/statistics";
import type { FilterParams } from "../../api/statisticsApi";

interface StatisticsState {
    loading: boolean;
    summary: DashboardSummary | null;
    filteredStat: FilteredStat | null;
    revenueData: RevenueStat[];
    orderStatus: OrderStatusStat[];
    topSelling: TopSellingProduct[];
    lowStock: LowStockProduct[];
    growthStat: GrowthStat[];
    error: string | null;
}

const initialState: StatisticsState = {
    loading: false,
    summary: null,
    filteredStat: null,
    revenueData: [],
    orderStatus: [],
    topSelling: [],
    lowStock: [],
    growthStat: [],
    error: null,

};

const statisticsSlice = createSlice({
    name: "statistics",
    initialState,
    reducers: {
        fetchDashboardData(state, _action: PayloadAction<FilterParams>) {
            state.loading = true;
            state.error = null;
        },

        fetchDashboardDataSuccess(state, action: PayloadAction<{
            filteredStat: FilteredStat;
            revenueData: RevenueStat[];
            orderStatus: OrderStatusStat[];
            topSelling: TopSellingProduct[];
        }>) {
            state.loading = false;
            state.filteredStat = action.payload.filteredStat;
            state.revenueData = action.payload.revenueData;
            state.orderStatus = action.payload.orderStatus;
            state.topSelling = action.payload.topSelling;
        },

        fetchDashboardDataFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        
        fetchInitialData(state) {
            state.loading = true; 
        },
        
        fetchInitialDataSuccess(state, action: PayloadAction<{
            summary: DashboardSummary;
            lowStock: LowStockProduct[];
            growthStat: GrowthStat[];
        }>) {
            state.loading = false;
            state.summary = action.payload.summary;
            state.lowStock = action.payload.lowStock;
            state.growthStat = action.payload.growthStat;
        },
        fetchInitialDataFailure(state) {
            state.loading = false;
        }
    }
});

export const statisticsActions = statisticsSlice.actions;
export default statisticsSlice.reducer;