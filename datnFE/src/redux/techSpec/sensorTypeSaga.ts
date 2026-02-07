import type { PayloadAction } from "@reduxjs/toolkit";
import type { SensorTypeSearchParams, SensorTypeRequest, SensorTypeResponse } from "../../api/sensorTypeApi";
import sensorTypeApi from "../../api/sensorTypeApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { sensorTypeActions } from "./sensorTypeSlice";
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

function* handleFetch(action: PayloadAction<SensorTypeSearchParams>) {
  try {
    const response: PageResponse<SensorTypeResponse> = yield call(
      sensorTypeApi.search,
      action.payload
    );
    yield put(sensorTypeActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(sensorTypeActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: SensorTypeResponse = yield call(
      sensorTypeApi.getById,
      action.payload
    );
    yield put(sensorTypeActions.getByIdSuccess(response));
  } catch (error: unknown) {
    yield put(sensorTypeActions.actionFailed(getErrorMessage(error)));
  }
}

interface ItemActionPayload {
  data: SensorTypeRequest;
  onSuccess?: () => void;
}

function* handleItemAction(action: PayloadAction<ItemActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<SensorTypeResponse> = isUpdate
      ? yield call(sensorTypeApi.update, data.id ?? "", data)
      : yield call(sensorTypeApi.create, data);

    yield put(sensorTypeActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(sensorTypeActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(sensorTypeActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(sensorTypeApi.delete, action.payload);
    yield put(sensorTypeActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thành công",
    });
    yield put(sensorTypeActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(sensorTypeActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchSensorTypeFlow() {
  yield takeLatest(sensorTypeActions.getAll.type, handleFetch);
  yield takeLatest(sensorTypeActions.getById.type, handleGetById);
  yield takeLatest(
    [sensorTypeActions.create.type, sensorTypeActions.update.type],
    handleItemAction
  );
  yield takeLatest(sensorTypeActions.delete.type, handleDelete);
}

