import type { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import dayjs from "dayjs";
import { saveAs } from 'file-saver';

import serialApi from "../../api/serialApi"; 
import { serialActions } from "./serialSlice";
import type { 
    SerialPageParams, 
    SerialFormValues, 
    SerialResponse 
} from "../../models/serial";
import type { PageResponse, ResponseObject } from "../../models/base";

function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        return axiosError.response.data.message || "Lỗi kết nối Server!";
    }
    if (error instanceof Error) return error.message;
    return "Đã có lỗi xảy ra, vui lòng thử lại!";
}

// 1. Lấy danh sách Serial (Phân trang)
function* handleFetch(action: PayloadAction<SerialPageParams>): Generator<any, any, any>{
    try {
        const res: any = yield call(serialApi.getAll, action.payload);
        
        // 1. Lấy toàn bộ mảng 12 phần tử từ BE
        const fullList: SerialResponse[] = Array.isArray(res) ? res : (res?.data || []);

        // 2. Lấy thông số phân trang từ UI gửi lên (ví dụ: page 0, size 10)
        const page = action.payload.page ?? 0;
        const size = action.payload.size ?? 10;

        // 3. Logic cắt mảng:
        // Trang 0: lấy từ 0 đến 10
        // Trang 1: lấy từ 10 đến 20 (thực tế chỉ còn 2 cái nên lấy đến 12)
        const start = page * size;
        const end = start + size;
        const slicedList = fullList.slice(start, end);

        // 4. Đóng gói Mock Response
        const mockPageResponse: PageResponse<SerialResponse> = {
            data: slicedList,             // CHỈ gửi phần dữ liệu của trang hiện tại
            totalElements: fullList.length, // VẪN báo tổng là 12 để Pagination hiện 2 trang
            totalPages: Math.ceil(fullList.length / size),
            size: size,
            number: page
        };
        
        yield put(serialActions.fetchSuccess(mockPageResponse));
    } catch (error: any) {
        yield put(serialActions.actionFailed("Lỗi bóc tách dữ liệu"));
    }
}

// 2. Lấy chi tiết Serial theo ID
function* handleGetById(action: PayloadAction<string>) {
    try {
        const response: SerialResponse = yield call(serialApi.getSerialById, action.payload);
        yield put(serialActions.getSerialByIdSuccess(response));
    } catch (error: unknown) {
        yield put(serialActions.actionFailed(getErrorMessage(error)));
    }
}

function* handleAddSerial(action: PayloadAction<{ data: SerialFormValues; navigate?: () => void }>): Generator<any, any, any> {
    try {
        const { data, navigate } = action.payload;
        // Gọi API Add
        const response: ResponseObject<SerialResponse> = yield call(serialApi.addSerial, data);

        yield put(serialActions.actionSuccess());
        
        notification.success({
            message: "Thành công",
            description: response.message || "Thêm mới Serial thành công",
        });

        // Điều hướng nếu có
        if (navigate) yield call(navigate); 
        
        // Refresh lại danh sách
        yield put(serialActions.getAll({ page: 0, size: 10 }));
    } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        yield put(serialActions.actionFailed(errorMsg));
        notification.error({
            message: "Thêm mới thất bại",
            description: errorMsg,
        });
    }
}

function* handleUpdateSerial(action: PayloadAction<{ id: string; data: SerialFormValues; navigate?: () => void }>): Generator<any, any, any> {
    try {
        const { id, data, navigate } = action.payload;
        // Gọi API Update (truyền cả id và data)
        const response: ResponseObject<SerialResponse> = yield call(serialApi.updateSerial, id, data);

        yield put(serialActions.actionSuccess());
        
        notification.success({
            message: "Thành công",
            description: response.message || "Cập nhật Serial thành công",
        });

        if (navigate) yield call(navigate); 
        
        yield put(serialActions.getAll({ page: 0, size: 10 }));
    } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        yield put(serialActions.actionFailed(errorMsg));
        notification.error({
            message: "Cập nhật thất bại",
            description: errorMsg,
        });
    }
}

// 4. Đổi trạng thái Serial (Trong kho <-> Đã bán)
function* handleChangeStatus(action: PayloadAction<string>) {
    try {
        yield call(serialApi.changeStatusSerial, action.payload);
        yield put(serialActions.actionSuccess());
        notification.success({ 
            message: "Cập nhật",
            description: "Đã thay đổi trạng thái Serial thành công" 
        });
        yield put(serialActions.getAll({ page: 0, size: 10 }));
    } catch (error: unknown) {
        yield put(serialActions.actionFailed(getErrorMessage(error)));
        notification.error({
            message: "Lỗi",
            description: getErrorMessage(error)
        });
    }
}

// 5. Xuất Excel Serial
function* handleExportExcel() {
    try {
        const blob: Blob = yield call(serialApi.exportExcel);
        const fileName = `DS_Serial_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`;
        yield call(saveAs, blob, fileName);
        yield put(serialActions.actionSuccess());
    } catch (error: unknown) {
        notification.error({
            message: "Lỗi xuất file",
            description: getErrorMessage(error),
        });
    }
}

// Watcher: Lắng nghe các actions
export default function* watchSerialFlow() {
    yield takeLatest(serialActions.getAll.type, handleFetch);
    yield takeLatest(serialActions.getSerialById.type, handleGetById);
    yield takeLatest(serialActions.addSerial.type, handleAddSerial);
    yield takeLatest(serialActions.updateSerial.type, handleUpdateSerial);
    yield takeLatest(serialActions.changeStatusSerial.type, handleChangeStatus);
    yield takeLatest(serialActions.exportExcel.type, handleExportExcel);
}