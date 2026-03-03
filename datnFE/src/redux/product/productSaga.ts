import type { PayloadAction } from "@reduxjs/toolkit";
import type { ProductPageParams, ProductRequest, ProductResponse } from "../../models/product";
import productApi from "../../api/productApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { productActions } from "./productSlice";
import { notification } from "antd";
import type { PageResponse, ResponseObject } from "../../models/base";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response: { data: { message?: string } } };
    return axiosError.response.data.message || "Lỗi kết nối Server!";
  }
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra, vui lòng thử lại!";
}

function* handleFetch(action: PayloadAction<ProductPageParams>) {
  try {
    const response: PageResponse<ProductResponse> = yield call(
      productApi.search,
      action.payload
    );
    yield put(productActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(productActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: ProductResponse = yield call(
      productApi.getById,
      action.payload
    );
    yield put(productActions.getProductByIdSuccess(response));
  } catch (error: unknown) {
    yield put(productActions.actionFailed(getErrorMessage(error)));
  }
}

interface ProductActionPayload {
  data: ProductRequest;
  onSuccess?: () => void;
}

function* handleProductAction(action: PayloadAction<ProductActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<ProductResponse> = isUpdate
      ? yield call(productApi.update, data.id ?? "", data)
      : yield call(productApi.create, data);

    yield put(productActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật sản phẩm thành công" : "Thêm mới sản phẩm thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(productActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(productActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(productApi.delete, action.payload);
    yield put(productActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa sản phẩm thành công",
    });
    yield put(productActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(productActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchProductFlow() {
  yield takeLatest(productActions.getAll.type, handleFetch);
  yield takeLatest(productActions.getProductById.type, handleGetById);
  yield takeLatest(
    [productActions.addProduct.type, productActions.updateProduct.type],
    handleProductAction
  );
  yield takeLatest(productActions.deleteProduct.type, handleDelete);
}

