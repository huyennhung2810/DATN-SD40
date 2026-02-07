import type { PayloadAction } from "@reduxjs/toolkit";
import type { VideoFormatSearchParams, VideoFormatRequest, VideoFormatResponse } from "../../api/videoFormatApi";
import videoFormatApi from "../../api/videoFormatApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { videoFormatActions } from "./videoFormatSlice";
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

function* handleFetch(action: PayloadAction<VideoFormatSearchParams>) {
  try {
    const response: PageResponse<VideoFormatResponse> = yield call(
      videoFormatApi.search,
      action.payload
    );
    yield put(videoFormatActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(videoFormatActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: VideoFormatResponse = yield call(
      videoFormatApi.getById,
      action.payload
    );
    yield put(videoFormatActions.getByIdSuccess(response));
  } catch (error: unknown) {
    yield put(videoFormatActions.actionFailed(getErrorMessage(error)));
  }
}

interface ItemActionPayload {
  data: VideoFormatRequest;
  onSuccess?: () => void;
}

function* handleItemAction(action: PayloadAction<ItemActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<VideoFormatResponse> = isUpdate
      ? yield call(videoFormatApi.update, data.id ?? "", data)
      : yield call(videoFormatApi.create, data);

    yield put(videoFormatActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(videoFormatActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(videoFormatActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(videoFormatApi.delete, action.payload);
    yield put(videoFormatActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thành công",
    });
    yield put(videoFormatActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(videoFormatActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchVideoFormatFlow() {
  yield takeLatest(videoFormatActions.getAll.type, handleFetch);
  yield takeLatest(videoFormatActions.getById.type, handleGetById);
  yield takeLatest(
    [videoFormatActions.create.type, videoFormatActions.update.type],
    handleItemAction
  );
  yield takeLatest(videoFormatActions.delete.type, handleDelete);
}

