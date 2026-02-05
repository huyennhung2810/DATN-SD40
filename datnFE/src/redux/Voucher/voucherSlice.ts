import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Voucher } from '../../models/Voucher';

interface VoucherState {
    list: Voucher[];
    loading: boolean;
    totalElements: number;
    currentVoucher: Voucher | null; // Dùng cho trang Edit
}

const initialState: VoucherState = {
    list: [],
    loading: false,
    totalElements: 0,
    currentVoucher: null,
};

const voucherSlice = createSlice({
    name: 'voucher',
    initialState,
    reducers: {
        // --- Lấy danh sách ---
        fetchVouchersRequest: (state, _action: PayloadAction<any>) => {
            state.loading = true;
        },
        fetchVouchersSuccess: (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Khớp với ResponseObject: data { data: [], totalElements: ... }
            state.list = action.payload.data;
            state.totalElements = action.payload.totalElements;
        },
        fetchVouchersFailure: (state) => {
            state.loading = false;
        },

        // --- Thêm mới ---
        addVoucherRequest: (state, _action: PayloadAction<{ data: any; navigate: () => void }>) => {
            state.loading = true;
        },
        addVoucherSuccess: (state) => {
            state.loading = false;
        },

        // --- Cập nhật ---
        updateVoucherRequest: (state, _action: PayloadAction<{ data: any; navigate: () => void }>) => {
            state.loading = true;
        },
        updateVoucherSuccess: (state) => {
            state.loading = false;
        },

        // --- Lấy chi tiết (Dùng cho trang Edit) ---
        getVoucherByIdRequest: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },
        getVoucherByIdSuccess: (state, action: PayloadAction<Voucher>) => {
            state.loading = false;
            state.currentVoucher = action.payload;
        },

        // --- Xóa ---
        deleteVoucherRequest: (state, _action: PayloadAction<string>) => {
            state.loading = true;
        },
        deleteVoucherSuccess: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.list = state.list.filter(v => v.id !== action.payload);
            state.totalElements -= 1;
        },

        // --- Reset trạng thái ---
        resetCurrentVoucher: (state) => {
            state.currentVoucher = null;
        }
    },
});

export const { 
    fetchVouchersRequest, fetchVouchersSuccess, fetchVouchersFailure,
    addVoucherRequest, addVoucherSuccess,
    updateVoucherRequest, updateVoucherSuccess,
    getVoucherByIdRequest, getVoucherByIdSuccess,
    deleteVoucherRequest, deleteVoucherSuccess,
    resetCurrentVoucher
} = voucherSlice.actions;

export default voucherSlice.reducer;