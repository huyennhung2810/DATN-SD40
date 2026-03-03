import type { PayloadAction } from "@reduxjs/toolkit";
import productImageApi from "../../api/productImageApi";
import { call, put, takeLatest } from "redux-saga/effects";
import { productImageActions } from "./productImageSlice";
import { notification } from "antd";
import type { ProductImageResponse } from "../../models/productImage";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response: { data: { message?: string } } };
    return axiosError.response.data.message || "Lỗi kết nối Server!";
  }
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra, vui lòng thử lại!";
}

function* handleGetImagesByProduct(action: PayloadAction<string>) {
  try {
    const response: ProductImageResponse[] = yield call(
      productImageApi.listByProduct,
      action.payload
    );
    yield put(productImageActions.getImagesByProductSuccess(response));
  } catch (error: unknown) {
    yield put(productImageActions.actionFailed(getErrorMessage(error)));
  }
}

function* handleUploadImage(action: PayloadAction<{ productId: string; file: File }>) {
  try {
    const { productId, file } = action.payload;
    yield call(productImageApi.upload, productId, file);
    yield put(productImageActions.uploadImageSuccess());
    notification.success({
      title: "Thành công",
      description: "Tải ảnh lên thành công",
    });
    yield put(productImageActions.getImagesByProduct(productId));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(productImageActions.actionFailed(errorMsg));
    notification.error({
      title: "Tải ảnh thất bại",
      description: errorMsg,
    });
  }
}

function* handleDeleteImage(action: PayloadAction<{ productId: string; imageId: string }>) {
  try {
    const { productId, imageId } = action.payload;
    yield call(productImageApi.delete, imageId);
    yield put(productImageActions.deleteImageSuccess());
    notification.success({
      title: "Thành công",
      description: "Xóa ảnh thành công",
    });
    yield put(productImageActions.getImagesByProduct(productId));
  } catch (error: unknown) {
    const errorMsg = getErrorMessage(error);
    yield put(productImageActions.actionFailed(errorMsg));
    notification.error({
      title: "Xóa ảnh thất bại",
      description: errorMsg,
    });
  }
}

export default function* watchProductImageFlow() {
  yield takeLatest(productImageActions.getImagesByProduct.type, handleGetImagesByProduct);
  yield takeLatest(productImageActions.uploadImage.type, handleUploadImage);
  yield takeLatest(productImageActions.deleteImage.type, handleDeleteImage);
}

