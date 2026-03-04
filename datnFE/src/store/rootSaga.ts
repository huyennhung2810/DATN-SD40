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
import watchBannerFlow from "../redux/banner/bannerSaga";


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
    fork(discountSaga),
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
    fork(watchBannerFlow),
    fork(statisticsSaga),
    fork(voucherSaga),
    fork(discountSaga),
  ]);
}