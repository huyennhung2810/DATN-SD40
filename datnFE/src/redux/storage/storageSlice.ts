import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";
import type { StorageCapacityFormValues, StorageCapacityPageParams, StorageCapacityResponse }from "../../models/storage";

// 1. Định nghĩa cấu trúc State cho Storage Capacity
interface StorageCapacityState {
    list: StorageCapacityResponse[];
    loading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentStorage: StorageCapacityResponse | null;
}

const initialState: StorageCapacityState = {
    list: [],
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentStorage: null,
};

const storageCapacitySlice = createSlice({
    name: "storageCapacity",
    initialState,
    reducers: {
        // Các Action kích hoạt Saga
        getAll: (state, _action: PayloadAction<StorageCapacityPageParams>) => {
            state.loading = true;
            state.error = null;
        },

        getStorageById: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },

        // Action Thêm mới
        addStorage: (state, _action: PayloadAction<{ data: StorageCapacityFormValues; navigate?: () => void }>) => {
            state.loading = true;
        },
        
        // Action Cập nhật
        updateStorage: (state, _action: PayloadAction<{ id: string; data: StorageCapacityFormValues; navigate?: () => void }>) => {
            state.loading = true;
        },

        // Đổi trạng thái
        changeStatusStorage: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },

        exportExcel: (state) => {
            state.loading = true;
        },

        // --- Các Action nhận dữ liệu từ Saga ---
        
        fetchSuccess: (state, action: PayloadAction<PageResponse<StorageCapacityResponse>>) => {
            state.loading = false;
            state.list = action.payload.data; 
            state.totalElements = action.payload.totalElements;
            state.totalPages = action.payload.totalPages;
        },

        getStorageByIdSuccess: (state, action: PayloadAction<StorageCapacityResponse>) => {
            state.loading = false;
            state.currentStorage = action.payload;
        },

        actionSuccess: (state) => {
            state.loading = false;
        },

        actionFailed: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Dọn dẹp dữ liệu cũ
        resetCurrentStorage: (state) => {
            state.currentStorage = null;
            state.error = null;
        },
    }
});



// Export Actions để UI và Saga sử dụng
export const storageCapacityActions = storageCapacitySlice.actions;

// Export Reducer để khai báo trong rootStore
export const storageCapacityReducer = storageCapacitySlice.reducer;

export default storageCapacityReducer;