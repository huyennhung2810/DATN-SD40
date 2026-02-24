import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";
import statisticsSaga from "../redux/statistics/statisticsSaga";
import shiftHandoverSaga from "../redux/shiftHandover/shiftHandoverSaga";


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),
    fork(statisticsSaga),
    fork(shiftHandoverSaga),
  ]);
}