import type { PayloadAction } from "@reduxjs/toolkit";
import type { TechSpecPageParams, TechSpecRequest, TechSpecResponse } from "../../models/techSpec";
import techSpecApi from "../../api/techSpecApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { techSpecActions } from "./techSpecSlice";
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

function* handleFetch(action: PayloadAction<TechSpecPageParams>) {
  try {
    const response: PageResponse<TechSpecResponse> = yield call(
      techSpecApi.search,
      action.payload
    );
    yield put(techSpecActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: TechSpecResponse = yield call(
      techSpecApi.getById,
      action.payload
    );
    yield put(techSpecActions.getTechSpecByIdSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecActions.actionFailed(getErrorMessage(error)));
  }
}

interface TechSpecActionPayload {
  data: TechSpecRequest;
  onSuccess?: () => void;
}

function* handleTechSpecAction(action: PayloadAction<TechSpecActionPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const isUpdate = !!data.id;

    const response: ResponseObject<TechSpecResponse> = isUpdate
      ? yield call(techSpecApi.update, data.id ?? "", data)
      : yield call(techSpecApi.create, data);

    yield put(techSpecActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thông số kỹ thuật thành công" : "Thêm mới thông số kỹ thuật thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }

    yield put(techSpecActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(techSpecActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(techSpecApi.delete, action.payload);
    yield put(techSpecActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thông số kỹ thuật thành công",
    });
    yield put(techSpecActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    yield put(techSpecActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchTechSpecFlow() {
  yield takeLatest(techSpecActions.getAll.type, handleFetch);
  yield takeLatest(techSpecActions.getTechSpecById.type, handleGetById);
  yield takeLatest(
    [techSpecActions.addTechSpec.type, techSpecActions.updateTechSpec.type],
    handleTechSpecAction
  );
  yield takeLatest(techSpecActions.deleteTechSpec.type, handleDelete);
}

