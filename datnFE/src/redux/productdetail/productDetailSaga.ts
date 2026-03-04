import type { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";

import { productDetailApi } from "../../api/productDetailApi";
import { productDetailActions } from "./productDetailSlice";

import type {
  ProductDetailPageParams,
  ProductDetailFormValues,
  ProductDetailResponse,
} from "../../models/productdetail";

import type { ResponseObject } from "../../models/base";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response: { data: { message?: string } } };
    return axiosError.response.data.message || "Lỗi kết nối Server!";
  }
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra, vui lòng thử lại!";
}

function* handleFetch(action: PayloadAction<ProductDetailPageParams>): Generator<any, any, any> {
  try {
    const response = yield call(productDetailApi.getAll, action.payload);
    yield put(productDetailActions.fetchSuccess(response)); 
  } catch (error) {
    yield put(productDetailActions.actionFailed("Lỗi kết nối!"));
  }
}

function* handleGetById(action: PayloadAction<{id: string, onSuccess?: any}>) {
  try {
    const { id, onSuccess } = action.payload;
    // Gọi API findById
    const response: ProductDetailResponse = yield call(productDetailApi.getById, id);
    
    // Lưu vào Store
    yield put(productDetailActions.getByIdSuccess(response));
    
    // GỌI CALLBACK ĐỂ ĐỔ DỮ LIỆU VÀO FORM
    if (onSuccess) {
      onSuccess(response);
    }
  } catch (error: any) {
    yield put(productDetailActions.actionFailed(error.message));
  }
}

function* handleAdd(
  action: PayloadAction<{
    data: ProductDetailFormValues;
    navigate?: () => void;
  }>
) {
  try {
    const { data, navigate } = action.payload;

    const response: ResponseObject<ProductDetailResponse> =
      yield call(productDetailApi.add, data);

    yield put(productDetailActions.actionSuccess());

    notification.success({
      message: "Thành công",
      description:
        response.message || "Thêm mới sản phẩm chi tiết thành công",
    });

    if (navigate) yield call(navigate);

    yield put(productDetailActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);

    yield put(productDetailActions.actionFailed(errorMsg));

    notification.error({
      message: "Thêm mới thất bại",
      description: errorMsg,
    });
  }
}

function* handleUpdate(
  action: PayloadAction<{
    id: string;
    data: ProductDetailFormValues;
    navigate?: () => void;
  }>
) {
  try {
    const { id, data, navigate } = action.payload;

    const response: ResponseObject<ProductDetailResponse> =
      yield call(productDetailApi.update, id, data);

    yield put(productDetailActions.actionSuccess());

    notification.success({
      message: "Thành công",
      description:
        response.message || "Cập nhật sản phẩm chi tiết thành công",
    });

    if (navigate) yield call(navigate);

    yield put(productDetailActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);

    yield put(productDetailActions.actionFailed(errorMsg));

    notification.error({
      message: "Cập nhật thất bại",
      description: errorMsg,
    });
  }
}

function* handleChangeStatus(
  action: PayloadAction<string>
) {
  try {
    yield call(productDetailApi.changeStatus, action.payload);

    yield put(productDetailActions.actionSuccess());

    notification.success({
      message: "Cập nhật",
      description: "Đã thay đổi trạng thái sản phẩm thành công",
    });

    yield put(productDetailActions.getAll({ page: 0, size: 10 }));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);

    yield put(productDetailActions.actionFailed(errorMsg));

    notification.error({
      message: "Lỗi",
      description: errorMsg,
    });
  }
}

function* handleExportExcel(
  action: PayloadAction<ProductDetailPageParams>
) {
  try {
    const blob: Blob = yield call(
      productDetailApi.exportExcel,
      action.payload
    );

    const fileName = `DS_SanPham_ChiTiet_${dayjs().format(
      "DDMMYYYY_HHmm"
    )}.xlsx`;

    yield call(saveAs, blob, fileName);

    yield put(productDetailActions.actionSuccess());
  } catch (error: unknown) {
    notification.error({
      message: "Lỗi xuất file",
      description: getErrorMessage(error),
    });
  }
}

export default function* watchProductDetailFlow() {
  yield takeLatest(productDetailActions.getAll.type, handleFetch);
  yield takeLatest(productDetailActions.add.type, handleAdd);
  yield takeLatest(productDetailActions.update.type, handleUpdate);
  yield takeLatest(productDetailActions.getById.type, handleGetById);
  yield takeLatest(
    productDetailActions.changeStatus.type,
    handleChangeStatus
  );
  yield takeLatest(
    productDetailActions.exportExcel.type,
    handleExportExcel
  );
}