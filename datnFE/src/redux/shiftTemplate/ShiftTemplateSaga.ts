import { call, put, takeLatest } from "redux-saga/effects";
import { type PayloadAction } from "@reduxjs/toolkit";
import { shiftTemplateApi } from "../../api/shiftTemplateApi";
import { message } from "antd";
import type { ResponseObject } from "../../models/base";
import type { ADShiftTemplateResponse } from "../../models/shiftTemplate";
import { shiftTemplateActions } from "./ShiftTemplateSlice";

function* handleGetAll(action: PayloadAction<any>) {
    try {
        const response: ResponseObject<ADShiftTemplateResponse[]> = yield call(
            shiftTemplateApi.getAll, 
            action.payload
        );
        yield put(shiftTemplateActions.getAllSuccess(response.data));
    } catch (error: any) {
        console.error("error", error);
        yield put(shiftTemplateActions.getAllFailed());
        message.error("Không thể tải danh sách ca làm việc");
    }
}

function* handleCreate(action: PayloadAction<any>) {
    try {
        yield call(shiftTemplateApi.create, action.payload);
        yield put(shiftTemplateActions.createSuccess());
        message.success("Tạo ca làm việc mẫu thành công!");
        // Refresh lại danh sách sau khi tạo
        yield put(shiftTemplateActions.getAllRequest({})); 
    } catch (error: any) {
        yield put(shiftTemplateActions.createFailed());
        message.error(error.response?.data?.message || "Lỗi khi tạo ca làm việc");
    }
}

function* handleUpdate(action: PayloadAction<any>) {
    try {
        const { id, ...payload } = action.payload;
        yield call(shiftTemplateApi.update, id, payload);
        
        yield put(shiftTemplateActions.updateSuccess());
        message.success("Cập nhật thông tin ca thành công!");
        
        yield put(shiftTemplateActions.getAllRequest({})); 
    } catch (error: any) {
        yield put(shiftTemplateActions.updateFailed());
        message.error(error.response?.data?.message || "Lỗi khi cập nhật ca làm việc");
    }
}

function* handleChangeStatus(action: PayloadAction<string>) {
    try {
        yield call(shiftTemplateApi.changeStatus, action.payload);
        yield put(shiftTemplateActions.changeStatusSuccess());
        message.success("Cập nhật trạng thái ca làm việc thành công!");
        // Refresh lại danh sách
        yield put(shiftTemplateActions.getAllRequest({})); 
    } catch (error: any) {
        yield put(shiftTemplateActions.changeStatusFailed());
        message.error(error.response?.data?.message || "Không thể đổi trạng thái");
    }
}

export default function* shiftTemplateSaga() {
    yield takeLatest(shiftTemplateActions.getAllRequest.type, handleGetAll);
    yield takeLatest(shiftTemplateActions.createRequest.type, handleCreate);
    yield takeLatest(shiftTemplateActions.changeStatusRequest.type, handleChangeStatus);
    yield takeLatest(shiftTemplateActions.updateRequest.type, handleUpdate);
}