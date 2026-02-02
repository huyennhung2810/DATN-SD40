import type { CustomerPageParams, CustomerRequest, CustomerResponse} from "../../models/customer";
import { customerApi} from "../../api/customerApi";
import { customerActions } from "./customerSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { saveAs } from 'file-saver';
import dayjs from "dayjs";
import { call, put, select, takeLatest } from "redux-saga/effects";
import type { PageResponse, ResponseObject } from "../../models/base";
import { notification } from "antd";
import type { RootState } from "../store";

const selectCustomerFilter = (state: RootState) => state.customer.filter;


// Helper lấy message lỗi an toàn
function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        return axiosError.response.data.message || "Lỗi kết nối Server!";
    }
    if (error instanceof Error) return error.message;
    return "Đã có lỗi xảy ra, vui lòng thử lại!";
}

//Xử lý lấy danh sách
function* handleFetch(action: PayloadAction<CustomerPageParams>) {
    try {
        const response: PageResponse<CustomerResponse> = yield call(customerApi.getAll, action.payload);
        yield put(customerActions.fetchSuccess(response));
    } catch (error: unknown) {
        yield put(customerActions.actionFailed(getErrorMessage(error)));
    }
}

function* handleGetById(action: PayloadAction<string>) {
    try {
        const response: CustomerResponse = yield call(customerApi.getCustomerById, action.payload);
        yield put(customerActions.getCustomerByIdSuccess(response));
    } catch (error: unknown) {
        yield put(customerActions.actionFailed(getErrorMessage(error)));
    }
}

interface CustomerActionPayload {
    data: CustomerRequest;
    navigate: () => void;
}

//Thêm/ sửa
function* handleCustomerAction(action: PayloadAction<CustomerActionPayload>) {
    try {
        const { data, navigate } = action.payload;
        const isUpdate = !!data.id;
        
        const response: ResponseObject<CustomerResponse> = isUpdate 
            ? yield call(customerApi.updateCustomer, data)
            : yield call(customerApi.addCustomer, data);

        yield put(customerActions.actionSuccess());
        
        notification.success({
            title: "Thành công",
            description: response.message || (isUpdate ? "Cập nhật thành công" : "Thêm mới thành công"),
        });

        if (navigate) yield call(navigate); 
        
        const currentFilter: CustomerPageParams = yield select(selectCustomerFilter);

        yield put(customerActions.getAll(currentFilter));
    } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        yield put(customerActions.actionFailed(errorMsg));
        notification.error({
            title: "Thao tác thất bại",
            description: errorMsg,
        });
    }
}


function* handleChangeStatus(action: PayloadAction<string>) {
    try {
        yield call(customerApi.changeStatusCustomer, action.payload);
        yield put(customerActions.actionSuccess());
        notification.success({ 
            title: "Cập nhật",
            description: "Đã thay đổi trạng thái khách hàng thành công" 
        });

        const currentFilter: CustomerPageParams = yield select(selectCustomerFilter);

        yield put(customerActions.getAll( currentFilter ));
    } catch (error: unknown) {
        yield put(customerActions.actionFailed(getErrorMessage(error)));
    }
}

function* handleExportExcel() {
    try {
        const blob: Blob = yield call(customerApi.exportExcel);
        const fileName = `DS_Khach_Hang_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`;
        yield call(saveAs, blob, fileName);
        yield put(customerActions.actionSuccess());
    } catch (error: unknown) {
        notification.error({
            title: "Lỗi xuất file",
            description: getErrorMessage(error),
        });
    }
}

export default function* watchCustomerFlow() {
    yield takeLatest(customerActions.getAll.type, handleFetch);
    yield takeLatest(customerActions.getCustomerById.type, handleGetById); // Watcher mới
    yield takeLatest(
        [customerActions.addCustomer.type, customerActions.updateCustomer.type], 
        handleCustomerAction
    );
    yield takeLatest(customerActions.changeStatusCustomer.type, handleChangeStatus);
    yield takeLatest(customerActions.exportExcel.type, handleExportExcel);
}