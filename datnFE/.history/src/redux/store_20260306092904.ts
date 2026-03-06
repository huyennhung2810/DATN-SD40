import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import customerReducer from "./customer/customerSlice";
import rootSaga from "../store/rootSaga";
const sagaMiddleware = createSagaMiddleware();
import employeeReducer from "./employee/employeeSlice";
import serialReducer from "./serial/serialSlice";
import colorReducer from "./color/colorSlice";
import storageCapacityReducer from "./storage/storageSlice";

import statisticsReducer from "./statistics/statisticsSlice";

import discountReducer from "../redux/discount/discountSlice"; // Kiểm tra lại đường dẫn này
import productDetailReducer from "./productdetail/productDetailSlice";
import productCategoryReducer from "./productCategory/productCategorySlice";
import techSpecReducer from "./techSpec/techSpecSlice";
import productReducer from "./product/productSlice";
import productImageReducer from "./productImage/productImageSlice";
import sensorTypeReducer from "./techSpec/sensorTypeSlice";
import lensMountReducer from "./techSpec/lensMountSlice";
import resolutionReducer from "./techSpec/resolutionSlice";
import processorReducer from "./techSpec/processorSlice";
import imageFormatReducer from "./techSpec/imageFormatSlice";
import videoFormatReducer from "./techSpec/videoFormatSlice";
import bannerReducer from "./banner/bannerSlice";
import voucherReducer from "./Voucher/voucherSlice"; 
import shiftHandoverReducer from "./shiftHandover/shiftHandoverSlice";
import shiftTemplateReducer from "./shiftTemplate/ShiftTemplateSlice";
import discountReducer from "../redux/discount/discountSlice";
import productCategoryReducer from "./productCategory/productCategorySlice";
import techSpecReducer from "./techSpec/techSpecSlice";
import productReducer from "./product/productSlice";
import productImageReducer from "./productImage/productImageSlice";
import sensorTypeReducer from "./techSpec/sensorTypeSlice";
import lensMountReducer from "./techSpec/lensMountSlice";
import resolutionReducer from "./techSpec/resolutionSlice";
import processorReducer from "./techSpec/processorSlice";
import imageFormatReducer from "./techSpec/imageFormatSlice";
import videoFormatReducer from "./techSpec/videoFormatSlice";


export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employee: employeeReducer,
    statistics: statisticsReducer,
    voucher: voucherReducer,
    discount: discountReducer,
    shiftHandover: shiftHandoverReducer,
    shiftTemplate: shiftTemplateReducer,
    serial: serialReducer,
    productDetail: productDetailReducer,
    color: colorReducer,
    storage: storageCapacityReducer,

    statistics: statisticsReducer,
    //voucher: voucherReducer, // Đăng ký voucher reducer vào store
    discount: discountReducer,
    productCategory: productCategoryReducer,
    techSpec: techSpecReducer,
    product: productReducer,
    productImage: productImageReducer,
    sensorType: sensorTypeReducer,
    lensMount: lensMountReducer,
    resolution: resolutionReducer,
    processor: processorReducer,
    imageFormat: imageFormatReducer,
    videoFormat: videoFormatReducer,
=======
    banner: bannerReducer,
    voucher: voucherReducer,
    shiftHandover: shiftHandoverReducer
>>>>>>> origin/hungbt3103
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;