import type { PayloadAction } from "@reduxjs/toolkit";
import type { ImageFormatSearchParams, ImageFormatRequest, ImageFormatResponse } from "../../api/imageFormatApi";
import imageFormatApi from "../../api/imageFormatApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { imageFormatActions } from "./imageFormatSlice";
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

function* handleFetch(action: PayloadAction<ImageFormatSearchParams>) {
  try {
    const response: PageResponse<ImageFormatResponse> = yield call(
      imageFormatApi.search,
      action.payload
    );
    yield put(imageFormatActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(imageFormatActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: ImageFormatResponse = yield call(
      imageFormatApi.getById,
      action.payload
    );
    yield put(imageFormatActions.getByIdSuccess(response));
  } catch (error: unknown) {
    yield put(imageFormatActions.actionFailed(getErrorMessage(error)));
  }
}

interface ItemActionPayload {
  data: ImageFormatRequest;
  onSuccess?: () => void;
}

function* handleItemAction(action: PayloadAction<ItemActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<ImageFormatResponse> = isUpdate
      ? yield call(imageFormatApi.update, data.id ?? "", data)
      : yield call(imageFormatApi.create, data);

    yield put(imageFormatActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(imageFormatActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(imageFormatActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(imageFormatApi.delete, action.payload);
    yield put(imageFormatActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thành công",
    });
    yield put(imageFormatActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(imageFormatActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchImageFormatFlow() {
  yield takeLatest(imageFormatActions.getAll.type, handleFetch);
  yield takeLatest(imageFormatActions.getById.type, handleGetById);
  yield takeLatest(
    [imageFormatActions.create.type, imageFormatActions.update.type],
    handleItemAction
  );
  yield takeLatest(imageFormatActions.delete.type, handleDelete);
}

