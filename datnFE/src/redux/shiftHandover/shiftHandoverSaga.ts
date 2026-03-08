import { call, put, takeLatest } from "redux-saga/effects";
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

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function* handleCheckIn(action: PayloadAction<CheckInRequest>) {
  try {
    // CẢI TIẾN: Sử dụng 'as' để ép kiểu an toàn cho kết quả từ yield call
    const response = (yield call(
      shiftHandoverApi.checkIn, 
      action.payload
    )) as ResponseObject<ShiftHandoverResponse>;
    
    // Gửi dữ liệu vào Store
    yield put(shiftActions.checkInSuccess(response.data));
    message.success("Check-in nhận ca thành công!");
    
  } catch (error: unknown) {
    const err = error as ApiError;
    yield put(shiftActions.checkInFailed());
    message.error(err.response?.data?.message || err.message || "Lỗi Check-in");
  }
}

function* handleCheckOut(action: PayloadAction<CheckOutRequest>) {
  try {
    yield call(shiftHandoverApi.checkOut, action.payload);
    yield put(shiftActions.checkOutSuccess());
    message.success("Kết ca thành công. Hẹn gặp lại!");
    
    // Đợi 1.5s để người dùng đọc thông báo rồi đẩy về trang Đăng nhập
    setTimeout(() => {
      window.location.href = '/login'; 
    }, 1500);

  } catch (error: unknown) {
    const err = error as ApiError;
    yield put(shiftActions.checkOutFailed());
    message.error(err.response?.data?.message || err.message || "Lỗi khi kết ca");
  }
}

// Watcher
export default function* shiftHandoverSaga() {
  yield takeLatest(shiftActions.checkInRequest.type, handleCheckIn);
  yield takeLatest(shiftActions.checkOutRequest.type, handleCheckOut);
}