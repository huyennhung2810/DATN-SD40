import { call, put, takeLatest } from "redux-saga/effects";
import { ghnApi } from "../../api/ghnApi";
import { message } from "antd";
import {
  fetchProvincesSuccess,
  fetchProvincesFailure,
  fetchDistrictsSuccess,
  fetchDistrictsFailure,
  fetchWardsSuccess,
  fetchWardsFailure,
  calculateShippingFeeRequest,
  calculateShippingFeeSuccess,
  calculateShippingFeeFailure,
  fetchDistrictsPending,
  fetchWardsPending,
  calculateShippingFeePending,
  SHIPPING_FETCH_PROVINCES,
  SHIPPING_FETCH_DISTRICTS,
  SHIPPING_FETCH_WARDS,
  SHIPPING_CALCULATE_FEE,
} from "./shippingSlice";

// ---- Provinces ----
function* handleFetchProvinces(): any {
  try {
    const res = yield call(ghnApi.getProvinces);
    if (res.code !== 200) throw new Error(res.message);
    yield put(fetchProvincesSuccess(res.data));
  } catch (error: any) {
    yield put(fetchProvincesFailure(error.message));
  }
}

// ---- Districts ----
function* handleFetchDistricts(action: any): any {
  try {
    yield put(fetchDistrictsPending());
    const res = yield call(ghnApi.getDistricts, action.payload);
    if (res.code !== 200) throw new Error(res.message);
    yield put(fetchDistrictsSuccess(res.data));
  } catch (error: any) {
    yield put(fetchDistrictsFailure(error.message));
  }
}

// ---- Wards ----
function* handleFetchWards(action: any): any {
  try {
    yield put(fetchWardsPending());
    const res = yield call(ghnApi.getWards, action.payload);
    if (res.code !== 200) throw new Error(res.message);
    yield put(fetchWardsSuccess(res.data));
  } catch (error: any) {
    yield put(fetchWardsFailure(error.message));
  }
}

// ---- Shipping Fee ----
function* handleCalculateFee(action: any): any {
  try {
    yield put(calculateShippingFeePending());
    const res = yield call(ghnApi.calculateFee, action.payload);
    if (res.code !== 200) throw new Error(res.message);
    yield put(calculateShippingFeeSuccess(res.data.total));
  } catch (error: any) {
    yield put(calculateShippingFeeFailure(error.message));
  }
}

// ---- Root ----
export function* shippingSaga() {
  yield takeLatest(SHIPPING_FETCH_PROVINCES, handleFetchProvinces);
  yield takeLatest(SHIPPING_FETCH_DISTRICTS, handleFetchDistricts);
  yield takeLatest(SHIPPING_FETCH_WARDS, handleFetchWards);
  yield takeLatest(SHIPPING_CALCULATE_FEE, handleCalculateFee);
}

