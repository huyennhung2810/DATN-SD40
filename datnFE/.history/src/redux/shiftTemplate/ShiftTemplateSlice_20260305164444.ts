import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ADShiftTemplateResponse } from "../../models/shiftTemplate";

interface ShiftTemplateState {
    list: ADShiftTemplateResponse[];
    totalElements: number;
    isLoading: boolean;
}

const initialState: ShiftTemplateState = {
    list: [],
    totalElements: 0,
    isLoading: false,
};

const shiftTemplateSlice = createSlice({
    name: "shiftTemplate",
    initialState,
    reducers: {
        // Hành động lấy danh sách
        getAllRequest: (state, _action: PayloadAction<any>) => {
            state.isLoading = true;
        },
        getAllSuccess: (state, action: PayloadAction<ADShiftTemplateResponse[]>) => {
            state.isLoading = false;
            state.list = action.payload;
            state.totalElements = action.payload.length; // Giả định lấy từ mảng
        },
        getAllFailed: (state) => {
            state.isLoading = false;
        },

        // Hành động tạo mới
        createRequest: (state, _action: PayloadAction<any>) => {
            state.isLoading = true;
        },
        createSuccess: (state) => {
            state.isLoading = false;
        },
        createFailed: (state) => {
            state.isLoading = false;
        },


        changeStatusRequest: (state, _action: PayloadAction<string>) => {
            state.isLoading = true;
        },
        changeStatusSuccess: (state) => {
            state.isLoading = false;
        },
        changeStatusFailed: (state) => {
    state.isLoading = false;
}
    }
});

export const shiftTemplateActions = shiftTemplateSlice.actions;
export default shiftTemplateSlice.reducer;