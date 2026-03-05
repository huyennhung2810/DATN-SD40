import type { PayloadAction } from "@reduxjs/toolkit";
import type { LensMountSearchParams, LensMountRequest, LensMountResponse } from "../../api/lensMountApi";
import lensMountApi from "../../api/lensMountApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { lensMountActions } from "./lensMountSlice";
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

function* handleFetch(action: PayloadAction<LensMountSearchParams>) {
  try {
    const response: PageResponse<LensMountResponse> = yield call(
      lensMountApi.search,
      action.payload
    );
    yield put(lensMountActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(lensMountActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: LensMountResponse = yield call(
      lensMountApi.getById,
      action.payload
    );
    yield put(lensMountActions.getByIdSuccess(response));
  } catch (error: unknown) {
    yield put(lensMountActions.actionFailed(getErrorMessage(error)));
  }
}

interface ItemActionPayload {
  data: LensMountRequest;
  onSuccess?: () => void;
}

function* handleItemAction(action: PayloadAction<ItemActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<LensMountResponse> = isUpdate
      ? yield call(lensMountApi.update, data.id ?? "", data)
      : yield call(lensMountApi.create, data);

    yield put(lensMountActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(lensMountActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(lensMountActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(lensMountApi.delete, action.payload);
    yield put(lensMountActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thành công",
    });
    yield put(lensMountActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(lensMountActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchLensMountFlow() {
  yield takeLatest(lensMountActions.getAll.type, handleFetch);
  yield takeLatest(lensMountActions.getById.type, handleGetById);
  yield takeLatest(
    [lensMountActions.create.type, lensMountActions.update.type],
    handleItemAction
  );
  yield takeLatest(lensMountActions.delete.type, handleDelete);
}

