import { call, put, takeLatest } from "redux-saga/effects";
import { voucherApi } from "../../api/voucherApi";

import {
  fetchVouchersSuccess,
  fetchVouchersFailure,
  fetchVouchersRequest,
  addVoucherRequest,
  addVoucherSuccess,
  updateVoucherRequest,
  updateVoucherSuccess,
  getVoucherByIdRequest,
  getVoucherByIdSuccess,
  deleteVoucherRequest,
  deleteVoucherSuccess,
  addVoucherFailure,
  stopVoucherSuccess,
  stopVoucherFailure,
  stopVoucherRequest,
} from "./voucherSlice";
import { message } from "antd"; // Hoặc App.useApp() tùy cấu trúc của bạn

// 1. Xử lý lấy danh sách
function* handleFetchVouchers(action: any): any {
  try {
    const response = yield call(voucherApi.getAll, action.payload);
    // Kiểm tra log xem dữ liệu thực tế nằm ở đâu: console.log(response.data)
    // Nếu Backend trả về { data: { data: [...], totalElements: 10 }, success: true }
    yield put(fetchVouchersSuccess(response.data.data));
  } catch (error) {
    yield put(fetchVouchersFailure());
  }
}

// 2. Xử lý thêm mới
function* handleAddVoucher(action: any): any {
  try {
    // Gửi dữ liệu lên Server
    const response = yield call(voucherApi.create, action.payload.data);

    if (response.status === 200 || response.status === 201) {
      // Cập nhật dữ liệu mới vào Redux Store (để validator bắt được trùng mã ngay)
      yield put(addVoucherSuccess(response.data));

      message.success("Thêm mới voucher thành công");

      // Chuyển hướng sau khi đã cập nhật Store thành công
      if (action.payload.navigate) {
        action.payload.navigate();
      }
    }
  } catch (error: any) {
    // Xử lý lỗi cụ thể từ Backend (ví dụ: lỗi trùng mã 400)
    const errorMessage =
      error.response?.data?.message || "Lỗi khi thêm mới voucher";

    yield put(addVoucherFailure(errorMessage)); // Dùng đúng hàm Failure của Add
    message.error(errorMessage);
  }
}

// 3. Xử lý cập nhật
function* handleUpdateVoucher(action: any): any {
  try {
    const response = yield call(
      voucherApi.update,
      action.payload.data.id,
      action.payload.data,
    );
    if (response.data) {
      yield put(updateVoucherSuccess());
      message.success("Cập nhật voucher thành công");
      action.payload.navigate();
    }
  } catch (error) {
    yield put(fetchVouchersFailure());
    message.error("Lỗi khi cập nhật voucher");
  }
}

// 4. Xử lý lấy chi tiết theo ID (để đổ dữ liệu vào Form khi Edit)
function* handleGetVoucherById(action: any): any {
  try {
    const response = yield call(voucherApi.getById, action.payload);
    const res = response.data;

    // Lấy đối tượng voucher gốc từ Page.content, .data hoặc chính nó
    let voucher = res?.content?.[0]?.voucher || res?.data || res;

    // Nếu dữ liệu trả về dạng Page, thực hiện gộp details từ danh sách content
    if (res?.content && Array.isArray(res.content)) {
      voucher = {
        ...voucher,
        details: res.content.map((item: any) => ({
          ...item,
          createdDate: item.created_date // Đồng bộ với Interface của bạn
        }))
      };
    }

    if (voucher?.id) {
      console.log("✅ Voucher Ready:", voucher);
      yield put(getVoucherByIdSuccess(voucher));
    } else {
      yield put(fetchVouchersFailure());
    }
  } catch (error) {
    console.error("❌ Get Voucher Error:", error);
    yield put(fetchVouchersFailure());
  }
}

// 5. Xử lý xóa
function* handleDeleteVoucher(action: any): any {
  try {
    yield call(voucherApi.delete, action.payload);
    yield put(deleteVoucherSuccess(action.payload));
    message.success("Xóa voucher thành công");
  } catch (error) {
    message.error("Lỗi khi xóa voucher");
  }
}
function* stopVoucherSaga(action: any) {
  try {
    // 1. Gọi API stop
    yield call(voucherApi.stop, action.payload);

    // 2. Thông báo thành công cho Redux
    yield put(stopVoucherSuccess(action.payload));

    // 3. Hiển thị thông báo cho người dùng
    message.success("Đã buộc dừng voucher thành công!");

    // 4. (Tùy chọn) Gọi lại danh sách để đảm bảo trạng thái đồng bộ hoàn toàn
    // yield put(fetchVouchersRequest({ page: 0, size: 10 }));
  } catch (error: any) {
    const errorMsg = error.response?.data || "Có lỗi xảy ra khi dừng voucher";
    yield put(stopVoucherFailure(errorMsg));
    message.error(errorMsg);
  }
}

// Root Voucher Saga
export function* voucherSaga() {
  yield takeLatest(fetchVouchersRequest.type, handleFetchVouchers);
  yield takeLatest(addVoucherRequest.type, handleAddVoucher);
  yield takeLatest(updateVoucherRequest.type, handleUpdateVoucher);
  yield takeLatest(getVoucherByIdRequest.type, handleGetVoucherById);
  yield takeLatest(deleteVoucherRequest.type, handleDeleteVoucher);
  yield takeLatest(stopVoucherRequest.type, stopVoucherSaga);
}
