import { createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type { DashboardSummary, EmployeeSales,  OrderDaily,  OrderStatusStatistics, TopSellingProduct } from "../../models/statistics";

interface StatisticsState {
    loading: boolean;
    summary: DashboardSummary | null;
    orderStatus: OrderStatusStatistics[];
    topProducts: TopSellingProduct[];
    dailyOrders: OrderDaily[];
    employeeSales: EmployeeSales[];
    topSellingProducts: TopSellingProduct[];
}

const initialState: StatisticsState = {
    loading: false,
    summary: null,
    orderStatus: [],
    topProducts: [],
    dailyOrders: [],
    employeeSales: [],
    topSellingProducts: []
};

const statisticsSlice = createSlice({
    name: "statistics",
    initialState,
    reducers: {
        fetchData(state, _action: PayloadAction<string>) {
            state.loading = true;
        },
        fetchDataSuccess(state, action: PayloadAction<{ summary: DashboardSummary, orderStatus: OrderStatusStatistics[], topProducts: TopSellingProduct[], dailyOrders: OrderDaily[], employeeSales: EmployeeSales[], topSellingProducts: TopSellingProduct[] }>) {
            state.loading = false;
            state.summary = action.payload.summary;
            state.orderStatus = action.payload.orderStatus;
            state.topProducts = action.payload.topProducts;
            state.dailyOrders = action.payload.dailyOrders;
            state.employeeSales = action.payload.employeeSales;
        },
        fetchDataError(state) {
            state.loading = false;
        },
        
    }
});

export const statisticsActions = statisticsSlice.actions;
export default statisticsSlice.reducer;