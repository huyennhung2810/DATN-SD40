import type { EmployeePageParams, EmployeeRequest, EmployeeResponse } from "../../models/employee";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface EmployeeState {
    list: EmployeeResponse[];
    loading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentEmployee: EmployeeResponse | null;
}

const initialState: EmployeeState = {
    list: [],
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentEmployee: null,
};

const employeeSlice = createSlice ({
    name: "employee",
    initialState,
    reducers: {
        getAll: (state, _action: PayloadAction<EmployeePageParams>) => {
            state.loading = true;
            state.error = null;
        },

        getEmployeeById: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },

        getEmployeeByIdSuccess: (state, action: PayloadAction<EmployeeResponse>) => {
            state.loading = false;
            state.currentEmployee = action.payload;
        },

        addEmployee: (state, _action: PayloadAction<{ data: EmployeeRequest; navigate: () => void }>) => {
            state.loading = true;
        },
       
        updateEmployee: (state, _action: PayloadAction<{ data: EmployeeRequest; navigate: () => void }>) => {
            state.loading = true;
        },

        setCurrentEmployee: (state, action: PayloadAction<EmployeeResponse | null>) => {
            state.currentEmployee = action.payload;
        },

        changeStatusEmployee: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },

        exportExcel: (state) => {
            state.loading = true;
        },


        // Action cập nhật state sau khi Saga xử lý thành công
        fetchSuccess: (state, action: PayloadAction<PageResponse<EmployeeResponse>>) => {
            state.loading = false;
            state.list = action.payload.data; 
            state.totalElements = action.payload.totalElements;
            state.totalPages = action.payload.totalPages;
            state.error = null;
        },  

        actionSuccess: (state) => {
            state.loading = false;
            state.error = null;
        },

        actionFailed: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        resetCurrentEmployee: (state) => {
            state.currentEmployee = null;
            state.error = null;
        },
    }
});

export const employeeActions = employeeSlice.actions;
export const employeeReducer = employeeSlice.reducer;
export default employeeReducer;