import type { PayloadAction } from "@reduxjs/toolkit";
import type { TechSpecDefinitionSearchParams, TechSpecDefinitionRequest, TechSpecDefinitionResponse } from "../../models/techSpecGroup";
import { techSpecDefinitionApi } from "../../api/techSpecGroupApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { techSpecDefinitionActions } from "./techSpecDefinitionSlice";
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

function* handleFetch(action: PayloadAction<TechSpecDefinitionSearchParams>) {
  try {
    const response: PageResponse<TechSpecDefinitionResponse> = yield call(
      techSpecDefinitionApi.search,
      action.payload
    );
    yield put(techSpecDefinitionActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecDefinitionActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetAllActive() {
  try {
    const response: TechSpecDefinitionResponse[] = yield call(techSpecDefinitionApi.getAllActive);
    yield put(techSpecDefinitionActions.getAllActiveDefinitionsSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecDefinitionActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: TechSpecDefinitionResponse = yield call(
      techSpecDefinitionApi.getById,
      action.payload
    );
    yield put(techSpecDefinitionActions.getDefinitionByIdSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecDefinitionActions.actionFailed(getErrorMessage(error)));
  }
}

interface DefinitionActionPayload {
  data: TechSpecDefinitionRequest;
  onSuccess?: () => void;
}

function* handleDefinitionAction(
  action: PayloadAction<DefinitionActionPayload | { id: string; data: TechSpecDefinitionRequest; onSuccess?: () => void }>
) {
  try {
    const payload = action.payload;
    const isUpdate = "id" in payload && !!payload.id;
    const data = isUpdate
      ? (payload as { id: string; data: TechSpecDefinitionRequest }).data
      : (payload as TechSpecDefinitionRequest);
    const onSuccess = "onSuccess" in payload ? (payload as { onSuccess?: () => void }).onSuccess : undefined;

    const response: ResponseObject<TechSpecDefinitionResponse> = isUpdate
      ? yield call(techSpecDefinitionApi.update, (payload as { id: string; data: TechSpecDefinitionRequest }).id, data)
      : yield call(techSpecDefinitionApi.create, data);

    yield put(techSpecDefinitionActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật thông số kỹ thuật thành công" : "Thêm mới thông số kỹ thuật thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(techSpecDefinitionActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(techSpecDefinitionApi.delete, action.payload);
    yield put(techSpecDefinitionActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa thông số kỹ thuật thành công",
    });
  } catch (error: unknown) {
    yield put(techSpecDefinitionActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchTechSpecDefinitionFlow() {
  yield takeLatest(techSpecDefinitionActions.getAll.type, handleFetch);
  yield takeLatest(techSpecDefinitionActions.getAllActiveDefinitions.type, handleGetAllActive);
  yield takeLatest(techSpecDefinitionActions.getDefinitionById.type, handleGetById);
  yield takeLatest(techSpecDefinitionActions.createDefinition.type, handleDefinitionAction);
  yield takeLatest(techSpecDefinitionActions.updateDefinition.type, handleDefinitionAction);
  yield takeLatest(techSpecDefinitionActions.deleteDefinition.type, handleDelete);
}
