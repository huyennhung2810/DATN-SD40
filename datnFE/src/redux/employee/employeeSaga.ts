import type { PayloadAction } from "@reduxjs/toolkit";
import type { EmployeePageParams, EmployeeRequest, EmployeeResponse} from "../../models/employee";
import employeeApi from "../../api/employeeApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { employeeActions } from "./employeeSlice";
import { notification } from "antd";
import dayjs from "dayjs";
import { saveAs } from 'file-saver';
import type { PageResponse, ResponseObject } from "../../models/base";


// Helper lấy message lỗi an toàn từ API
function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        return axiosError.response.data.message || "Lỗi kết nối Server!";
    }
    if (error instanceof Error) return error.message;
    return "Đã có lỗi xảy ra, vui lòng thử lại!";
}

//Lấy danh sách
function* handleFetch(action: PayloadAction<EmployeePageParams>) {
    try {
        const response: PageResponse<EmployeeResponse> = yield call(employeeApi.getAll, action.payload);
        yield put(employeeActions.fetchSuccess(response));
    } catch (error: unknown) {
        yield put(employeeActions.actionFailed(getErrorMessage(error)));
    }
}

// lấy chi tiết nhân viên theo ID
function* handleGetById(action: PayloadAction<string>) {
    try {
        const response: EmployeeResponse = yield call(employeeApi.getEmployeeById, action.payload);
        yield put(employeeActions.getEmployeeByIdSuccess(response));
    } catch (error: unknown) {
        yield put(employeeActions.actionFailed(getErrorMessage(error)));
    }
}

interface EmployeeActionPayload {
    data: EmployeeRequest;
    navigate: () => void;
}

function* handleEmployeeAction(action: PayloadAction<EmployeeActionPayload>) {
    try {
        const { data, navigate } = action.payload;
        const isUpdate = !!data.id;
        
        const response: ResponseObject<EmployeeResponse> = isUpdate 
            ? yield call(employeeApi.updateEmployee, data)
            : yield call(employeeApi.addEmployee, data);

        yield put(employeeActions.actionSuccess());
        
        notification.success({
            title: "Thành công",
            description: response.message || (isUpdate ? "Cập nhật nhân viên thành công" : "Thêm mới nhân viên thành công"),
        });

        // Chuyển trang nếu có hàm navigate truyền vào
        if (navigate) yield call(navigate); 
        
        // Load lại trang đầu tiên sau khi thao tác thành công
        yield put(employeeActions.getAll({ page: 0, size: 10 }));
    } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        yield put(employeeActions.actionFailed(errorMsg));
        notification.error({
            title: "Thao tác thất bại",
            description: errorMsg,
        });
    }
}

// Xử lý đổi trạng thái nhân viên
function* handleChangeStatus(action: PayloadAction<string>) {
    try {
        yield call(employeeApi.changeStatusEmployee, action.payload);
        yield put(employeeActions.actionSuccess());
        notification.success({ 
            title: "Cập nhật",
            description: "Đã thay đổi trạng thái nhân viên thành công" 
        });
        // Refresh danh sách
        yield put(employeeActions.getAll({ page: 0, size: 10 }));
    } catch (error: unknown) {
        yield put(employeeActions.actionFailed(getErrorMessage(error)));
        notification.error({
            title: "Lỗi",
            description: getErrorMessage(error)
        });
    }
}

function* handleExportExcel() {
    try {
        const blob: Blob = yield call(employeeApi.exportExcel);
        const fileName = `DS_Nhan_Vien_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`;
        yield call(saveAs, blob, fileName);
        yield put(employeeActions.actionSuccess());
    } catch (error: unknown) {
        notification.error({
            title: "Lỗi xuất file",
            description: getErrorMessage(error),
        });
    }
}

export default function* watchEmployeeFlow() {
    yield takeLatest(employeeActions.getAll.type, handleFetch);
    yield takeLatest(employeeActions.getEmployeeById.type, handleGetById);
    
    yield takeLatest(
        [employeeActions.addEmployee.type, employeeActions.updateEmployee.type], 
        handleEmployeeAction
    );
    
    yield takeLatest(employeeActions.changeStatusEmployee.type, handleChangeStatus);
    yield takeLatest(employeeActions.exportExcel.type, handleExportExcel);
}