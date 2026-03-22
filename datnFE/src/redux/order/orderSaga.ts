import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import type { 
    ADAssignSerialRequest, 
    ADChangeStatusRequest, 
    ADOrderSearchRequest, 
    ADUpdateCustomerRequest 
} from '../../models/order';
import { orderApi } from '../../api/admin/orderApi';
import { orderActions, type ActionPayload } from './OrderSlice';

//Lắng nghe Fetch List 
function* handleFetchOrders(action: PayloadAction<ADOrderSearchRequest>): Generator<any, void, any> {
    try {
        const response = yield call(orderApi.searchOrders, action.payload);
        
        if (response.data.success || response.data.isSuccess) {
            yield put(orderActions.fetchOrdersSuccess(response.data.data));
        } else {
            yield put(orderActions.fetchOrdersFailure(response.data.message || 'Lỗi lấy danh sách'));
        }
    } catch (error: any) {
        yield put(orderActions.fetchOrdersFailure(error.response?.data?.message || error.message));
    }
}

// Lắng nghe Fetch Detail 
function* handleFetchOrderDetail(action: PayloadAction<{ maHoaDon: string; page?: number; size?: number }>): Generator<any, void, any> {
    try {
        const { maHoaDon, page, size } = action.payload;
        const response = yield call(orderApi.getOrderDetails, maHoaDon, { page, size });
        
        if (response.data.success || response.data.isSuccess) {
            yield put(orderActions.fetchOrderDetailSuccess(response.data.data));
        } else {
            yield put(orderActions.fetchOrderDetailFailure(response.data.message || 'Lỗi lấy chi tiết'));
        }
    } catch (error: any) {
        yield put(orderActions.fetchOrderDetailFailure(error.response?.data?.message || error.message));
    }
}

//Lắng nghe Update Status
function* handleUpdateOrderStatus(action: PayloadAction<ActionPayload<ADChangeStatusRequest>>): Generator<any, void, any> {
    const { data, onSuccess, onError } = action.payload;
    try {
        const response = yield call(orderApi.updateOrderStatus, data);
        
        if (response.data.success || response.data.isSuccess) {
            yield put(orderActions.updateOrderStatusSuccess());
            
            // Gọi callback để Component hiển thị message.success()
            if (onSuccess) onSuccess(response.data.data);
            
            // Reload lại chi tiết hóa đơn
            yield put(orderActions.fetchOrderDetailRequest({ maHoaDon: data.maHoaDon }));
        } else {
            yield put(orderActions.updateOrderStatusFailure(response.data.message));
            if (onError) onError(response.data.message);
        }
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message;
        yield put(orderActions.updateOrderStatusFailure(errorMsg));
        if (onError) onError(errorMsg);
    }
}

// Lắng nghe Update Customer 
function* handleUpdateCustomerInfo(action: PayloadAction<ActionPayload<ADUpdateCustomerRequest>>): Generator<any, void, any> {
    const { data, onSuccess, onError } = action.payload;
    try {
        const response = yield call(orderApi.updateCustomerInfo, data);
        
        if (response.data.success || response.data.isSuccess) {
            yield put(orderActions.updateCustomerInfoSuccess());
            if (onSuccess) onSuccess();
            // Reload
            yield put(orderActions.fetchOrderDetailRequest({ maHoaDon: data.maHoaDon }));
        } else {
            yield put(orderActions.updateCustomerInfoFailure(response.data.message));
            if (onError) onError(response.data.message);
        }
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message;
        yield put(orderActions.updateCustomerInfoFailure(errorMsg));
        if (onError) onError(errorMsg);
    }
}

// Lắng nghe Assign Serial
function* handleAssignSerial(action: PayloadAction<ActionPayload<ADAssignSerialRequest>>): Generator<any, void, any> {
    const { data, onSuccess, onError } = action.payload;
    try {
        const response = yield call(orderApi.assignSerials, data);
        
        if (response.data.success || response.data.isSuccess) {
            yield put(orderActions.assignSerialSuccess());
            if (onSuccess) onSuccess();
        } else {
            yield put(orderActions.assignSerialFailure(response.data.message));
            if (onError) onError(response.data.message);
        }
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message;
        yield put(orderActions.assignSerialFailure(errorMsg));
        if (onError) onError(errorMsg);
    }
}

// Watcher Saga 
export default function* orderSaga(): Generator<any, void, any> {
    yield takeLatest(orderActions.fetchOrdersRequest.type, handleFetchOrders);
    yield takeLatest(orderActions.fetchOrderDetailRequest.type, handleFetchOrderDetail);
    yield takeLatest(orderActions.updateOrderStatusRequest.type, handleUpdateOrderStatus);
    yield takeLatest(orderActions.updateCustomerInfoRequest.type, handleUpdateCustomerInfo);
    yield takeLatest(orderActions.assignSerialRequest.type, handleAssignSerial);
}