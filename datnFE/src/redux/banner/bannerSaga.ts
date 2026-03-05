import type { PayloadAction } from "@reduxjs/toolkit";
import type { BannerPageParams, BannerRequest, BannerResponse } from "../../models/banner";
import bannerApi from "../../api/bannerApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { bannerActions } from "./bannerSlice";
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

function* handleFetch(action: PayloadAction<BannerPageParams>) {
  try {
    const response: PageResponse<BannerResponse> = yield call(
      bannerApi.search,
      action.payload
    );
    yield put(bannerActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(bannerActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: BannerResponse = yield call(
      bannerApi.getById,
      action.payload
    );
    yield put(bannerActions.getBannerByIdSuccess(response));
  } catch (error: unknown) {
    yield put(bannerActions.actionFailed(getErrorMessage(error)));
  }
}

interface BannerActionPayload {
  data: BannerRequest;
  onSuccess?: () => void;
}

function* handleBannerAction(action: PayloadAction<BannerActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<BannerResponse> = isUpdate
      ? yield call(bannerApi.update, data.id ?? "", data)
      : yield call(bannerApi.create, data);

    yield put(bannerActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật banner thành công" : "Thêm mới banner thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(bannerActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(bannerActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(bannerApi.delete, action.payload);
    yield put(bannerActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa banner thành công",
    });
    yield put(bannerActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(bannerActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchBannerFlow() {
  yield takeLatest(bannerActions.getAll.type, handleFetch);
  yield takeLatest(bannerActions.getBannerById.type, handleGetById);
  yield takeLatest(
    [bannerActions.addBanner.type, bannerActions.updateBanner.type],
    handleBannerAction
  );
  yield takeLatest(bannerActions.deleteBanner.type, handleDelete);
}

