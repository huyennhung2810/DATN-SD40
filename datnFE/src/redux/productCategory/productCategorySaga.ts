import type { PayloadAction } from "@reduxjs/toolkit";
import type { ProductCategoryPageParams, ProductCategoryRequest, ProductCategoryResponse } from "../../models/productCategory";
import productCategoryApi from "../../api/productCategoryApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { productCategoryActions } from "./productCategorySlice";
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

function* handleFetch(action: PayloadAction<ProductCategoryPageParams>) {
  try {
    const response: PageResponse<ProductCategoryResponse> = yield call(
      productCategoryApi.search,
      action.payload
    );
    yield put(productCategoryActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(productCategoryActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: ProductCategoryResponse = yield call(
      productCategoryApi.getById,
      action.payload
    );
    yield put(productCategoryActions.getCategoryByIdSuccess(response));
  } catch (error: unknown) {
    yield put(productCategoryActions.actionFailed(getErrorMessage(error)));
  }
}

interface CategoryActionPayload {
  data: ProductCategoryRequest;
  onSuccess?: () => void;
}

function* handleCategoryAction(action: PayloadAction<CategoryActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<ProductCategoryResponse> = isUpdate
      ? yield call(productCategoryApi.update, data.id ?? "", data)
      : yield call(productCategoryApi.create, data);

    yield put(productCategoryActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật danh mục thành công" : "Thêm mới danh mục thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(productCategoryActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(productCategoryActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(productCategoryApi.delete, action.payload);
    yield put(productCategoryActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa danh mục thành công",
    });
    yield put(productCategoryActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(productCategoryActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchProductCategoryFlow() {
  yield takeLatest(productCategoryActions.getAll.type, handleFetch);
  yield takeLatest(productCategoryActions.getCategoryById.type, handleGetById);
  yield takeLatest(
    [productCategoryActions.addCategory.type, productCategoryActions.updateCategory.type],
    handleCategoryAction
  );
  yield takeLatest(productCategoryActions.deleteCategory.type, handleDelete);
}

