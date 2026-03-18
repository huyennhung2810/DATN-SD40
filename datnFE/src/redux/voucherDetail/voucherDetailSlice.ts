import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface VoucherDetailState {
    list: any[];
    totalElements: number;
    loading: boolean;
    error: string | null;
}

const initialState: VoucherDetailState = {
    list: [],
    totalElements: 0,
    loading: false,
    error: null,
};

const voucherDetailSlice = createSlice({
    name: "voucherDetail",
    initialState,
    reducers: {
        fetchVoucherDetailsRequest: (state, action: PayloadAction<{id: string, params: any}>) => {
            state.loading = true;
        },
        fetchVoucherDetailsSuccess: (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.list = action.payload.content;
            state.totalElements = action.payload.totalElements;
        },
        fetchVoucherDetailsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Action cho vô hiệu hóa
        disableCustomerVoucherRequest: (state, action: PayloadAction<any>) => {
            state.loading = true;
        },
        // Sau khi vô hiệu hóa thành công, cập nhật lại item trong list local
        disableCustomerVoucherSuccess: (state, action: PayloadAction<{customerId: string, reason: string}>) => {
            state.loading = false;
            const index = state.list.findIndex(item => item.customer.id === action.payload.customerId);
            if (index !== -1) {
                state.list[index].usageStatus = 2; // 2 là trạng thái Vô hiệu hóa
                state.list[index].reason = action.payload.reason;
            }
        },
    },
});

export const { 
    fetchVoucherDetailsRequest, fetchVoucherDetailsSuccess, fetchVoucherDetailsFailure,
    disableCustomerVoucherRequest, disableCustomerVoucherSuccess
} = voucherDetailSlice.actions;

export default voucherDetailSlice.reducer;