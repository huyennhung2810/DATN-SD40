import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CustomerPageParams, CustomerRequest, CustomerResponse } from "../../models/customer";
import type { PageResponse } from "../../models/base";


interface CustomerState {
  list: CustomerResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentCustomer: CustomerResponse | null; 
  filter: CustomerPageParams;
}


const initialState: CustomerState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentCustomer: null,
  filter: {
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  }
};


const customerSlice = createSlice ({
    name: "customer",
    initialState,
    reducers: {
        getAll: (state, action: PayloadAction<CustomerPageParams>) => {
            state.loading = true;
            state.error = null;
            state.filter = action.payload;
        },

        getCustomerById: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },

        getCustomerByIdSuccess: (state, action: PayloadAction<CustomerResponse>) => {
            state.loading = false;
            state.currentCustomer = action.payload;
        },

        addCustomer: (state, _action: PayloadAction<{ data: CustomerRequest; navigate: () => void }>) => {
            state.loading = true;
        },
       
        updateCustomer: (state, _action: PayloadAction<{ data: CustomerRequest; navigate: () => void }>) => {
            state.loading = true;
        },

        setCurrentCustomer: (state, action: PayloadAction<CustomerResponse | null>) => {
            state.currentCustomer = action.payload;
        },

        changeStatusCustomer: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },

        exportExcel: (state) => {
            state.loading = true;
        },

        //Action cập nhật state sau khi Saga xử lý xong
        fetchSuccess: (state, action: PayloadAction<PageResponse<CustomerResponse>>) => {
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

        resetCurrentCustomer: (state) => {
            state.currentCustomer = null;
            state.error = null;
        },
    },
});

export const customerActions = customerSlice.actions;
export default customerSlice.reducer;
