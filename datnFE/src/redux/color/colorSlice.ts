import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { 
    ColorPageParams, 
    ColorFormValues, 
    ColorResponse 
} from "../../models/color";
import type { PageResponse } from "../../models/base";

// 1. Định nghĩa cấu trúc State cho Color
interface ColorState {
    list: ColorResponse[];
    loading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentColor: ColorResponse | null;
}

const initialState: ColorState = {
    list: [],
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentColor: null,
};

const colorSlice = createSlice({
    name: "color",
    initialState,
    reducers: {
        // Các Action kích hoạt Saga (Bắt đầu Loading)
        getAll: (state, _action: PayloadAction<ColorPageParams>) => {
            state.loading = true;
            state.error = null;
        },

        getColorById: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },

        // Action Thêm mới Color
        addColor: (state, _action: PayloadAction<{ data: ColorFormValues; navigate?: () => void }>) => {
            state.loading = true;
        },
        
        // Action Cập nhật Color
        updateColor: (state, _action: PayloadAction<{ id: string; data: ColorFormValues; navigate?: () => void }>) => {
            state.loading = true;
        },

        // Đổi trạng thái (Hoạt động/Ngừng hoạt động)
        changeStatusColor: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },

        exportExcel: (state) => {
            state.loading = true;
        },

        // --- Các Action nhận dữ liệu từ Saga khi thành công ---
        
        fetchSuccess: (state, action: PayloadAction<PageResponse<ColorResponse>>) => {
            state.loading = false;
            state.list = action.payload.data; 
            state.totalElements = action.payload.totalElements;
            state.totalPages = action.payload.totalPages;
        },

        getColorByIdSuccess: (state, action: PayloadAction<ColorResponse>) => {
            state.loading = false;
            state.currentColor = action.payload;
        },

        actionSuccess: (state) => {
            state.loading = false;
        },

        actionFailed: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Dọn dẹp dữ liệu cũ (Dùng khi đóng Modal/Rời trang)
        resetCurrentColor: (state) => {
            state.currentColor = null;
            state.error = null;
        },
    }
});

// Export Actions để UI và Saga sử dụng: colorActions.getAll(...)
export const colorActions = colorSlice.actions;

// Export Reducer để khai báo trong rootStore: color: colorReducer
export const colorReducer = colorSlice.reducer;

export default colorReducer;