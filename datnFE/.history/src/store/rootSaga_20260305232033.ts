import { all, fork } from "redux-saga/effects";
import watchCustomerFlow from "../redux/customer/customerSaga";
import watchEmployeeFlow from "../redux/employee/employeeSaga";
import statisticsSaga from "../redux/statistics/statisticsSaga";
import shiftHandoverSaga from "../redux/shiftHandover/shiftHandoverSaga";
import { voucherSaga } from "../redux/Voucher/voucherSaga";
import { discountSaga } from "../redux/discount/discountSaga"; 
import shiftTemplateSaga from "../redux/shiftTemplate/ShiftTemplateSaga";
import watchProductCategoryFlow from "../redux/productCategory/productCategorySaga";
import watchTechSpecFlow from "../redux/techSpec/techSpecSaga";
import watchProductFlow from "../redux/product/productSaga";
import watchProductImageFlow from "../redux/productImage/productImageSaga";
import watchSensorTypeFlow from "../redux/techSpec/sensorTypeSaga";
import watchLensMountFlow from "../redux/techSpec/lensMountSaga";
import watchResolutionFlow from "../redux/techSpec/resolutionSaga";
import watchProcessorFlow from "../redux/techSpec/processorSaga";
import watchImageFormatFlow from "../redux/techSpec/imageFormatSaga";
import watchVideoFormatFlow from "../redux/techSpec/videoFormatSaga";


export default function* rootSaga() {
  yield all([
    fork(watchCustomerFlow),
    fork(watchEmployeeFlow),
    fork(statisticsSaga),
    fork(voucherSaga),
    fork(discountSaga),
    fork(shiftHandoverSaga),
    fork(shiftTemplateSaga),
=======
    fork(watchProductCategoryFlow),
    fork(watchTechSpecFlow),
    fork(watchProductFlow),
    fork(watchProductImageFlow),
    fork(watchSensorTypeFlow),
    fork(watchLensMountFlow),
    fork(watchResolutionFlow),
    fork(watchProcessorFlow),
    fork(watchImageFormatFlow),
    fork(watchVideoFormatFlow),
>>>>>>> origin/feature/clientHome-finalProductModule
  ]);
}