import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";
import watchSerialFlow from "../redux/serial/serialSaga";
import watchColorFlow from "../redux/color/colorSaga";
import watchStorageFlow from "../redux/storage/storageSaga";


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),
    fork(watchSerialFlow),
    fork(watchColorFlow),
    fork(watchStorageFlow)
  ]);
}