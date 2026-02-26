import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";
import watchSerialFlow from "../redux/serial/serialSaga";
import watchColorFlow from "../redux/color/colorSaga";
import watchStorageFlow from "../redux/storage/storageSaga";

import statisticsSaga from "../redux/statistics/statisticsSaga";


import { voucherSaga } from "../redux/Voucher/voucherSaga";
import { discountSaga } from "../redux/discount/discountSaga"; 
import watchProductDetailFlow from "../redux/productdetail/productDetailSaga";


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),
    fork(watchSerialFlow),
    fork(watchProductDetailFlow),
    fork(watchColorFlow),
    fork(watchStorageFlow),
    fork(statisticsSaga),
    fork(voucherSaga),
    fork(discountSaga)
  ]);
}