import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";

import statisticsSaga from "../redux/statistics/statisticsSaga";


import { voucherSaga } from "../redux/Voucher/voucherSaga";
import { discountSaga } from "../redux/discount/discountSaga"; 


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),

    fork(statisticsSaga),

    fork(voucherSaga),
    fork(discountSaga),

  ]);
}