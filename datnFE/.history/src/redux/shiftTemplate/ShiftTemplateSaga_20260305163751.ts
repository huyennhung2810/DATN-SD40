import { call, put, takeLatest } from "redux-saga/effects";
import { type PayloadAction } from "@reduxjs/toolkit";
import { shiftTemplateActions } from "./shiftTemplateSlice";
import { shiftTemplateApi } from "../../api/shiftTemplateApi";
import { message } from "antd";
import type { ResponseObject } from "../../models/base";
import type { ADShiftTemplateResponse } from "../../models/shiftTemplate";

function* handleGetAll(action: PayloadAction<any>) {
    try {
        const response: ResponseObject<ADShiftTemplateResponse[]> = yield call(
            shiftTemplateApi.getAll, 
            action.payload
        );
        yield put(shiftTemplateActions.getAllSuccess(response.data));
    } catch (error: any) {
        console.error("error);
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

export default function* shiftTemplateSaga() {
    yield takeLatest(shiftTemplateActions.getAllRequest.type, handleGetAll);
    yield takeLatest(shiftTemplateActions.createRequest.type, handleCreate);
}