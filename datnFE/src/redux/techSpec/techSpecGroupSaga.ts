import type { PayloadAction } from "@reduxjs/toolkit";
import type { TechSpecGroupSearchParams, TechSpecGroupRequest, TechSpecGroupResponse } from "../../models/techSpecGroup";
import { techSpecGroupApi } from "../../api/techSpecGroupApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { techSpecGroupActions } from "./techSpecGroupSlice";
import { notification } from "antd";
import type { PageResponse, ResponseObject } from "../../models/base";

function getErrorMessage(error: unknown): string {
  // Error từ axios interceptor đã là error.response.data (đã unwrapped)
  if (error && typeof error === "object" && !("response" in error)) {
    const data = error as { message?: string; messages?: string[] };
    if (data.messages && Array.isArray(data.messages)) {
      return data.messages.join(", ");
    }
    return data.message || "Lỗi kết nối Server!";
  }
  // Error từ axios gốc (khi interceptor không unwrap)
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response: { data: { message?: string; messages?: string[] } } };
    const resp = axiosError.response.data;
    if (resp.messages && Array.isArray(resp.messages)) {
      return resp.messages.join(", ");
    }
    return resp.message || "Lỗi kết nối Server!";
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
    console.log("[SAGA DEBUG] Full payload:", JSON.stringify(payload));
    const isUpdate = "id" in payload && !!payload.id;
    const data = isUpdate
      ? (payload as { id: string; data: TechSpecGroupRequest }).data
      : (payload as GroupActionPayload).data;
    const onSuccess = "onSuccess" in payload ? (payload as { onSuccess?: () => void }).onSuccess : undefined;
    console.log("[SAGA DEBUG] Parsed data:", JSON.stringify(data));

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
