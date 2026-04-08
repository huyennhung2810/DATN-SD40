import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { 
    SerialPageParams, 
    SerialFormValues, 
    SerialResponse 
} from "../../models/serial";
import type { PageResponse } from "../../models/base";

interface SerialState {
    list: SerialResponse[];
    loading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentSerial: SerialResponse | null;
}

const initialState: SerialState = {
    list: [],
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentSerial: null,
};

const serialSlice = createSlice({
    name: "serial",
    initialState,
    reducers: {
        getAll: (state, _action: PayloadAction<SerialPageParams>) => {
            state.loading = true;
            state.error = null;
        },

        getSerialById: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },

        addSerial: (state, _action: PayloadAction<{ data: SerialFormValues; navigate?: () => void }>) => {
            state.loading = true;
        },
        
        updateSerial: (state, _action: PayloadAction<{ id: string; data: SerialFormValues; navigate?: () => void }>) => {
            state.loading = true;
        },

        changeStatusSerial: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },

        exportExcel: (state) => {
            state.loading = true;
        },

        
        fetchSuccess: (state, action: PayloadAction<any>) => { // Đổi thành any để linh hoạt check dữ liệu
            state.loading = false;
            
            // 1. Lấy mảng dữ liệu (Check xem nó nằm trong action.payload.data hay chính là action.payload)
            const rawData = action.payload.data || action.payload || [];
            
            // 2. Logic sắp xếp (Giữ nguyên của bạn)
            const sortedData = [...rawData].sort((a, b) => {
                const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
                const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
                return dateB - dateA;
            });

            state.list = sortedData;

            // 3. Cập nhật totalElements: 
            // Nếu API có trả về totalElements thì dùng, không thì lấy độ dài mảng data
            state.totalElements = action.payload.totalElements !== undefined 
                ? action.payload.totalElements 
                : sortedData.length;

            state.totalPages = action.payload.totalPages || 1;
        },

        getSerialByIdSuccess: (state, action: PayloadAction<SerialResponse>) => {
            state.loading = false;
            state.currentSerial = action.payload;
        },

        actionSuccess: (state) => {
            state.loading = false;
        },

        actionFailed: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        resetCurrentSerial: (state) => {
            state.currentSerial = null;
            state.error = null;
        },
    }
});

export const serialActions = serialSlice.actions;
export const serialReducer = serialSlice.reducer;
export default serialReducer;