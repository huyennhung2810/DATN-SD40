import { call, put, takeLatest } from 'redux-saga/effects';
import { voucherApi } from '../../api/voucherApi';
import { 
    fetchVouchersSuccess, 
    fetchVouchersFailure, 
    fetchVouchersRequest,
    addVoucherRequest,
    addVoucherSuccess,
    updateVoucherRequest,
    updateVoucherSuccess,
    getVoucherByIdRequest,
    getVoucherByIdSuccess,
    deleteVoucherRequest,
    deleteVoucherSuccess
} from './voucherSlice';
import { message } from 'antd'; // Hoặc App.useApp() tùy cấu trúc của bạn

// 1. Xử lý lấy danh sách
function* handleFetchVouchers(action: any): any {
    try {
        const response = yield call(voucherApi.getAll, action.payload);
        // Kiểm tra log xem dữ liệu thực tế nằm ở đâu: console.log(response.data)
        // Nếu Backend trả về { data: { data: [...], totalElements: 10 }, success: true }
        yield put(fetchVouchersSuccess(response.data.data)); 
    } catch (error) {
        yield put(fetchVouchersFailure());
    }
}

// 2. Xử lý thêm mới
function* handleAddVoucher(action: any): any {
    try {
        const response = yield call(voucherApi.create, action.payload.data);
        if (response.data) {
            yield put(addVoucherSuccess());
            message.success("Thêm mới voucher thành công");
            action.payload.navigate(); // Chuyển hướng về trang danh sách
        }
    } catch (error) {
        yield put(fetchVouchersFailure());
        message.error("Lỗi khi thêm mới voucher");
    }
}

// 3. Xử lý cập nhật
function* handleUpdateVoucher(action: any): any {
    try {
        const response = yield call(voucherApi.update, action.payload.data.id, action.payload.data);
        if (response.data) {
            yield put(updateVoucherSuccess());
            message.success("Cập nhật voucher thành công");
            action.payload.navigate();
        }
    } catch (error) {
        yield put(fetchVouchersFailure());
        message.error("Lỗi khi cập nhật voucher");
    }
}

// 4. Xử lý lấy chi tiết theo ID (để đổ dữ liệu vào Form khi Edit)
function* handleGetVoucherById(action: any): any {
    try {
        const response = yield call(voucherApi.getById, action.payload);
        yield put(getVoucherByIdSuccess(response.data.data));
    } catch (error) {
        yield put(fetchVouchersFailure());
    }
}

// 5. Xử lý xóa
function* handleDeleteVoucher(action: any): any {
    try {
        yield call(voucherApi.delete, action.payload);
        yield put(deleteVoucherSuccess(action.payload));
        message.success("Xóa voucher thành công");
    } catch (error) {
        message.error("Lỗi khi xóa voucher");
    }
}

// Root Voucher Saga
export function* voucherSaga() {
    yield takeLatest(fetchVouchersRequest.type, handleFetchVouchers);
    yield takeLatest(addVoucherRequest.type, handleAddVoucher);
    yield takeLatest(updateVoucherRequest.type, handleUpdateVoucher);
    yield takeLatest(getVoucherByIdRequest.type, handleGetVoucherById);
    yield takeLatest(deleteVoucherRequest.type, handleDeleteVoucher);
}