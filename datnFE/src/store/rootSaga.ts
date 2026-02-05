import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";
import { voucherSaga } from "../redux/Voucher/voucherSaga";


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),
    fork(voucherSaga),
  ]);
}