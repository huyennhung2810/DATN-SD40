import { call, put, takeLatest } from "redux-saga/effects";
import { storageCapacityApi } from "../../api/storageApi"; 
import { storageCapacityActions } from "./storageSlice"; 
import { notification } from "antd";
import type { StorageCapacityPageParams, StorageCapacityResponse } from "../../models/storage";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

// 1. Xử lý lấy danh sách Dung lượng (Kèm phân trang giả)
function* handleGetAll(action: PayloadAction<StorageCapacityPageParams>): Generator<any, any, any> {
    try {
        const res: any = yield call(storageCapacityApi.getAll, action.payload);
        
        // Bóc tách mảng từ field 'data' của JSON Backend trả về
        const fullList: StorageCapacityResponse[] = (res && res.data) ? res.data : [];

        // Logic phân trang giả tại Client
        const page = action.payload.page ?? 0;
        const size = action.payload.size ?? 10;
        const start = page * size;
        const end = start + size;
        const slicedList = fullList.slice(start, end);

        const mockPageResponse: PageResponse<StorageCapacityResponse> = {
            data: slicedList,             
            totalElements: fullList.length, 
            totalPages: Math.ceil(fullList.length / size),
            size: size,
            number: page
        };

        yield put(storageCapacityActions.fetchSuccess(mockPageResponse));
    } catch (error: any) {
        yield put(storageCapacityActions.actionFailed(error.message));
        notification.error({ message: "Lỗi", description: "Không thể lấy danh sách dung lượng" });
    }
}

// 2. Xử lý lấy chi tiết 1 Dung lượng
function* handleGetById(action: PayloadAction<string>): Generator<any, any, any> {
    try {
        const response: StorageCapacityResponse = yield call(storageCapacityApi.getStorageById, action.payload);
        yield put(storageCapacityActions.getStorageByIdSuccess(response));
    } catch (error: any) {
        yield put(storageCapacityActions.actionFailed(error.message));
        notification.error({ message: "Lỗi", description: "Không tìm thấy thông tin dung lượng" });
    }
}

// 3. Xử lý thêm mới
function* handleAddStorage(action: PayloadAction<any>): Generator<any, any, any> {
    try {
        const { data, navigate } = action.payload;
        yield call(storageCapacityApi.addStorage, data);
        yield put(storageCapacityActions.actionSuccess());
        notification.success({ message: "Thành công", description: "Thêm dung lượng thành công" });
        if (navigate) yield call(navigate);
    } catch (error: any) {
        yield put(storageCapacityActions.actionFailed(error.message));
        notification.error({ 
            message: "Thất bại", 
            description: error.response?.data?.message || "Thêm mới thất bại" 
        });
    }
}

// 4. Xử lý cập nhật
function* handleUpdateStorage(action: PayloadAction<any>): Generator<any, any, any> {
    try {
        const { id, data, navigate } = action.payload;
        yield call(storageCapacityApi.updateStorage, id, data);
        yield put(storageCapacityActions.actionSuccess());
        notification.success({ message: "Thành công", description: "Cập nhật thành công" });
        if (navigate) yield call(navigate);
    } catch (error: any) {
        yield put(storageCapacityActions.actionFailed(error.message));
        notification.error({ message: "Lỗi", description: "Cập nhật thất bại" });
    }
}

// 5. Xử lý đổi trạng thái
function* handleChangeStatus(action: PayloadAction<string>): Generator<any, any, any> {
    try {
        yield call(storageCapacityApi.changeStatusStorage, action.payload);
        yield put(storageCapacityActions.actionSuccess());
        notification.success({ message: "Thành công", description: "Đổi trạng thái thành công" });
    } catch (error: any) {
        yield put(storageCapacityActions.actionFailed(error.message));
        notification.error({ message: "Lỗi", description: "Đổi trạng thái thất bại" });
    }
}


export default function* watchStorageFlow(): Generator<any, any, any> {
    yield takeLatest(storageCapacityActions.getAll.type, handleGetAll);
    yield takeLatest(storageCapacityActions.getStorageById.type, handleGetById);
    yield takeLatest(storageCapacityActions.addStorage.type, handleAddStorage);
    yield takeLatest(storageCapacityActions.updateStorage.type, handleUpdateStorage);
    yield takeLatest(storageCapacityActions.changeStatusStorage.type, handleChangeStatus);
}