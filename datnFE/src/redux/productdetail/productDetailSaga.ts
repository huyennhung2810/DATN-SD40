import { call, put, takeLatest } from "redux-saga/effects";
import { productDetailActions } from "./productDetailSlice";
import productDetailApi from "../../api/productDetailApi";
import { notification } from "antd";

function* fetchAllSaga(action: any): any {
  try {
    const response = yield call(productDetailApi.getAll, action.payload);
    yield put(productDetailActions.fetchSuccess(response));
  } catch (error: any) {
    yield put(productDetailActions.actionFailed(error.message));
  }
}

// Bắt buộc phải có Saga này để gọi API Sản phẩm cha
function* fetchAllProductSaga(action: any): any {
  try {
    const response = yield call(productDetailApi.getAllProduct, action.payload);
    yield put(productDetailActions.getAllProductSuccess(response));
  } catch (error: any) {
    yield put(productDetailActions.actionFailed(error.message));
  }
}

function* getByIdSaga(action: any): any {
  try {
    const response = yield call(productDetailApi.getById, action.payload.id);
    yield put(productDetailActions.getByIdSuccess(response));
    if (action.payload.onSuccess) {
      action.payload.onSuccess(response);
    }
  } catch (error: any) {
    yield put(productDetailActions.actionFailed(error.message));
  }
}

function* addSaga(action: any): any {
  try {
    yield call(productDetailApi.add, action.payload.data);
    yield put(productDetailActions.actionSuccess());
    if (action.payload.navigate) action.payload.navigate();
  } catch (error: any) {
    yield put(productDetailActions.actionFailed(error.message));
    
    if (action.payload.onError) {
      action.payload.onError(error);
    } else {
      notification.error({ message: "Thêm mới thất bại!" });
    }
  }
}

function* updateSaga(action: any): any {
  try {
    yield call(productDetailApi.update, action.payload.id, action.payload.data);
    yield put(productDetailActions.actionSuccess());
    if (action.payload.navigate) action.payload.navigate();
  } catch (error: any) {
    yield put(productDetailActions.actionFailed(error.message));

    if (action.payload.onError) {
      action.payload.onError(error);
    } else {
      notification.error({ message: "Cập nhật thất bại!" });
    }
  }
}

export default function* productDetailSaga() {
  yield takeLatest(productDetailActions.getAll.type, fetchAllSaga);
  yield takeLatest(productDetailActions.getAllProduct.type, fetchAllProductSaga);
  yield takeLatest(productDetailActions.getById.type, getByIdSaga);
  yield takeLatest(productDetailActions.add.type, addSaga);
  yield takeLatest(productDetailActions.update.type, updateSaga);
}