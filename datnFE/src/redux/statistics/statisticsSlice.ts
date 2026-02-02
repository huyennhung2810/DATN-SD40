import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardSummary } from "../../models/statistics";

interface StatisticsState {
    loading: boolean;
    summary: DashboardSummary | null; 
}

const initialState: StatisticsState = {
    loading: false,
    summary: null,
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

        }>) {
            state.loading = false;
            state.summary = action.payload.summary;
    
        },
        
        fetchDataError(state) {
            state.loading = false;
        },
    }
});

export const statisticsActions = statisticsSlice.actions;
export default statisticsSlice.reducer;