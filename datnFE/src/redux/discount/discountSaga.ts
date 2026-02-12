import { call, put, takeLatest } from "redux-saga/effects";
import discountApi from "../../api/discountApi";
import { message } from "antd";
import {
  fetchDiscountsRequest,
  fetchDiscountsSuccess,
  fetchDiscountsFailure,
  addDiscountRequest,
  addDiscountSuccess,
  addDiscountFailure,
  updateDiscountRequest,
  updateDiscountSuccess,
  getDiscountByIdRequest,
  getDiscountByIdSuccess,
  changeStatusDiscountRequest,
  changeStatusDiscountSuccess,
} from "./discountSlice";

// 1. Xử lý lấy danh sách đợt giảm giá
function* handleFetchDiscounts(action: any): any {
  try {
    const response = yield call(discountApi.getAll, action.payload);
    // Truyền toàn bộ response.data (chứa {status, data, message}) sang Slice
    yield put(fetchDiscountsSuccess(response.data)); 
  } catch (error) {
    yield put(fetchDiscountsFailure());
    message.error("Không thể tải danh sách giảm giá");
  }
}

// 2. Xử lý thêm mới đợt giảm giá
function* handleAddDiscount(action: any): any {
  try {
    // action.payload = { data: payload, navigate: function }
    const { data, navigate } = action.payload;
    const response = yield call(discountApi.add, data);

    if (response.status === 200 || response.status === 201) {
      yield put(addDiscountSuccess(response.data));
      message.success("Thêm mới chương trình giảm giá thành công");
      if (navigate) navigate();
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Lỗi khi thêm mới";
    yield put(addDiscountFailure(errorMessage));
    message.error(errorMessage);
  }
}

// 3. Xử lý lấy chi tiết đợt giảm giá (Sửa lỗi trang trắng khi Edit)
function* handleGetDiscountById(action: any): any {
  try {
    // action.payload lúc này là chuỗi ID từ URL
    const response = yield call(discountApi.getOne, action.payload);
    
    // Kiểm tra cấu trúc: response.data (body của axios) -> data (Object của Backend)
    // Nếu Postman trả về { "status": "OK", "data": { "id": "...", ... } }
    const result = response.data.data || response.data; 
    
    console.log("Dữ liệu chi tiết nhận được:", result); // Kiểm tra tại F12 Console

    yield put(getDiscountByIdSuccess(result));
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    message.error("Không thể lấy thông tin chi tiết đợt giảm giá");
  }
}

// 4. Xử lý cập nhật đợt giảm giá
function* handleUpdateDiscount(action: any): any {
  try {
    // action.payload = { id: string, data: payload, navigate: function }
    const { id, data, navigate } = action.payload;

    if (!id) {
        message.error("Thiếu mã định danh chương trình (ID)");
        return;
    }

    const response = yield call(discountApi.update, id, data);

    if (response.status === 200 || response.status === 204) {
      yield put(updateDiscountSuccess(response.data));
      message.success("Cập nhật chương trình giảm giá thành công");
      if (navigate) navigate();
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Lỗi khi cập nhật";
    message.error(errorMessage);
  }
}

// 5. Xử lý đổi trạng thái (Dừng chương trình)
function* handleChangeStatus(action: any): any {
  try {
    yield call(discountApi.changeStatus, action.payload);
    yield put(changeStatusDiscountSuccess(action.payload));
    message.success("Đã cập nhật trạng thái thành công");
    
    // Reload lại danh sách sau khi đổi trạng thái để đồng bộ UI
    yield put(fetchDiscountsRequest({ page: 0, size: 10 }));
  } catch (error) {
    message.error("Lỗi khi cập nhật trạng thái");
  }
}

// Đăng ký các handle với takeLatest
export function* discountSaga() {
  yield takeLatest(fetchDiscountsRequest.type, handleFetchDiscounts);
  yield takeLatest(addDiscountRequest.type, handleAddDiscount);
  yield takeLatest(getDiscountByIdRequest.type, handleGetDiscountById);
  yield takeLatest(changeStatusDiscountRequest.type, handleChangeStatus);
  yield takeLatest(updateDiscountRequest.type, handleUpdateDiscount); // Dòng này cực kỳ quan trọng
}