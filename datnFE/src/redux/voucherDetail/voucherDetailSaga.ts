import { call, put, takeLatest } from "redux-saga/effects";
import {type PayloadAction } from "@reduxjs/toolkit";
import { voucherDetailApi } from "../../api/voucherDetailApi";
import { 
    fetchVoucherDetailsRequest, fetchVoucherDetailsSuccess, fetchVoucherDetailsFailure,
    disableCustomerVoucherRequest, disableCustomerVoucherSuccess 
} from "./voucherDetailSlice";
import { message } from "antd";

function* fetchVoucherDetailsSaga(action: PayloadAction<{id: string, params: any}>) {
    try {
        // Ép kiểu ngay tại dòng call
        const response: { data: any } = yield (call as any)(voucherDetailApi.getByVoucher, action.payload.id, action.payload.params);
        
        yield put(fetchVoucherDetailsSuccess(response.data));
    } catch (error: any) {
        yield put(fetchVoucherDetailsFailure(error.message));
    }
}

function* disableVoucherSaga(action: PayloadAction<any>) {
    try {
        yield call(voucherDetailApi.disable, action.payload);
        yield put(disableCustomerVoucherSuccess({
            customerId: action.payload.customerId,
            reason: action.payload.reason
        }));
        message.success("Đã vô hiệu hóa voucher của khách hàng!");
    } catch (error: any) {
        message.error(error.response?.data || "Lỗi khi vô hiệu hóa");
    }
}

export default function* voucherDetailSaga() {
    yield takeLatest(fetchVoucherDetailsRequest.type, fetchVoucherDetailsSaga);
    yield takeLatest(disableCustomerVoucherRequest.type, disableVoucherSaga);
}