import { call, put, takeLatest, delay } from "redux-saga/effects";
import { type PayloadAction } from "@reduxjs/toolkit";
import { shiftActions } from "./shiftHandoverSlice";
import { shiftHandoverApi } from "../../api/shiftHandoverApi";
import { message } from "antd";
import type { 
  CheckInRequest, 
  CheckOutRequest, 
  ShiftHandoverResponse 
} from "../../models/shiftHandover";
import type { ResponseObject } from "../../models/base";

function* handleCheckIn(action: PayloadAction<CheckInRequest>) {
  try {
    const response: ResponseObject<ShiftHandoverResponse> = yield call(
      shiftHandoverApi.checkIn, 
      action.payload
    );
    
    yield put(shiftActions.checkInSuccess(response.data));
    message.success("Check-in nhận ca thành công!");
    
  } catch (error: any) {
    yield put(shiftActions.checkInFailed());
    const msg = error.response?.data?.message || "Lỗi Check-in hệ thống";
    message.error(msg);
  }
}

function* handleCheckOut(action: PayloadAction<CheckOutRequest>) {
  try {
    const response: ResponseObject<ShiftHandoverResponse> = yield call(
      shiftHandoverApi.checkOut, 
      action.payload
    );
    
    const status = response.data.handoverStatus;
    yield put(shiftActions.checkOutSuccess());

    // Thông báo dựa trên trạng thái chênh lệch tiền từ Backend
    if (status === 'PENDING') {
      message.warning("Kết ca thành công nhưng có chênh lệch tiền. Đang chờ duyệt!");
    } else {
      message.success("Kết ca thành công. Hệ thống đã đóng ca!");
    }

    yield delay(1500);
    
    // Điều hướng về trang quản lý giao ca (nếu đang ở nơi khác)
    window.location.href = "/shift-handover"; 

  } catch (error: any) {
    yield put(shiftActions.checkOutFailed());
    const msg = error.response?.data?.message || "Lỗi khi kết ca";
    message.error(msg);
  }
}

export default function* shiftHandoverSaga() {
  yield takeLatest(shiftActions.checkInRequest.type, handleCheckIn);
  yield takeLatest(shiftActions.checkOutRequest.type, handleCheckOut);
}