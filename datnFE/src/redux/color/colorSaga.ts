import { call, put, takeLatest } from "redux-saga/effects";
import { colorApi } from "../../api/colorApi"; // Đảm bảo đúng đường dẫn
import { colorActions } from "./colorSlice"; 
import { notification } from "antd";

// 1. Xử lý lấy danh sách Color
function* handleGetAll(action: any): Generator<any, any, any> {
    try {
        const response = yield call(colorApi.getAll, action.payload);
        yield put(colorActions.fetchSuccess(response));
    } catch (error: any) {
        yield put(colorActions.actionFailed(error.message));
        notification.error({ message: "Lỗi lấy danh sách màu sắc" });
    }
}

// 2. Xử lý lấy chi tiết 1 Color
function* handleGetById(action: any):Generator<any, any, any> {
    try {
        const response = yield call(colorApi.getColorById, action.payload);
        yield put(colorActions.getColorByIdSuccess(response));
    } catch (error: any) {
        yield put(colorActions.actionFailed(error.message));
        notification.error({ message: "Không tìm thấy thông tin màu sắc" });
    }
}

// 3. Xử lý thêm mới Color
function* handleAddColor(action: any) {
    try {
        const { data, navigate } = action.payload;
        yield call(colorApi.addColor, data);
        yield put(colorActions.actionSuccess());
        notification.success({ message: "Thêm màu sắc thành công" });
        if (navigate) navigate();
    } catch (error: any) {
        yield put(colorActions.actionFailed(error.message));
        notification.error({ message: "Thêm thất bại: " + error.response?.data?.message });
    }
}

// 4. Xử lý cập nhật Color
function* handleUpdateColor(action: any) {
    try {
        const { id, data, navigate } = action.payload;
        yield call(colorApi.updateColor, id, data);
        yield put(colorActions.actionSuccess());
        notification.success({ message: "Cập nhật màu sắc thành công" });
        if (navigate) navigate();
    } catch (error: any) {
        yield put(colorActions.actionFailed(error.message));
        notification.error({ message: "Cập nhật thất bại" });
    }
}

// 5. Xử lý đổi trạng thái
function* handleChangeStatus(action: any) {
    try {
        yield call(colorApi.changeStatusColor, action.payload);
        yield put(colorActions.actionSuccess());
        // Sau khi đổi trạng thái thì load lại danh sách (tùy logic của bạn)
        notification.success({ message: "Đổi trạng thái thành công" });
    } catch (error: any) {
        yield put(colorActions.actionFailed(error.message));
        notification.error({ message: "Đổi trạng thái thất bại" });
    }
}

// Watcher Saga: Lắng nghe các action từ Component
export default function* watchColorFlow() {
    yield takeLatest(colorActions.getAll.type, handleGetAll);
    yield takeLatest(colorActions.getColorById.type, handleGetById);
    yield takeLatest(colorActions.addColor.type, handleAddColor);
    yield takeLatest(colorActions.updateColor.type, handleUpdateColor);
    yield takeLatest(colorActions.changeStatusColor.type, handleChangeStatus);
}