import type { PayloadAction } from "@reduxjs/toolkit";
import type { TechSpecGroupSearchParams, TechSpecGroupRequest, TechSpecGroupResponse } from "../../models/techSpecGroup";
import { techSpecGroupApi } from "../../api/techSpecGroupApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { techSpecGroupActions } from "./techSpecGroupSlice";
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

function* handleFetch(action: PayloadAction<TechSpecGroupSearchParams>) {
  try {
    const response: PageResponse<TechSpecGroupResponse> = yield call(
      techSpecGroupApi.search,
      action.payload
    );
    yield put(techSpecGroupActions.fetchSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecGroupActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleGetById(action: PayloadAction<string>) {
  try {
    const response: TechSpecGroupResponse = yield call(
      techSpecGroupApi.getById,
      action.payload
    );
    yield put(techSpecGroupActions.getGroupByIdSuccess(response));
  } catch (error: unknown) {
    yield put(techSpecGroupActions.actionFailed(getErrorMessage(error)));
  }
}

interface GroupActionPayload {
  data: TechSpecGroupRequest;
  onSuccess?: () => void;
}

function* handleGroupAction(action: PayloadAction<GroupActionPayload | { id: string; data: TechSpecGroupRequest; onSuccess?: () => void }>) {
  try {
    const payload = action.payload;
    const isUpdate = "id" in payload && !!payload.id;
    const data = isUpdate ? (payload as { id: string; data: TechSpecGroupRequest; onSuccess?: () => void }).data : (payload as TechSpecGroupRequest);
    const onSuccess = "onSuccess" in payload ? (payload as { onSuccess?: () => void }).onSuccess : undefined;

    const response: ResponseObject<TechSpecGroupResponse> = isUpdate
      ? yield call(techSpecGroupApi.update, (payload as { id: string; data: TechSpecGroupRequest }).id, data)
      : yield call(techSpecGroupApi.create, data);

    yield put(techSpecGroupActions.actionSuccess());

    notification.success({
      title: "Thành công",
      description: response.message || (isUpdate ? "Cập nhật nhóm thông số thành công" : "Thêm mới nhóm thông số thành công"),
    });

    if (onSuccess) {
      yield call(onSuccess);
    }
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(techSpecGroupActions.actionFailed(errorMsg));
    notification.error({
      title: "Thao tác thất bại",
      description: errorMsg,
    });
  }
}

function* handleDelete(action: PayloadAction<string>) {
  try {
    yield call(techSpecGroupApi.delete, action.payload);
    yield put(techSpecGroupActions.actionSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa nhóm thông số thành công",
    });
    yield put(techSpecGroupActions.getAll({ page: 0, size: 100 }));
  } catch (error: unknown) {
    yield put(techSpecGroupActions.actionFailed(getErrorMessage(error)));
    notification.error({
      title: "Lỗi",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchTechSpecGroupFlow() {
  yield takeLatest(techSpecGroupActions.getAll.type, handleFetch);
  yield takeLatest(techSpecGroupActions.getGroupById.type, handleGetById);
  yield takeLatest(techSpecGroupActions.createGroup.type, handleGroupAction);
  yield takeLatest(techSpecGroupActions.updateGroup.type, handleGroupAction);
  yield takeLatest(techSpecGroupActions.deleteGroup.type, handleDelete);
}
