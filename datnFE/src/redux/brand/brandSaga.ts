import type { PayloadAction } from "@reduxjs/toolkit";
import type { BrandPageParams, BrandRequest, BrandResponse } from "../../models/brand";
import brandApi from "../../api/brandApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { brandActions } from "./brandSlice";
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

function* handleFetch(action: PayloadAction<BrandPageParams>) {
  try {
    const response: PageResponse<BrandResponse> = yield call(
      brandApi.search,
      action.payload
    );
    yield put(brandActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(brandActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: BrandResponse = yield call(
      brandApi.getById,
      action.payload
    );
    yield put(brandActions.getBrandByIdSuccess(response));
  } catch (error: unknown) {
    yield put(brandActions.actionFailed(getErrorMessage(error)));
  }
}

interface BrandActionPayload {
  data: BrandRequest;
  onSuccess?: () => void;
}

function* handleBrandAction(action: PayloadAction<BrandActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<BrandResponse> = isUpdate
      ? yield call(brandApi.update, data.id ?? "", data)
      : yield call(brandApi.create, data);

    yield put(brandActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thương hiệu thành công" : "Thêm mới thương hiệu thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(brandActions.getAll({ page: 0, size: 10, keyword: "" }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(brandActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(brandApi.delete, action.payload);
    yield put(brandActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thương hiệu thành công",
    });
    yield put(brandActions.getAll({ page: 0, size: 10, keyword: "" }));
  } catch (error: unknown) {
    yield put(brandActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchBrandFlow() {
  yield takeLatest(brandActions.getAll.type, handleFetch);
  yield takeLatest(brandActions.getBrandById.type, handleGetById);
  yield takeLatest(
    [brandActions.addBrand.type, brandActions.updateBrand.type],
    handleBrandAction
  );
  yield takeLatest(brandActions.deleteBrand.type, handleDelete);
}
