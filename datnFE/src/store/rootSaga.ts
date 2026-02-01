import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";
import watchProductCategoryFlow from "../redux/productCategory/productCategorySaga";
import watchTechSpecFlow from "../redux/techSpec/techSpecSaga";
import watchProductFlow from "../redux/product/productSaga";
import watchProductImageFlow from "../redux/productImage/productImageSaga";


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),
    fork(watchProductCategoryFlow),
    fork(watchTechSpecFlow),
    fork(watchProductFlow),
    fork(watchProductImageFlow),
  ]);
}