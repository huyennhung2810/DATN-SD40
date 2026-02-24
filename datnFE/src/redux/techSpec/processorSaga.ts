import type { PayloadAction } from "@reduxjs/toolkit";
import type { ProcessorSearchParams, ProcessorRequest, ProcessorResponse } from "../../api/processorApi";
import processorApi from "../../api/processorApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { processorActions } from "./processorSlice";
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

function* handleFetch(action: PayloadAction<ProcessorSearchParams>) {
  try {
    const response: PageResponse<ProcessorResponse> = yield call(
      processorApi.search,
      action.payload
    );
    yield put(processorActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(processorActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: ProcessorResponse = yield call(
      processorApi.getById,
      action.payload
    );
    yield put(processorActions.getByIdSuccess(response));
  } catch (error: unknown) {
    yield put(processorActions.actionFailed(getErrorMessage(error)));
  }
}

interface ItemActionPayload {
  data: ProcessorRequest;
  onSuccess?: () => void;
}

function* handleItemAction(action: PayloadAction<ItemActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<ProcessorResponse> = isUpdate
      ? yield call(processorApi.update, data.id ?? "", data)
      : yield call(processorApi.create, data);

    yield put(processorActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(processorActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(processorActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(processorApi.delete, action.payload);
    yield put(processorActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thành công",
    });
    yield put(processorActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(processorActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchProcessorFlow() {
  yield takeLatest(processorActions.getAll.type, handleFetch);
  yield takeLatest(processorActions.getById.type, handleGetById);
  yield takeLatest(
    [processorActions.create.type, processorActions.update.type],
    handleItemAction
  );
  yield takeLatest(processorActions.delete.type, handleDelete);
}

