import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ADAssignSerialRequest, ADChangeStatusRequest, ADOrderSearchRequest, ADUpdateCustomerRequest, OrderDetailPageResponse, OrderPageResponse } from '../../models/order';


// Cấu trúc State của Order
interface OrderState {
    ordersData: OrderPageResponse | null;
    orderDetailData: OrderDetailPageResponse | null;
    isLoadingList: boolean;
    isLoadingDetail: boolean;
    isActionLoading: boolean; 
    error: string | null;
}

const initialState: OrderState = {
    ordersData: null,
    orderDetailData: null,
    isLoadingList: false,
    isLoadingDetail: false,
    isActionLoading: false,
    error: null,
};

export interface ActionPayload<T> {
    data: T;
    onSuccess?: (resData?: any) => void;
    onError?: (errorMsg: string) => void;
}

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        //list
        fetchOrdersRequest(state, _action: PayloadAction<ADOrderSearchRequest>) {
            state.isLoadingList = true;
            state.error = null;
        },
        fetchOrdersSuccess(state, action: PayloadAction<OrderPageResponse>) {
            state.isLoadingList = false;
            state.ordersData = action.payload;
        },
        fetchOrdersFailure(state, action: PayloadAction<string>) {
            state.isLoadingList = false;
            state.error = action.payload;
        },

        //detail
        fetchOrderDetailRequest(state, _action: PayloadAction<{ maHoaDon: string; page?: number; size?: number }>) {
            state.isLoadingDetail = true;
            state.error = null;
        },
        fetchOrderDetailSuccess(state, action: PayloadAction<OrderDetailPageResponse>) {
            state.isLoadingDetail = false;
            state.orderDetailData = action.payload;
        },
        fetchOrderDetailFailure(state, action: PayloadAction<string>) {
            state.isLoadingDetail = false;
            state.error = action.payload;
        },

        // update status
        updateOrderStatusRequest(state, _action: PayloadAction<ActionPayload<ADChangeStatusRequest>>) {
            state.isActionLoading = true;
        },
        updateOrderStatusSuccess(state) {
            state.isActionLoading = false;
        },
        updateOrderStatusFailure(state, action: PayloadAction<string>) {
            state.isActionLoading = false;
            state.error = action.payload;
        },

        // update kh
        updateCustomerInfoRequest(state, _action: PayloadAction<ActionPayload<ADUpdateCustomerRequest>>) {
            state.isActionLoading = true;
        },
        updateCustomerInfoSuccess(state) {
            state.isActionLoading = false;
        },
        updateCustomerInfoFailure(state, action: PayloadAction<string>) {
            state.isActionLoading = false;
            state.error = action.payload;
        },

        // doi serial
        assignSerialRequest(state, _action: PayloadAction<ActionPayload<ADAssignSerialRequest>>) {
            state.isActionLoading = true;
        },
        assignSerialSuccess(state) {
            state.isActionLoading = false;
        },
        assignSerialFailure(state, action: PayloadAction<string>) {
            state.isActionLoading = false;
            state.error = action.payload;
        }
    },
});

export const orderActions = orderSlice.actions;
export default orderSlice.reducer;