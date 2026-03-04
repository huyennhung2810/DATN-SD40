import type { PayloadAction } from "@reduxjs/toolkit";
import type { ResolutionSearchParams, ResolutionRequest, ResolutionResponse } from "../../api/resolutionApi";
import resolutionApi from "../../api/resolutionApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { resolutionActions } from "./resolutionSlice";
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

function* handleFetch(action: PayloadAction<ResolutionSearchParams>) {
  try {
    const response: PageResponse<ResolutionResponse> = yield call(
      resolutionApi.search,
      action.payload
    );
    yield put(resolutionActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(resolutionActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: ResolutionResponse = yield call(
      resolutionApi.getById,
      action.payload
    );
    yield put(resolutionActions.getByIdSuccess(response));
  } catch (error: unknown) {
    yield put(resolutionActions.actionFailed(getErrorMessage(error)));
  }
}

interface ItemActionPayload {
  data: ResolutionRequest;
  onSuccess?: () => void;
}

function* handleItemAction(action: PayloadAction<ItemActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<ResolutionResponse> = isUpdate
      ? yield call(resolutionApi.update, data.id ?? "", data)
      : yield call(resolutionApi.create, data);

    yield put(resolutionActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(resolutionActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(resolutionActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(resolutionApi.delete, action.payload);
    yield put(resolutionActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thành công",
    });
    yield put(resolutionActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(resolutionActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchResolutionFlow() {
  yield takeLatest(resolutionActions.getAll.type, handleFetch);
  yield takeLatest(resolutionActions.getById.type, handleGetById);
  yield takeLatest(
    [resolutionActions.create.type, resolutionActions.update.type],
    handleItemAction
  );
  yield takeLatest(resolutionActions.delete.type, handleDelete);
}

